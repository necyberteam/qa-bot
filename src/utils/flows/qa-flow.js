import { handleBotError } from '../error-handler';
import { getApiEndpoint, getRatingEndpoint } from '../../config/constants';

/**
 * Creates the Q&A conversation flow
 *
 * @param {Object} params Configuration
 * @param {Function} params.fetchAndStreamResponse Function to fetch and stream responses
 * @param {string} params.sessionId Current session ID
 * @param {string} params.currentQueryId Current query ID
 * @returns {Object} Q&A flow configuration
 */
export const createQAFlow = ({ fetchAndStreamResponse, sessionId, currentQueryId, apiKey }) => {
  // Track the query ID for the most recent response that can receive feedback
  let feedbackQueryId = null;

  return {
    go_ahead_and_ask: {
      message: "Please type your question.",
      path: "qa_loop"
    },
    qa_loop: {
      message: async (chatState) => {
        const { userInput } = chatState;

        // Handle feedback first if it's feedback
        if (userInput === "👍 Helpful" || userInput === "👎 Not helpful") {
          console.log('Feedback clicked:', userInput);
          console.log('Check values - apiKey:', !!apiKey, 'sessionId:', !!sessionId, 'feedbackQueryId:', !!feedbackQueryId);
          
          // Send feedback using the captured query ID
          if (apiKey && sessionId && feedbackQueryId) {
            console.log('All values present, sending feedback...');
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
            console.log('Sending to endpoint:', endpoint);

            try {
              await fetch(endpoint, {
                method: 'POST',
                headers
              });
              console.log('Feedback sent successfully');
            } catch (error) {
              console.error('Error sending feedback:', error);
            }
          } else {
            console.log('Missing required values for feedback');
          }
          return "Thanks for the feedback! Feel free to ask another question.";
        } else {
          // Process as a question - fetch response directly
          try {
            // Capture the current query ID for feedback
            console.log('Processing question, currentQueryId:', currentQueryId);
            feedbackQueryId = currentQueryId;
            console.log('Set feedbackQueryId to:', feedbackQueryId);
            
            const headers = {
              'Content-Type': 'application/json',
              'X-Origin': 'access',
              'X-API-KEY': apiKey,
              'X-Session-ID': sessionId,
              'X-Query-ID': currentQueryId
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
            
            // Update feedbackQueryId to the actual query ID that was processed
            feedbackQueryId = currentQueryId;
            
            // Inject the response
            await chatState.injectMessage(text);
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