import { 
  createFileUploadComponent, 
  createSubmissionHandler, 
  generateSuccessMessage,
  getFileInfo
} from './ticket-flow-utils';
import { getCurrentTicketForm, getCurrentFormWithUserInfo } from '../../flow-context-utils';
import { createOptionalFieldValidator, processOptionalInput } from '../../optional-field-utils';
import { validateEmail } from '../../validation-utils';

/**
 * Creates the ACCESS login help ticket flow
 *
 * @param {Object} params Configuration
 * @param {Object} params.ticketForm Form state for help tickets
 * @param {Function} params.setTicketForm Function to update ticket form
 * @returns {Object} ACCESS login flow configuration
 */
export const createAccessLoginFlow = ({ ticketForm = {}, setTicketForm = () => {}, userInfo = {} }) => {
  const { submitTicket, getSubmissionResult } = createSubmissionHandler(setTicketForm);
  const fileUploadElement = createFileUploadComponent(setTicketForm, ticketForm);


  return {
    // PATH: ACCESS Login Help Path
    access_help: {
      message: "If you're having trouble logging into the ACCESS website, here are some common issues:\n\n" +
               "• Make sure you're using a supported browser (Chrome, Firefox, Safari)\n" +
               "• Clear your browser cookies and cache\n" +
               "• Check if you're using the correct identity provider\n\n" +
               "Would you like to submit a help ticket for ACCESS login issues?",
      options: ["Yes, let's create a ticket", "Back to Main Menu"],
      chatDisabled: true,
      path: (chatState) =>
        chatState.userInput === "Yes, let's create a ticket"
          ? "access_login_description"
          : "start"
    },

    // FORM flow - Access Login Form
    access_login_description: {
      message: "Describe your login issue.",
      function: (chatState) => {
        // Pre-populate form with user info on first step
        const currentForm = getCurrentTicketForm();
        const updatedForm = {
          ...currentForm,
          description: chatState.userInput,
          email: userInfo.email || currentForm.email,
          name: userInfo.name || currentForm.name,
          accessId: userInfo.accessId || currentForm.accessId
        };
        setTicketForm(updatedForm);
      },
      path: "access_login_identity"
    },
    access_login_identity: {
      message: "Which identity provider were you using?",
      options: ["ACCESS", "Github", "Google", "Institution", "Microsoft", "ORCID", "Other"],
      chatDisabled: true,
      function: (chatState) => {
        const currentForm = getCurrentTicketForm();
        setTicketForm({...currentForm, identityProvider: chatState.userInput});
      },
      path: "access_login_browser"
    },
    access_login_browser: {
      message: "Which browser were you using?",
      options: ["Chrome", "Firefox", "Edge", "Safari", "Other"],
      chatDisabled: true,
      function: (chatState) => {
        const currentForm = getCurrentTicketForm();
        setTicketForm({...currentForm, browser: chatState.userInput});
      },
      path: "access_login_attachment"
    },
    access_login_attachment: {
      message: "Would you like to attach a screenshot?",
      options: ["Yes", "No"],
      chatDisabled: true,
      function: (chatState) => {
        const currentForm = getCurrentTicketForm();
        setTicketForm({...currentForm, wantsAttachment: chatState.userInput});
      },
      path: (chatState) => chatState.userInput === "Yes"
        ? "access_login_upload"
        : (() => {
            const formWithUserInfo = getCurrentFormWithUserInfo(userInfo);
            if (!formWithUserInfo.email) return "access_login_email";
            if (!formWithUserInfo.name) return "access_login_name";
            if (!formWithUserInfo.accessId) return "access_login_accessid";
            return "access_login_summary";
          })()
    },
    access_login_upload: {
      message: "Please upload your screenshot.",
      component: fileUploadElement,
      options: ["Continue"],
      chatDisabled: true,
      function: () => {
        const currentForm = getCurrentTicketForm();
        setTicketForm({...currentForm, uploadConfirmed: true});
      },
      path: () => {
        const formWithUserInfo = getCurrentFormWithUserInfo(userInfo);
        if (!formWithUserInfo.email) return "access_login_email";
        if (!formWithUserInfo.name) return "access_login_name";
        if (!formWithUserInfo.accessId) return "access_login_accessid";
        return "access_login_summary";
      }
    },
    access_login_email: {
      message: "What is your email?",
      validateTextInput: (email) => validateEmail(email),
      function: (chatState) => {
        const currentForm = getCurrentTicketForm();
        setTicketForm({...currentForm, email: chatState.userInput});
      },
      path: () => {
        const formWithUserInfo = getCurrentFormWithUserInfo(userInfo);
        if (!formWithUserInfo.name) return "access_login_name";
        if (!formWithUserInfo.accessId) return "access_login_accessid";
        return "access_login_summary";
      }
    },
    access_login_name: {
      message: "What is your name?",
      function: (chatState) => {
        const currentForm = getCurrentTicketForm();
        setTicketForm({...currentForm, name: chatState.userInput});
      },
      path: () => {
        const formWithUserInfo = getCurrentFormWithUserInfo(userInfo);
        if (!formWithUserInfo.accessId) return "access_login_accessid";
        return "access_login_summary";
      }
    },
    access_login_accessid: {
      message: "What is your ACCESS ID? (Optional - press Enter to skip)",
      validateTextInput: createOptionalFieldValidator(),
      function: (chatState) => {
        const currentForm = getCurrentTicketForm();
        setTicketForm({...currentForm, accessId: processOptionalInput(chatState.userInput)});
      },
      path: "access_login_summary"
    },
    access_login_summary: {
      message: (chatState) => {
        const currentForm = getCurrentTicketForm();
        const formWithUserInfo = getCurrentFormWithUserInfo(userInfo);
        // Use current form state directly since Form Context always has fresh data
        const fileInfo = getFileInfo(currentForm.uploadedFiles);

        // Handle ACCESS ID timing issue - if coming from accessid step, use the input directly
        let finalAccessId = formWithUserInfo.accessId;
        if (chatState.prevPath === 'access_login_accessid' && chatState.userInput) {
          finalAccessId = chatState.userInput;
        } else if (!finalAccessId && chatState.prevPath === 'access_login_accessid') {
          finalAccessId = chatState.userInput;
        }

        return `Thank you for providing your ACCESS login issue details. Here's a summary:\n\n` +
               `Name: ${formWithUserInfo.name || 'Not provided'}\n` +
               `Email: ${formWithUserInfo.email || 'Not provided'}\n` +
               `ACCESS ID: ${finalAccessId || 'Not provided'}\n` +
               `Identity Provider: ${currentForm.identityProvider || 'Not provided'}\n` +
               `Browser: ${currentForm.browser || 'Not provided'}\n` +
               `Issue Description: ${currentForm.description || 'Not provided'}${fileInfo}\n\n` +
               `Would you like to submit this ticket?`;
      },
      options: ["Submit Ticket", "Back to Main Menu"],
      chatDisabled: true,
      renderHtml: ["BOT", "USER"],
      function: async (chatState) => {
        if (chatState.userInput === "Submit Ticket") {
          const currentForm = getCurrentTicketForm();
          const formWithUserInfo = getCurrentFormWithUserInfo(userInfo);
          const formData = {
            email: formWithUserInfo.email || "",
            name: formWithUserInfo.name || "",
            accessId: formWithUserInfo.accessId || "",
            description: currentForm.description || "",
            // ProForma fields for request type 30
            identityProvider: currentForm.identityProvider || "",
            browser: currentForm.browser || ""
          };

          await submitTicket(formData, 'loginAccess', currentForm.uploadedFiles || []);
        }
      },
      path: (chatState) => {
        if (chatState.userInput === "Submit Ticket") {
          return "access_login_success";
        } else {
          return "start";
        }
      }
    },
    access_login_success: {
      message: () => {
        return generateSuccessMessage(getSubmissionResult(), 'ACCESS login ticket');
      },
      options: ["Back to Main Menu"],
      chatDisabled: true,
      renderHtml: ["BOT"],
      path: "start"
    }
  };
};