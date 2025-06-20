import { handleBotError } from '../error-handler';

/**
 * Creates the Q&A conversation flow
 *
 * @param {Object} params Configuration
 * @param {Function} params.fetchAndStreamResponse Function to fetch and stream responses
 * @returns {Object} Q&A flow configuration
 */
export const createQAFlow = ({ fetchAndStreamResponse }) => {
  return {
    go_ahead_and_ask: {
      message: "Please type your question.",
      path: "qa_loop"
    },
    qa_loop: {
      message: async (chatState) => {
        try {
          // The current handleQuery function streams directly and doesn't return a value
          // It handles errors internally by injecting error messages
          await fetchAndStreamResponse(chatState);

          // Return empty string since the response is already streamed
          return "";
        } catch (error) {
          console.error('Error in bot flow:', error);
          return handleBotError(error);
        }
      },
      options: ["Back to Main Menu"],
      chatDisabled: true,
      renderHtml: ["BOT"],
      path: "start"
    }
  };
};