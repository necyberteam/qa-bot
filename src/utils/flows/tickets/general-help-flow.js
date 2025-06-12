import React from 'react';
import FileUploadComponent from '../../../components/FileUploadComponent';
import { prepareApiSubmission, sendPreparedDataToProxy } from '../../api-utils';

/**
 * Creates the general help ticket flow
 *
 * @param {Object} params Configuration
 * @param {Object} params.ticketForm Form state for help tickets
 * @param {Function} params.setTicketForm Function to update ticket form
 * @returns {Object} General help flow configuration
 */
export const createGeneralHelpFlow = ({ ticketForm = {}, setTicketForm = () => {} }) => {
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
    // FORM flow - General Help Ticket Form Flow
    general_help_summary_subject: {
      message: "Provide a short title for your ticket.",
      function: (chatState) => setTicketForm({...ticketForm, summary: chatState.userInput}),
      path: "general_help_category"
    },
    general_help_category: {
      message: "What type of issue are you experiencing?",
      options: [
        "User Account Question",
        "Allocation Question",
        "User Support Question",
        "CSSN/CCEP Question",
        "Training Question",
        "Metrics Question",
        "OnDemand Question",
        "Pegasus Question",
        "XDMOD Question"
      ],
      chatDisabled: true,
      function: (chatState) => setTicketForm({...ticketForm, category: chatState.userInput}),
      path: "general_help_description"
    },
    general_help_description: {
      message: "Please describe your issue.",
      function: (chatState) => setTicketForm({...ticketForm, description: chatState.userInput}),
      path: "general_help_attachment"
    },
    general_help_attachment: {
      message: "Would you like to attach a file to your ticket?",
      options: ["Yes", "No"],
      chatDisabled: true,
      function: (chatState) => setTicketForm({...ticketForm, wantsAttachment: chatState.userInput}),
      path: (chatState) => chatState.userInput === "Yes"
        ? "general_help_upload"
        : "general_help_resource"
    },
    general_help_upload: {
      message: "Please upload your file.",
      component: fileUploadElement,
      options: ["Continue"],
      chatDisabled: true,
      function: () => setTicketForm({...ticketForm, uploadConfirmed: true}),
      path: "general_help_resource"
    },
    general_help_resource: {
      message: "Does your problem involve an ACCESS Resource?",
      options: ["Yes", "No"],
      chatDisabled: true,
      function: (chatState) => setTicketForm({...ticketForm, involvesResource: chatState.userInput.toLowerCase()}),
      path: (chatState) => chatState.userInput === "Yes"
        ? "general_help_resource_details"
        : "general_help_keywords"
    },
    general_help_resource_details: {
      message: "Please select the ACCESS Resource(s) involved with your issue. Click the 'Continue' button when done.",
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
      function: (chatState) => setTicketForm({...ticketForm, resourceDetails: chatState.userInput}),
      path: "general_help_keywords"
    },
    general_help_keywords: {
      message: "Please add up to 5 keywords to help route your ticket.",
      checkboxes: { items: ["C, C++", "Abaqus", "Algorithms", "API", "Bash", "CloudLab", "Docker", "Hadoop", "Jupyter", "MatLab", "VPN", "XML", "Other"], min: 0, max: 5 },
      chatDisabled: true,
      function: (chatState) => setTicketForm({...ticketForm, keywords: chatState.userInput}),
      path: (chatState) => {
        if (chatState.userInput && chatState.userInput.includes("Other")) {
          return "general_help_additional_keywords";
        } else {
          return "general_help_priority";
        }
      }
    },
    general_help_additional_keywords: {
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
      path: "general_help_priority"
    },
    general_help_priority: {
      message: "Please select a priority for your issue:",
      options: ["Lowest", "Low", "Medium", "High", "Highest"],
      chatDisabled: true,
      function: (chatState) => setTicketForm({...ticketForm, priority: chatState.userInput.toLowerCase()}),
      path: "general_help_email"
    },
    general_help_email: {
      message: "What is your email address?",
      function: (chatState) => setTicketForm({...ticketForm, email: chatState.userInput}),
      path: "general_help_name"
    },
    general_help_name: {
      message: "What is your name?",
      function: (chatState) => setTicketForm({...ticketForm, name: chatState.userInput}),
      path: "general_help_accessid"
    },
    general_help_accessid: {
      message: "What is your ACCESS ID?",
      function: (chatState) => {
        setTicketForm({...ticketForm, accessId: chatState.userInput});
      },
      path: (chatState) => {
        // Add small delay to let React update state
        setTimeout(() => {}, 100);
        return "general_help_ticket_summary";
      }
    },
    general_help_ticket_summary: {
      message: (chatState) => {
        // TODO: Right now we have to handle ACCESS ID specially using chatState.userInput because of React state timing issues,
        // and this only works because ACCESS ID is the last field collected before the summary.
        // Instead we should either: 1) fix the fundamental closure issue so message functions can access current state,
        // or 2) implement a more robust state management approach that doesn't depend on field collection order.
        const currentAccessId = chatState.prevPath === 'general_help_accessid' ? chatState.userInput : (ticketForm.accessId || 'Not provided');

        let fileInfo = '';
        if (ticketForm.uploadedFiles && ticketForm.uploadedFiles.length > 0) {
          fileInfo = `\nAttachments: ${ticketForm.uploadedFiles.length} file(s) attached`;
        }

        return `Thank you for providing your issue details. Here's a summary:\n\n` +
               `Name: ${ticketForm.name || 'Not provided'}\n` +
               `Email: ${ticketForm.email || 'Not provided'}\n` +
               `ACCESS ID: ${currentAccessId}\n` +
               `Issue Summary: ${ticketForm.summary || 'Not provided'}\n` +
               `Category: ${ticketForm.category || 'Not provided'}\n` +
               `Priority: ${ticketForm.priority || 'Not provided'}\n` +
               `Keywords: ${ticketForm.keywords || 'Not provided'}\n` +
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
            customfield_10103: ticketForm.accessId || "",
            customfield_10108: ticketForm.name || "",
            summary: ticketForm.summary || "General Support Ticket",
            customfield_10111: ticketForm.category || "",
            description: ticketForm.description || "",
            priority: ticketForm.priority || "medium",
            access_resource: ticketForm.involvesResource || "no",
            direct_ticket: ticketForm.keywords === "None of the above" ? "" : ticketForm.keywords || ""
          };

          try {
            // Prepare API submission data - now awaiting the async function
            const apiData = await prepareApiSubmission(
              formData,
              'support',
              ticketForm.uploadedFiles || []
            );
            console.log("| 🌎 API submission data for general ticket:", apiData);

            // const proxyResponse = await sendPreparedDataToProxy(apiData, 'create-support-ticket');
            // console.log("| 🌎 General ticket proxy response:", proxyResponse.data.jsmResponse);
          } catch (error) {
            console.error("| ❌ Error sending general ticket data to proxy:", error);
          }
        }
      },
      path: "general_help_success"
    },

    general_help_success: {
      message: "Thank you for submitting your ticket. We will follow up with you shortly.",
      options: ["Back to Main Menu"],
      chatDisabled: true,
      path: "start"
    }
  };
};