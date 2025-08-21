import { handleBotError } from '../error-handler';
import { DEFAULT_CONFIG, getMetricsRatingEndpoint } from '../../config/constants';

/**
 * Creates the metrics conversation flow
 *
 * @param {Object} params Configuration
 * @param {Function} params.fetchAndStreamResponse Function to fetch and stream responses
 * @param {string} params.sessionId Current session ID
 * @param {string} params.currentQueryId Current query ID
 * @param {string} params.apiKey API key for authentication
 * @returns {Object} Metrics flow configuration
 */
export const createMetricsFlow = ({ fetchAndStreamResponse, sessionId, currentQueryId, apiKey }) => {
  return {
    metrics_intro: {
      message: `What is your question about usage and performance metrics? You can see some <a target="_blank" href="${DEFAULT_CONFIG.EXAMPLE_METRICS_QUESTIONS_URL}">examples here</a>.`,
      renderHtml: ["BOT"],
      path: "metrics_loop"
    },
    metrics_loop: {
      message: async (chatState) => {
        try {
          await fetchAndStreamResponse(chatState);
          return "Was this helpful?";
        } catch (error) {
          console.error('Error in metrics flow:', error);
          return handleBotError(error);
        }
      },
      renderMarkdown: ["BOT"],
      options: ["👍 Yes", "👎 No"],
      chatDisabled: false,
      function: async (chatState) => {
        if (chatState.userInput === "👍 Yes" || chatState.userInput === "👎 No") {
          if (apiKey && sessionId) {
            const isPositive = chatState.userInput === "👍 Yes";
            const headers = {
              'Content-Type': 'application/json',
              'X-Origin': 'metrics',
              'X-API-KEY': apiKey,
              'X-Session-ID': sessionId,
              'X-Query-ID': currentQueryId,
              'X-Feedback': isPositive ? 1 : 0
            };

            try {
              await fetch(getMetricsRatingEndpoint(), {
                method: 'POST',
                headers
              });
            } catch (error) {
              console.error('Error sending metrics feedback:', error);
            }
          }
        }
      },
      path: (chatState) => {
        if (chatState.userInput === "👍 Yes") {
          return "metrics_positive_feedback";
        } else if (chatState.userInput === "👎 No") {
          return "metrics_negative_feedback";
        }
        return "metrics_loop";
      }
    },
    metrics_positive_feedback: {
      message: "Thank you for your feedback! It helps us improve this tool.",
      transition: { duration: 1000 },
      path: "metrics_intro"
    },
    metrics_negative_feedback: {
      message: "Sorry that wasn't useful. Would you like to ask another metrics question?",
      options: ["Ask another question", "Back to Main Menu"],
      chatDisabled: true,
      path: (chatState) => {
        if (chatState.userInput === "Ask another question") {
          return "metrics_continue";
        }
        return "start";
      }
    },
    metrics_continue: {
      message: "Ask another metrics question, but remember that each question must stand alone.",
      path: "metrics_loop"
    }
  };
};
