import { handleBotError } from '../error-handler';
import { getApiEndpoint, getRatingEndpoint } from '../../config/constants';
import { v4 as uuidv4 } from 'uuid';
import { getProcessedText } from '../getProcessedText';

/**
 * Creates the Q&A conversation flow
 *
 * @param {Object} params Configuration
 * @param {string} params.sessionId Current session ID
 * @param {string} params.apiKey API key for requests
 * @returns {Object} Q&A flow configuration
 */
export const createQAFlow = ({ sessionId, apiKey }) => {
  // Track the query ID for the most recent response that can receive feedback
  let feedbackQueryId = null;

  return {
    go_ahead_and_ask: {
      message: "Please type your question about ACCESS below.",
      path: "qa_loop"
    },
    qa_loop: {
      message: async (chatState) => {
        const { userInput } = chatState;

        // Handle feedback first if it's feedback
        if (userInput === "👍 Helpful" || userInput === "👎 Not helpful") {

          // Send feedback using the captured query ID
          if (apiKey && sessionId && feedbackQueryId) {
            const isPositive = userInput === "👍 Helpful";
            const headers = {
              'Content-Type': 'application/json',
              'X-Origin': 'access',
              'X-API-KEY': apiKey,
              'X-Session-ID': sessionId,
              'X-Query-ID': feedbackQueryId,
              'X-Feedback': isPositive ? 1 : 0
            };

            const endpoint = getRatingEndpoint();

            try {
              await fetch(endpoint, {
                method: 'POST',
                headers
              });
            } catch (error) {
              console.error('Error sending feedback:', error);
            }
          }
          return "Thanks for the feedback! Ask another question about ACCESS or start a new chat.";
        } else {
          // Process as a question - fetch response directly
          try {
            // Generate our own query ID since we're bypassing useHandleAIQuery
            const queryId = uuidv4();
            feedbackQueryId = queryId;

            const headers = {
              'Content-Type': 'application/json',
              'X-Origin': 'access',
              'X-API-KEY': apiKey,
              'X-Session-ID': sessionId,
              'X-Query-ID': queryId
            };

            const response = await fetch(getApiEndpoint(), {
              method: 'POST',
              headers,
              body: JSON.stringify({
                query: userInput
              })
            });

            const body = await response.json();
            const text = body.response;
            const processedText = getProcessedText(text);


            // Inject the response
            await chatState.injectMessage(processedText);

            // Inject guidance message after a short delay to let options render first
            setTimeout(async () => {
              await chatState.injectMessage("Ask another question about ACCESS or start a new chat.");
            }, 100);

            return null;
          } catch (error) {
            console.error('Error in bot flow:', error);
            return handleBotError(error);
          }
        }
      },
      renderMarkdown: ["BOT"],
      options: (chatState) => {
        // Only show feedback options if the input isn't already feedback
        if (chatState.userInput === "👍 Helpful" || chatState.userInput === "👎 Not helpful") {
          return []; // No options after feedback is given
        }
        return ["👍 Helpful", "👎 Not helpful"];
      },
      chatDisabled: false,
      path: "qa_loop"
    }
  };
};