import { handleBotError } from '../error-handler';
import { DEFAULT_CONFIG, getMetricsApiEndpoint, getMetricsRatingEndpoint } from '../../config/constants';
import { v4 as uuidv4 } from 'uuid';
import { getProcessedText } from '../getProcessedText';

/**
 * Creates the metrics conversation flow
 *
 * @param {Object} params Configuration
 * @param {string} params.sessionId Current session ID
 * @param {string} params.apiKey API key for authentication
 * @returns {Object} Metrics flow configuration
 */
export const createMetricsFlow = ({ sessionId, apiKey }) => {
  // Track the query ID for the most recent response that can receive feedback
  let feedbackQueryId = null;
  return {
    metrics_intro: {
      message: `Please type your question about usage and performance metrics (XDMoD) below. You can see some <a target="_blank" href="${DEFAULT_CONFIG.EXAMPLE_METRICS_QUESTIONS_URL}">examples here</a>.`,
      renderHtml: ["BOT"],
      path: "metrics_loop"
    },
    metrics_loop: {
      message: async (chatState) => {
        const { userInput } = chatState;

        // Handle feedback first if it's feedback
        if (userInput === "👍 Helpful" || userInput === "👎 Not helpful") {

          // Send feedback using the captured query ID
          if (apiKey && sessionId && feedbackQueryId) {
            const isPositive = userInput === "👍 Helpful";
            const headers = {
              'Content-Type': 'application/json',
              'X-Origin': 'metrics',
              'X-API-KEY': apiKey,
              'X-Session-ID': sessionId,
              'X-Query-ID': feedbackQueryId,
              'X-Feedback': isPositive ? 1 : 0
            };

            const endpoint = getMetricsRatingEndpoint();

            try {
              await fetch(endpoint, {
                method: 'POST',
                headers
              });
            } catch (error) {
              console.error('Error sending metrics feedback:', error);
            }
          }
          return "Thanks for the feedback! Ask another question about usage and performance metrics (XDMoD) or start a new chat.";
        } else {
          // Process as a question - fetch response directly
          try {
            // Generate our own query ID since we're bypassing useHandleAIQuery
            const queryId = uuidv4();
            feedbackQueryId = queryId;

            const headers = {
              'Content-Type': 'application/json',
              'X-Origin': 'metrics',
              'X-API-KEY': apiKey,
              'X-Session-ID': sessionId,
              'X-Query-ID': queryId
            };

            const response = await fetch(getMetricsApiEndpoint(), {
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
              await chatState.injectMessage("Ask another question about usage and performance metrics (XDMoD) or start a new chat.");
            }, 100);

            return null;
          } catch (error) {
            console.error('Error in metrics flow:', error);
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
      path: "metrics_loop"
    },
  };
};
