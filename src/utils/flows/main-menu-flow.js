/**
 * Creates the main menu conversation flow
 *
 * @param {Object} params Configuration
 * @param {string} params.welcome Welcome text
 * @param {Function} params.setTicketForm Function to reset ticket form
 * @param {Function} params.setFeedbackForm Function to reset feedback form
 * @returns {Object} Main menu flow configuration
 */
export const createMainMenuFlow = ({
  welcome,
  setTicketForm = () => {},
  setFeedbackForm = () => {}
}) => {
  return {
    start: {
      message: welcome,
      options: [
        "Ask a question about ACCESS",
        "Open a Help Ticket",
        "Provide feedback to ACCESS",
        "Open Dev Ticket"
      ],
      chatDisabled: true,
      path: (chatState) => {
        if (chatState.userInput === "Ask a question about ACCESS") {
          return "go_ahead_and_ask";
        } else if (chatState.userInput === "Open a Help Ticket") {
          // Reset form data
          setTicketForm({});
          return "help_ticket";
        } else if (chatState.userInput === "Provide feedback to ACCESS") {
          // Reset form data
          setFeedbackForm({});
          return "feedback";
        } else if (chatState.userInput === "Open Dev Ticket") {
          // Reset form data
          setTicketForm({});
          return "dev_ticket";
        }
        return "start";
      }
    }
  };
};