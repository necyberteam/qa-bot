/**
 * Creates the help ticket conversation flow by combining modular ticket flows
 *
 * @param {Object} params Configuration
 * @param {Object} params.ticketForm Form state for help tickets
 * @param {Function} params.setTicketForm Function to update ticket form
 * @returns {Object} Help ticket flow configuration
 */
import { createAccessLoginFlow } from './tickets/access-login-flow';
import { createAffiliatedLoginFlow } from './tickets/affiliated-login-flow';
import { createGeneralHelpFlow } from './tickets/general-help-flow';

export const createTicketFlow = ({ ticketForm = {}, setTicketForm = () => {} }) => {
  // Import flows from modular ticket files
  const accessLoginFlow = createAccessLoginFlow({ ticketForm, setTicketForm });
  const affiliatedLoginFlow = createAffiliatedLoginFlow({ ticketForm, setTicketForm });
  const generalHelpFlow = createGeneralHelpFlow({ ticketForm, setTicketForm });

  return {
    // Main ticket type selection
    help_ticket: {
      message: "What is your help ticket related to?",
      options: [
        "Logging into ACCESS website",
        "Logging into affiliated infrastructure",
        "Another question"
      ],
      chatDisabled: true,
      function: (chatState) => {
        setTicketForm({...ticketForm, ticketType: chatState.userInput});
      },
      path: (chatState) => {
        if (chatState.userInput === "Logging into ACCESS website") {
          return "access_help";
        } else if (chatState.userInput === "Logging into affiliated infrastructure") {
          return "affiliated_help";
        } else if (chatState.userInput === "Another question") {
          return "general_help_summary_subject";
        }
        return "help_ticket";
      }
    },

    // Combine all the modular flows
    ...accessLoginFlow,
    ...affiliatedLoginFlow,
    ...generalHelpFlow
  };
};