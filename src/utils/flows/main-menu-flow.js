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
        "Ask a question about ACCESS", // AI loop
        "Open a Help Ticket", // Jira Ticket
        "Provide feedback to ACCESS", // Feedback
        "Report a security issue" // Security
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
        } else if (chatState.userInput === "Report a security issue") {
          // Reset form data
          setTicketForm({});
          return "security_incident";
        }
        return "start";
      }
    }
  };
};