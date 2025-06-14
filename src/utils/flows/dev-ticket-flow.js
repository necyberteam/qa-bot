/**
 * Creates the dev ticket conversation flow
 *
 * @param {Object} params Configuration
 * @param {Object} params.ticketForm Form state for help tickets
 * @param {Function} params.setTicketForm Function to update ticket form
 * @returns {Object} Dev ticket flow configuration
 */
import React from 'react';
import FileUploadComponent from '../../components/FileUploadComponent';
import { prepareApiSubmission, sendPreparedDataToProxy } from '../api-utils';

// Email validation function
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const createDevTicketFlow = ({ ticketForm = {}, setTicketForm = () => {} }) => {
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
    dev_ticket: {
      message: "copy this email address so you don't have to type it later:   fake@test.com ",
      path: "dev_ticket_summary"
    },
    dev_ticket_summary: {
      message: "Please provide a summary of your issue.",
      function: (chatState) => {
        console.log("| 🔍 Debug: Setting summary:", chatState.userInput);
        setTicketForm({...ticketForm, summary: chatState.userInput});
        console.log("| 🔍 Debug: Current ticketForm after summary:", {...ticketForm, summary: chatState.userInput});
      },
      path: "dev_ticket_description"
    },
    dev_ticket_description: {
      message: "Please describe your issue in detail.",
      function: (chatState) => {
        console.log("| 🔍 Debug: Setting description:", chatState.userInput);
        setTicketForm({...ticketForm, description: chatState.userInput});
        console.log("| 🔍 Debug: Current ticketForm after description:", {...ticketForm, description: chatState.userInput});
      },
      path: "dev_ticket_attachment"
    },
    dev_ticket_attachment: {
      message: "Would you like to attach file(s)?",
      options: ["Yes", "No"],
      chatDisabled: true,
      function: (chatState) => setTicketForm({...ticketForm, wantsAttachment: chatState.userInput}),
      path: (chatState) => chatState.userInput === "Yes"
        ? "dev_ticket_upload"
        : "dev_ticket_keywords"
    },
    dev_ticket_upload: {
      message: "Please upload your file(s).",
      component: fileUploadElement,
      options: ["Continue"],
      chatDisabled: true,
      function: () => setTicketForm({...ticketForm, uploadConfirmed: true}),
      path: "dev_ticket_keywords"
    },
    dev_ticket_keywords: {
      message: "Please select up to 5 keywords that describe your issue. Click the 'Continue' button when done.",
      checkboxes: { items: ["C, C++", "Abaqus", "Algorithms", "API", "Bash", "CloudLab", "Docker", "Hadoop", "Jupyter", "MatLab", "VPN", "XML", "Other"], min: 0, max: 5 },
      chatDisabled: true,
      function: (chatState) => setTicketForm({...ticketForm, keywords: chatState.userInput}),
      path: (chatState) => {
        if (chatState.userInput && chatState.userInput.includes("Other")) {
          return "dev_ticket_additional_keywords";
        } else {
          return "dev_ticket_email";
        }
      }
    },
    dev_ticket_additional_keywords: {
      message: "Please enter additional keywords, separated by commas:",
      function: (chatState) => {
        // Get the current keywords selected from checkboxes
        const currentKeywords = ticketForm.keywords || [];
        const additionalKeywords = chatState.userInput;

        // Ensure we're working with arrays for consistency
        const keywordsArray = Array.isArray(currentKeywords)
          ? [...currentKeywords]
          : currentKeywords.split(',').map(k => k.trim());

        // Filter out "Other" from the keywords
        const filteredKeywords = keywordsArray.filter(k => k !== "Other");

        // Add the additional keywords
        const formattedKeywords = Array.isArray(filteredKeywords) && filteredKeywords.length > 0
          ? [...filteredKeywords, additionalKeywords].join(", ")
          : additionalKeywords;

        setTicketForm({
          ...ticketForm,
          keywords: formattedKeywords
        });
      },
      path: "dev_ticket_email"
    },
    dev_ticket_email: {
      message: "What is your email?",
      function: (chatState) => setTicketForm({...ticketForm, email: chatState.userInput}),
      path: async (chatState) => {
        if (!isValidEmail(chatState.userInput)) {
          await chatState.injectMessage("Please enter a valid email address.");
          return;
        }
        return "dev_ticket_accessid";
      }
    },
    dev_ticket_accessid: {
      message: "What is your ACCESS ID?",
      function: (chatState) => setTicketForm({...ticketForm, accessId: chatState.userInput}),
      path: "dev_ticket_grand_summary"
    },
    dev_ticket_grand_summary: {
      message: (chatState) => {
        // Get the most recent state, including the last input if it was ACCESS ID
        const currentAccessId = chatState.prevPath === 'dev_ticket_accessid' ? chatState.userInput : (ticketForm.accessId || 'Not provided');

        let fileInfo = '';
        if (ticketForm.uploadedFiles && ticketForm.uploadedFiles.length > 0) {
          fileInfo = `\nAttachments: ${ticketForm.uploadedFiles.length} file(s) attached`;
        }

        return `Thank you for providing your issue details. Here's a summary:\n\n` +
               `Email: ${ticketForm.email || 'Not provided'}\n` +
               `ACCESS ID: ${currentAccessId}\n` +
               `Summary: ${ticketForm.summary || 'Not provided'}\n` +
               `Keywords: ${ticketForm.keywords || 'Not provided'}\n` +
               `Description: ${ticketForm.description || 'Not provided'}${fileInfo}\n\n` +
               `Would you like to submit this ticket?`;
      },
      options: ["Submit Ticket", "Back to Main Menu"],
      chatDisabled: true,
      path: (chatState) => {
        if (chatState.userInput === "Submit Ticket") {
          return "dev_ticket_submitting";
        }
        return "start";
      }
    },
    dev_ticket_submitting: {
      message: async (chatState) => {
        // Prepare form data using semantic keys
        const formData = {
          summary: ticketForm.summary || "",
          description: ticketForm.description || "",
          email: ticketForm.email || "",
          accessId: ticketForm.accessId || "",
          keywords: ticketForm.keywords || ""
        };

        try {
          // Prepare API submission data
          const apiData = await prepareApiSubmission(
            formData,
            'dev',
            ticketForm.uploadedFiles || []
          );
          console.log("| 🌎 API submission data for dev ticket:", apiData);

          const proxyResponse = await sendPreparedDataToProxy(apiData, 'dev-create-support-ticket');
          console.log("| 🌎 Dev ticket proxy response:", proxyResponse.data.jsmResponse);

          // Return success message with ticket details
          return `A ticket for your issue, "${ticketForm.summary}", was created at ${proxyResponse.data.jsmResponse.createdDate.friendly}`;
        } catch (error) {
          console.error("| ❌ Error sending dev ticket data to proxy:", error);
          return "Sorry, there was an error submitting your ticket. Please try again later.";
        }
      },
      options: ["Back to Main Menu"],
      chatDisabled: true,
      path: "start"
    },
    dev_ticket_success: {
      message: (chatState) => {
        const response = chatState.ticketResponse;
        return `A ticket for your issue, "${ticketForm.summary}", was created at ${response.createdDate.friendly}`;
      },
      options: ["Back to Main Menu"],
      chatDisabled: true,
      path: "start"
    },
    dev_ticket_error: {
      message: "Sorry, there was an error submitting your ticket. Please try again later.",
      options: ["Back to Main Menu"],
      chatDisabled: true,
      path: "start"
    }
  };
};