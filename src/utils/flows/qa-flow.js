import { handleBotError } from '../error-handler';
import { DEFAULT_CONFIG } from '../../config/constants';

/**
 * Creates the Q&A conversation flow
 *
 * @param {Object} params Configuration
 * @param {Function} params.fetchAndStreamResponse Function to fetch and stream responses
 * @param {string} params.sessionId Current session ID
 * @param {string} params.currentQueryId Current query ID
 * @returns {Object} Q&A flow configuration
 */
export const createQAFlow = ({ fetchAndStreamResponse, sessionId, currentQueryId }) => {
  return {
    go_ahead_and_ask: {
      message: "Please type your question.",
      path: "qa_loop"
    },
    qa_loop: {
      message: async (chatState) => {
        try {
          await fetchAndStreamResponse(chatState);
          return "Was this helpful?";
        } catch (error) {
          console.error('Error in bot flow:', error);
          return handleBotError(error);
        }
      },
      renderMarkdown: ["BOT"],
      options: ["👍 Yes", "👎 No"],
      chatDisabled: false,
      function: async (chatState) => {
        if (chatState.userInput === "👍 Yes" || chatState.userInput === "👎 No") {
          const apiKey = process.env.REACT_APP_API_KEY;
          if (apiKey && sessionId) {
            const isPositive = chatState.userInput === "👍 Yes";
            const headers = {
              'Content-Type': 'application/json',
              'X-Origin': 'access',
              'X-API-KEY': apiKey,
              'X-Session-ID': sessionId,
              'X-Query-ID': currentQueryId,
              'X-Feedback': isPositive ? 1 : 0
            };

            try {
              await fetch(`${DEFAULT_CONFIG.API_ENDPOINT}/rating`, {
                method: 'POST',
                headers
              });
            } catch (error) {
              console.error('Error sending feedback:', error);
            }
          }
        }
      },
      path: (chatState) => {
        if (chatState.userInput === "👍 Yes") {
          return "qa_positive_feedback";
        } else if (chatState.userInput === "👎 No") {
          return "qa_negative_feedback";
        }
        return "qa_loop";
      }
    },
    qa_positive_feedback: {
      message: "Thank you for your feedback! It helps us improve this tool.",
      transition: { duration: 1000 },
      path: "go_ahead_and_ask"
    },
    qa_negative_feedback: {
      message: "Sorry that wasn't useful. Would you like to open a help ticket for assistance?",
      options: ["Open a help ticket", "Ask another question"],
      chatDisabled: true,
      path: (chatState) => {
        if (chatState.userInput === "Open a help ticket") {
          return "help_ticket";
        }
        return "qa_continue";
      }
    },
    qa_continue: {
      message: "Ask another question, but remember that each question must stand alone.",
      path: "qa_loop"
    }
  };
};