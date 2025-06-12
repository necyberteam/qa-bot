import React from 'react';
import FileUploadComponent from '../../../components/FileUploadComponent';
import { prepareApiSubmission, sendPreparedDataToProxy } from '../../api-utils';

/**
 * Creates the affiliated/resource provider login help ticket flow
 *
 * @param {Object} params Configuration
 * @param {Object} params.ticketForm Form state for help tickets
 * @param {Function} params.setTicketForm Function to update ticket form
 * @returns {Object} Affiliated login flow configuration
 */
export const createAffiliatedLoginFlow = ({ ticketForm = {}, setTicketForm = () => {} }) => {
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
      message: "Please select the ACCESS Resource you are trying to access. Click the 'Continue' button when done.",
      checkboxes: {
        items: [
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
        min: 1,
        max: 19
      },
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
        // TODO: Right now we have to handle ACCESS ID specially using chatState.userInput because of React state timing issues,
        // and this only works because ACCESS ID is the last field collected before the summary.
        // Instead we should either: 1) fix the fundamental closure issue so message functions can access current state,
        // or 2) implement a more robust state management approach that doesn't depend on field collection order.
        const currentAccessId = chatState.prevPath === 'affiliated_login_accessid' ? chatState.userInput : (ticketForm.accessId || 'Not provided');

        let fileInfo = '';
        if (ticketForm.uploadedFiles && ticketForm.uploadedFiles.length > 0) {
          fileInfo = `\nAttachments: ${ticketForm.uploadedFiles.length} file(s) attached`;
        }

        console.log("| 🔍 Debug: Using ACCESS ID from chatState.userInput:", currentAccessId);

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
          // Prepare form data
          const formData = {
            email: ticketForm.email || "",
            customfield_10108: ticketForm.name || "",
            customfield_10103: ticketForm.accessId || "",
            customfield_10110: ticketForm.resource || "",
            description: ticketForm.description || "",
            summary: "Resource Provider Login Issue",
            // Add proforma fields if they exist
            user_id_resource: ticketForm.userIdResource || ""
          };

          // Also prepare API submission data for future implementation
          const apiData = await prepareApiSubmission(
            formData,
            'loginProvider',
            ticketForm.uploadedFiles || []
          );
          console.log("| 🌎 API submission data for affiliated login:", apiData);

          // NOTE: we are skipping the jira call for now for demo
          // try {
          //   const proxyResponse = await sendPreparedDataToProxy(apiData, 'create-affiliated-login-ticket');
          //   console.log("| 🌎 Resource login proxy response:", proxyResponse);
          // } catch (error) {
          //   console.error("| ❌ Error sending resource login data to proxy:", error);
          // }
        }
      },
      path: "affiliated_login_success"
    },
    affiliated_login_success: {
      message: "Thank you for submitting your ticket. We will follow up with you shortly.",
      options: ["Back to Main Menu"],
      chatDisabled: true,
      path: "start"
    }
  };
};