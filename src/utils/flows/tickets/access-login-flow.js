import React from 'react';
import { 
  createFileUploadComponent, 
  createSubmissionHandler, 
  generateSuccessMessage,
  getCurrentAccessId,
  getFileInfo
} from './ticket-flow-utils';

/**
 * Creates the ACCESS login help ticket flow
 *
 * @param {Object} params Configuration
 * @param {Object} params.ticketForm Form state for help tickets
 * @param {Function} params.setTicketForm Function to update ticket form
 * @returns {Object} ACCESS login flow configuration
 */
export const createAccessLoginFlow = ({ ticketForm = {}, setTicketForm = () => {} }) => {
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
      options: ["Create ACCESS Login Ticket", "Back to Main Menu"],
      chatDisabled: true,
      path: (chatState) =>
        chatState.userInput === "Create ACCESS Login Ticket"
          ? "access_login_description"
          : "start"
    },

    // FORM flow - Access Login Form
    access_login_description: {
      message: "Describe your login issue.",
      function: (chatState) => setTicketForm({...ticketForm, description: chatState.userInput}),
      path: "access_login_identity"
    },
    access_login_identity: {
      message: "Which identity provider were you using?",
      options: ["ACCESS", "Github", "Google", "Institution", "Microsoft", "ORCID", "Other"],
      chatDisabled: true,
      function: (chatState) => setTicketForm({...ticketForm, identityProvider: chatState.userInput}),
      path: "access_login_browser"
    },
    access_login_browser: {
      message: "Which browser were you using?",
      options: ["Chrome", "Firefox", "Edge", "Safari", "Other"],
      chatDisabled: true,
      function: (chatState) => setTicketForm({...ticketForm, browser: chatState.userInput}),
      path: "access_login_attachment"
    },
    access_login_attachment: {
      message: "Would you like to attach a screenshot?",
      options: ["Yes", "No"],
      chatDisabled: true,
      function: (chatState) => setTicketForm({...ticketForm, wantsAttachment: chatState.userInput}),
      path: (chatState) => chatState.userInput === "Yes"
        ? "access_login_upload"
        : "access_login_email"
    },
    access_login_upload: {
      message: "Please upload your screenshot.",
      component: fileUploadElement,
      options: ["Continue"],
      chatDisabled: true,
      function: () => setTicketForm({...ticketForm, uploadConfirmed: true}),
      path: "access_login_email"
    },
    access_login_email: {
      message: "What is your email?",
      function: (chatState) => setTicketForm({...ticketForm, email: chatState.userInput}),
      path: "access_login_name"
    },
    access_login_name: {
      message: "What is your name?",
      function: (chatState) => setTicketForm({...ticketForm, name: chatState.userInput}),
      path: "access_login_accessid"
    },
    access_login_accessid: {
      message: "What is your ACCESS ID?",
      function: (chatState) => setTicketForm({...ticketForm, accessId: chatState.userInput}),
      path: "access_login_summary"
    },
    access_login_summary: {
      message: (chatState) => {
        const currentAccessId = getCurrentAccessId(chatState, ticketForm, 'access_login_accessid');
        const fileInfo = getFileInfo(ticketForm.uploadedFiles);

        return `Thank you for providing your ACCESS login issue details. Here's a summary:\n\n` +
               `Name: ${ticketForm.name || 'Not provided'}\n` +
               `Email: ${ticketForm.email || 'Not provided'}\n` +
               `ACCESS ID: ${currentAccessId}\n` +
               `Identity Provider: ${ticketForm.identityProvider || 'Not provided'}\n` +
               `Browser: ${ticketForm.browser || 'Not provided'}\n` +
               `Issue Description: ${ticketForm.description || 'Not provided'}${fileInfo}\n\n` +
               `Would you like to submit this ticket?`;
      },
      options: ["Submit Ticket", "Back to Main Menu"],
      chatDisabled: true,
      renderHtml: ["BOT", "USER"],
      function: async (chatState) => {
        if (chatState.userInput === "Submit Ticket") {
          const formData = {
            email: ticketForm.email || "",
            userName: ticketForm.name || "",
            accessId: ticketForm.accessId || "",
            description: ticketForm.description || "",
            // ProForma fields for request type 30
            identityProvider: ticketForm.identityProvider || "",
            browser: ticketForm.browser || ""
          };

          await submitTicket(formData, 'loginAccess', ticketForm.uploadedFiles || []);
        }
      },
      path: (chatState) => {
        // Always go to success page after submission attempt
        return "access_login_success";
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