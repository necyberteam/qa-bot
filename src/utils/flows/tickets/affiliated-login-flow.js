import React from 'react';
import { 
  createFileUploadComponent, 
  createSubmissionHandler, 
  generateSuccessMessage,
  getCurrentAccessId,
  getFileInfo
} from './ticket-flow-utils';

/**
 * Creates the affiliated/resource provider login help ticket flow
 *
 * @param {Object} params Configuration
 * @param {Object} params.ticketForm Form state for help tickets
 * @param {Function} params.setTicketForm Function to update ticket form
 * @returns {Object} Affiliated login flow configuration
 */
export const createAffiliatedLoginFlow = ({ ticketForm = {}, setTicketForm = () => {} }) => {
  const { submitTicket, getSubmissionResult } = createSubmissionHandler(setTicketForm);
  const fileUploadElement = createFileUploadComponent(setTicketForm, ticketForm);

  return {
    // PATH: Affiliated/Resource Provider Login Help Path
    affiliated_help: {
      message: "If you're having trouble logging into an affiliated infrastructure or resource provider, here are some common issues:\n\n" +
               "• Ensure your allocation is active\n" +
               "• Confirm you have the correct username for that resource\n" +
               "• Check if the resource is undergoing maintenance\n\n" +
               "Would you like to submit a help ticket for resource provider login issues?",
      options: ["Create Resource Login Ticket", "Back to Main Menu"],
      chatDisabled: true,
      path: (chatState) =>
        chatState.userInput === "Create Resource Login Ticket"
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
      function: (chatState) => setTicketForm({...ticketForm, resource: chatState.userInput}),
      path: "affiliated_login_userid"
    },
    affiliated_login_userid: {
      message: "What is your user ID at the resource?",
      function: (chatState) => setTicketForm({...ticketForm, userIdResource: chatState.userInput}),
      path: "affiliated_login_description"
    },
    affiliated_login_description: {
      message: "Please describe the issue you're having logging in.",
      function: (chatState) => setTicketForm({...ticketForm, description: chatState.userInput}),
      path: "affiliated_login_attachment"
    },
    affiliated_login_attachment: {
      message: "Would you like to attach a screenshot?",
      options: ["Yes", "No"],
      chatDisabled: true,
      function: (chatState) => setTicketForm({...ticketForm, wantsAttachment: chatState.userInput}),
      path: (chatState) => chatState.userInput === "Yes"
        ? "affiliated_login_upload"
        : "affiliated_login_email"
    },
    affiliated_login_upload: {
      message: "Please upload your screenshot.",
      component: fileUploadElement,
      options: ["Continue"],
      chatDisabled: true,
      function: () => setTicketForm({...ticketForm, uploadConfirmed: true}),
      path: "affiliated_login_email"
    },
    affiliated_login_email: {
      message: "What is your email?",
      function: (chatState) => setTicketForm({...ticketForm, email: chatState.userInput}),
      path: "affiliated_login_name"
    },
    affiliated_login_name: {
      message: "What is your name?",
      function: (chatState) => setTicketForm({...ticketForm, name: chatState.userInput}),
      path: "affiliated_login_accessid"
    },
    affiliated_login_accessid: {
      message: "What is your ACCESS ID?",
      function: (chatState) => setTicketForm({...ticketForm, accessId: chatState.userInput}),
      path: "affiliated_login_summary"
    },
        affiliated_login_summary: {
      message: (chatState) => {
        const currentAccessId = getCurrentAccessId(chatState, ticketForm, 'affiliated_login_accessid');
        const fileInfo = getFileInfo(ticketForm.uploadedFiles);

        return `Thank you for providing your resource login issue details. Here's a summary:\n\n` +
               `Name: ${ticketForm.name || 'Not provided'}\n` +
               `Email: ${ticketForm.email || 'Not provided'}\n` +
               `ACCESS ID: ${currentAccessId}\n` +
               `Resource: ${ticketForm.resource || 'Not provided'}\n` +
               `Resource User ID: ${ticketForm.userIdResource || 'Not provided'}\n` +
               `Issue Description: ${ticketForm.description || 'Not provided'}${fileInfo}\n\n` +
               `Would you like to submit this ticket?`;
      },
      options: ["Submit Ticket", "Back to Main Menu"],
      chatDisabled: true,
      function: async (chatState) => {
        if (chatState.userInput === "Submit Ticket") {
          const formData = {
            email: ticketForm.email || "",
            userName: ticketForm.name || "",
            accessId: ticketForm.accessId || "",
            accessResource: ticketForm.resource || "",
            description: ticketForm.description || "",
            // ProForma field for request type 31
            userIdAtResource: ticketForm.userIdResource || ""
          };

          await submitTicket(formData, 'loginProvider', ticketForm.uploadedFiles || []);
        }
      },
      path: "affiliated_login_success"
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