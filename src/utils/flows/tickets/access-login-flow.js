import React from 'react';
import FileUploadComponent from '../../../components/FileUploadComponent';
import { prepareApiSubmission, sendPreparedDataToProxy } from '../../api-utils';

/**
 * Creates the ACCESS login help ticket flow
 *
 * @param {Object} params Configuration
 * @param {Object} params.ticketForm Form state for help tickets
 * @param {Function} params.setTicketForm Function to update ticket form
 * @returns {Object} ACCESS login flow configuration
 */
export const createAccessLoginFlow = ({ ticketForm = {}, setTicketForm = () => {} }) => {
  const fileUploadElement = (
    <FileUploadComponent
      onFileUpload={(files) =>
        setTicketForm({
          ...ticketForm,
          uploadedFiles: files
        })
      }
    />
  );

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
      message: "Which identity provider were you using? (e.g., InCommon, Google, ORCID)",
      function: (chatState) => setTicketForm({...ticketForm, identityProvider: chatState.userInput}),
      path: "access_login_browser"
    },
    access_login_browser: {
      message: "Which browser were you using?",
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
        // TODO: Right now we have to handle ACCESS ID specially using chatState.userInput because of React state timing issues,
        // and this only works because ACCESS ID is the last field collected before the summary.
        // Instead we should either: 1) fix the fundamental closure issue so message functions can access current state,
        // or 2) implement a more robust state management approach that doesn't depend on field collection order.
        const currentAccessId = chatState.prevPath === 'access_login_accessid' ? chatState.userInput : (ticketForm.accessId || 'Not provided');

        let fileInfo = '';
        if (ticketForm.uploadedFiles && ticketForm.uploadedFiles.length > 0) {
          fileInfo = `\nAttachments: ${ticketForm.uploadedFiles.length} file(s) attached`;
        }

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
      function: async (chatState) => {
        if (chatState.userInput === "Submit Ticket") {
          // OJO: we know how to do this better now, see dev example
          const formData = {
            email: ticketForm.email || "",
            customfield_10108: ticketForm.name || "",
            customfield_10103: ticketForm.accessId || "",
            description: ticketForm.description || "",
            summary: "ACCESS Login Issue",
            // Add proforma fields if they exist
            identity_provider: ticketForm.identityProvider || "",
            browser: ticketForm.browser || ""
          };

          // Also prepare API submission data for future implementation
          const apiData = await prepareApiSubmission(
            formData,
            'loginAccess',
            ticketForm.uploadedFiles || []
          );
          console.log("| 🌎 API submission for access login:", apiData);

          // NOTE: we are skipping the jira call for now
          // try {
          //   const proxyResponse = await sendPreparedDataToProxy(apiData, 'create-access-login-ticket');
          //   console.log("| 🌎 Access login proxy response:", proxyResponse);
          // } catch (error) {
          //   console.error("| ❌ Error sending access login data to proxy:", error);
          // }
        }
      },
      path: "access_login_success"
    },
    access_login_success: {
      message: "Thank you for submitting your ticket. We will follow up with you shortly.",
      options: ["Back to Main Menu"],
      chatDisabled: true,
      path: "start"
    }
  };
};