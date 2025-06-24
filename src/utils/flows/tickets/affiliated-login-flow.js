import { 
  createFileUploadComponent, 
  createSubmissionHandler, 
  generateSuccessMessage,
  getFileInfo
} from './ticket-flow-utils';
import { getCurrentTicketForm, getCurrentFormWithUserInfo } from '../../flow-context-utils';

/**
 * Creates the affiliated/resource provider login help ticket flow
 *
 * @param {Object} params Configuration
 * @param {Object} params.ticketForm Form state for help tickets
 * @param {Function} params.setTicketForm Function to update ticket form
 * @returns {Object} Affiliated login flow configuration
 */
export const createAffiliatedLoginFlow = ({ ticketForm = {}, setTicketForm = () => {}, userInfo = {} }) => {
  const { submitTicket, getSubmissionResult } = createSubmissionHandler(setTicketForm);
  const fileUploadElement = createFileUploadComponent(setTicketForm, ticketForm);


  return {
    // PATH: Affiliated/Resource Provider Login Help Path
    affiliated_help: {
      message: "If you're having trouble logging into an affiliated infrastructure or resource provider, here are some common issues:\n\n" +
               "• Ensure your allocation is active\n" +
               "• Confirm you have the correct username for that resource\n" +
               "• Check <a href=\"https://operations.access-ci.org/infrastructure_news_view\">System Status News</a> to see if the resource is undergoing maintenance\n\n" +
               "Would you like to submit a help ticket for resource provider login issues?",
      options: ["Yes, let's create a ticket", "Back to Main Menu"],
      chatDisabled: true,
      renderHtml: ["BOT"],
      path: (chatState) =>
        chatState.userInput === "Yes, let's create a ticket"
          ? "affiliated_login_resource"
          : "start"
    },

    // FORM flow - Affiliated/Resource Login
    affiliated_login_resource: {
      message: "Which ACCESS Resource are you trying to access?",
      options: [
        "ACES",
        "Anvil", 
        "Bridges-2",
        "DARWIN",
        "Delta",
        "DeltaAI",
        "Derecho",
        "Expanse",
        "FASTER",
        "Granite",
        "Jetstream2",
        "KyRIC",
        "Launch",
        "Neocortex",
        "Ookami",
        "Open Science Grid",
        "Open Storage Network",
        "Ranch",
        "Stampede3"
      ],
      chatDisabled: true,
      function: (chatState) => {
        const currentForm = getCurrentTicketForm();
        setTicketForm({...currentForm, resource: chatState.userInput});
      },
      path: "affiliated_login_userid"
    },
    affiliated_login_userid: {
      message: "What is your user ID at the resource?",
      function: (chatState) => {
        const currentForm = getCurrentTicketForm();
        setTicketForm({...currentForm, userIdResource: chatState.userInput});
      },
      path: "affiliated_login_description"
    },
    affiliated_login_description: {
      message: "Please describe the issue you're having logging in.",
      function: (chatState) => {
        // Pre-populate form with user info on first step
        const currentForm = getCurrentTicketForm();
        const updatedForm = {
          ...currentForm,
          description: chatState.userInput,
          email: userInfo.email || currentForm.email,
          name: userInfo.name || currentForm.name,
          accessId: userInfo.username || currentForm.accessId
        };
        setTicketForm(updatedForm);
      },
      path: "affiliated_login_attachment"
    },
    affiliated_login_attachment: {
      message: "Would you like to attach a screenshot?",
      options: ["Yes", "No"],
      chatDisabled: true,
      function: (chatState) => {
        const currentForm = getCurrentTicketForm();
        setTicketForm({...currentForm, wantsAttachment: chatState.userInput});
      },
      path: (chatState) => chatState.userInput === "Yes"
        ? "affiliated_login_upload"
        : ((chatState) => {
            const formWithUserInfo = getCurrentFormWithUserInfo(userInfo);
            if (!formWithUserInfo.email) return "affiliated_login_email";
            if (!formWithUserInfo.name) return "affiliated_login_name";
            if (!formWithUserInfo.accessId) return "affiliated_login_accessid";
            return "affiliated_login_summary";
          })()
    },
    affiliated_login_upload: {
      message: "Please upload your screenshot.",
      component: fileUploadElement,
      options: ["Continue"],
      chatDisabled: true,
      function: () => {
        const currentForm = getCurrentTicketForm();
        setTicketForm({...currentForm, uploadConfirmed: true});
      },
      path: (chatState) => {
        const formWithUserInfo = getCurrentFormWithUserInfo(userInfo);
        if (!formWithUserInfo.email) return "affiliated_login_email";
        if (!formWithUserInfo.name) return "affiliated_login_name";
        if (!formWithUserInfo.accessId) return "affiliated_login_accessid";
        return "affiliated_login_summary";
      }
    },
    affiliated_login_email: {
      message: "What is your email?",
      function: (chatState) => {
        const currentForm = getCurrentTicketForm();
        setTicketForm({...currentForm, email: chatState.userInput});
      },
      path: (chatState) => {
        const formWithUserInfo = getCurrentFormWithUserInfo(userInfo);
        if (!formWithUserInfo.name) return "affiliated_login_name";
        if (!formWithUserInfo.accessId) return "affiliated_login_accessid";
        return "affiliated_login_summary";
      }
    },
    affiliated_login_name: {
      message: "What is your name?",
      function: (chatState) => {
        const currentForm = getCurrentTicketForm();
        setTicketForm({...currentForm, name: chatState.userInput});
      },
      path: (chatState) => {
        const formWithUserInfo = getCurrentFormWithUserInfo(userInfo);
        if (!formWithUserInfo.accessId) return "affiliated_login_accessid";
        return "affiliated_login_summary";
      }
    },
    affiliated_login_accessid: {
      message: "What is your ACCESS ID?",
      function: (chatState) => {
        const currentForm = getCurrentTicketForm();
        setTicketForm({...currentForm, accessId: chatState.userInput});
      },
      path: "affiliated_login_summary"
    },
        affiliated_login_summary: {
      message: (chatState) => {
        const currentForm = getCurrentTicketForm();
        const formWithUserInfo = getCurrentFormWithUserInfo(userInfo);
        // Use current form state directly since Form Context always has fresh data
        const fileInfo = getFileInfo(currentForm.uploadedFiles);

        // Handle ACCESS ID timing issue - if coming from accessid step, use the input directly
        let finalAccessId = formWithUserInfo.accessId;
        if (chatState.prevPath === 'affiliated_login_accessid' && chatState.userInput) {
          finalAccessId = chatState.userInput;
        } else if (!finalAccessId && chatState.prevPath === 'affiliated_login_accessid') {
          finalAccessId = chatState.userInput;
        }

        return `Thank you for providing your resource login issue details. Here's a summary:\n\n` +
               `Name: ${formWithUserInfo.name || 'Not provided'}\n` +
               `Email: ${formWithUserInfo.email || 'Not provided'}\n` +
               `ACCESS ID: ${finalAccessId || 'Not provided'}\n` +
               `Resource: ${currentForm.resource || 'Not provided'}\n` +
               `Resource User ID: ${currentForm.userIdResource || 'Not provided'}\n` +
               `Issue Description: ${currentForm.description || 'Not provided'}${fileInfo}\n\n` +
               `Would you like to submit this ticket?`;
      },
      options: ["Submit Ticket", "Back to Main Menu"],
      chatDisabled: true,
      function: async (chatState) => {
        if (chatState.userInput === "Submit Ticket") {
          const currentForm = getCurrentTicketForm();
          const formWithUserInfo = getCurrentFormWithUserInfo(userInfo);
          const formData = {
            email: formWithUserInfo.email || "",
            userName: formWithUserInfo.name || "",
            accessId: formWithUserInfo.accessId || "",
            accessResource: currentForm.resource || "",
            description: currentForm.description || "",
            // ProForma field for request type 31
            userIdAtResource: currentForm.userIdResource || ""
          };

          await submitTicket(formData, 'loginProvider', currentForm.uploadedFiles || []);
        }
      },
      path: (chatState) => {
        if (chatState.userInput === "Submit Ticket") {
          return "affiliated_login_success";
        } else {
          return "start";
        }
      }
    },
    affiliated_login_success: {
      message: () => {
        return generateSuccessMessage(getSubmissionResult(), 'resource login ticket');
      },
      options: ["Back to Main Menu"],
      chatDisabled: true,
      renderHtml: ["BOT"],
      path: "start"
    }
  };
};