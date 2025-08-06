import React from 'react';
import { submitSecurityIncident } from '../api-utils';
import { getCurrentTicketForm, getCurrentFormWithUserInfo } from '../flow-context-utils';
import { createOptionalFieldValidator, processOptionalInput } from '../optional-field-utils';
import { validateGeneralFiles } from '../validation-utils';

/**
 * Creates the security incident conversation flow
 *
 * @param {Object} params Configuration
 * @param {Object} params.ticketForm Form state for security incident
 * @param {Function} params.setTicketForm Function to update security incident form
 * @param {Object} params.userInfo User information for pre-population
 * @returns {Object} Security incident flow configuration
 */
export const createSecurityFlow = ({
  setTicketForm = () => {},
  userInfo = {}
}) => {
  // Store the most recent ACCESS ID input to handle timing issues
  let mostRecentAccessId = null;

  // Store submission result for success message
  let submissionResult = null;

  // Custom success message for security incidents
  const generateSecuritySuccessMessage = (result) => {
    if (result && !result.success) {
      return `We apologize, but there was an error submitting your security incident report: ${result.error}\n\nPlease try again or contact our cybersecurity team directly.`;
    } else if (result && result.success && result.ticketUrl && result.ticketKey) {
      return `Your security incident report has been submitted successfully.\n\nTicket: <a href="${result.ticketUrl}" target="_blank">${result.ticketKey}</a>\n\nOur cybersecurity team will review your report and respond accordingly. Thank you for helping keep ACCESS secure.`;
    } else if (result && result.success) {
      return `Your security incident report has been submitted successfully.\n\nOur cybersecurity team will review your report and respond accordingly. Thank you for helping keep ACCESS secure.`;
    } else {
      return `Your security incident report has been submitted successfully.\n\nOur cybersecurity team will review your report and respond accordingly. Thank you for helping keep ACCESS secure.`;
    }
  };
  
  return {
    security_incident: {
      message: "You're reporting a security incident. Please provide a brief summary of the security concern.",
      function: (chatState) => {
        // Pre-populate form with user info on first step
        const currentForm = getCurrentTicketForm() || {};
        const updatedForm = {
          ...currentForm,
          summary: chatState.userInput,
          email: userInfo.email || currentForm.email,
          name: userInfo.name || currentForm.name,
          accessId: userInfo.accessId || currentForm.accessId
        };
        setTicketForm(updatedForm);
      },
      path: "security_priority"
    },
    security_priority: {
      message: "What is the priority level of this security incident?",
      options: ["Critical", "High", "Medium", "Low"],
      chatDisabled: true,
      function: (chatState) => {
        const currentForm = getCurrentTicketForm() || {};
        setTicketForm({...currentForm, priority: chatState.userInput});
      },
      path: "security_description"
    },
    security_description: {
      message: "Please provide a detailed description of the security incident or concern.",
      function: (chatState) => {
        const currentForm = getCurrentTicketForm() || {};
        setTicketForm({...currentForm, description: chatState.userInput});
      },
      path: "security_attachment"
    },
    security_attachment: {
      message: "Do you have any files (screenshots, logs, etc.) that would help with this security incident?",
      options: ["Yes", "No"],
      chatDisabled: true,
      function: (chatState) => {
        const currentForm = getCurrentTicketForm() || {};
        setTicketForm({...currentForm, wantsAttachment: chatState.userInput});
      },
      path: (chatState) => chatState.userInput === "Yes"
        ? "security_upload"
        : "security_contact_info"
    },
    security_upload: {
      message: "Please upload your files. Click the file attachment button in the chat footer to select files. Supported formats: PDF, PNG, JPG, GIF, DOC, DOCX, TXT, CSV, ZIP (max 25MB per file, 50MB total).",
      validateFileInput: validateGeneralFiles,
      file: (params) => {
        // Handle file upload using built-in react-chatbotify file functionality
        const currentForm = getCurrentTicketForm() || {};
        setTicketForm({
          ...currentForm,
          uploadedFiles: params.files,
          uploadConfirmed: true
        });
      },
      path: "security_contact_info"
    },
    security_contact_info: {
      message: () => {
        // Always merge with user info to get the most current data
        const formWithUserInfo = getCurrentFormWithUserInfo(userInfo);
        if (formWithUserInfo.name && formWithUserInfo.email && formWithUserInfo.accessId) {
          return `I have your contact information:\n\nName: ${formWithUserInfo.name}\nEmail: ${formWithUserInfo.email}\nACCESS ID: ${formWithUserInfo.accessId}\n\nIs this correct?`;
        }
        return "I need your contact information. What is your name?";
      },
      options: (chatState) => {
        if (!chatState) return [];
        const formWithUserInfo = getCurrentFormWithUserInfo(userInfo);
        return (formWithUserInfo.name && formWithUserInfo.email && formWithUserInfo.accessId)
          ? ["Yes, that's correct", "Let me update it"]
          : [];
      },
      chatDisabled: (chatState) => {
        if (!chatState) return false;
        const formWithUserInfo = getCurrentFormWithUserInfo(userInfo);
        // Only disable chat when we have all info (showing confirmation buttons)
        // Enable chat when we need user to type their info
        const hasAllInfo = formWithUserInfo.name && formWithUserInfo.email && formWithUserInfo.accessId;
        return hasAllInfo; // Disable only when showing options, enable when expecting input
      },
      function: (chatState) => {
        if (!chatState) return;
        const currentForm = getCurrentTicketForm() || {};
        if (!currentForm.name) {
          // User is providing their name
          const updatedForm = {...currentForm, name: chatState.userInput};
          setTicketForm(updatedForm);
        }
      },
      path: (chatState) => {
        if (!chatState) return "security_summary";
        const formWithUserInfo = getCurrentFormWithUserInfo(userInfo);
        if (chatState.userInput === "Yes, that's correct") {
          return "security_summary";
        } else if (chatState.userInput === "Let me update it") {
          return "security_name";
        } else if (!formWithUserInfo.name) {
          return "security_email";
        } else if (!formWithUserInfo.email) {
          return "security_email";
        } else if (!formWithUserInfo.accessId) {
          return "security_accessid";
        }
        return "security_summary";
      }
    },
    security_name: {
      message: "What is your name?",
      function: (chatState) => {
        const currentForm = getCurrentTicketForm() || {};
        setTicketForm({...currentForm, name: chatState.userInput});
      },
      path: "security_email"
    },
    security_email: {
      message: "What is your email address?",
      function: (chatState) => {
        const currentForm = getCurrentTicketForm() || {};
        setTicketForm({...currentForm, email: chatState.userInput});
      },
      path: "security_accessid"
    },
    security_accessid: {
      message: "What is your ACCESS ID? (Optional - press Enter to skip)",
      validateTextInput: createOptionalFieldValidator(),
      function: (chatState) => {
        // Store the processed input
        const finalInput = processOptionalInput(chatState.userInput);
        mostRecentAccessId = finalInput;
        const currentForm = getCurrentTicketForm() || {};
        setTicketForm({...currentForm, accessId: finalInput});
      },
      path: "security_summary"
    },
    security_summary: {
      message: () => {
        // Get current form state from context
        const currentForm = getCurrentTicketForm() || {};
        const formWithUserInfo = getCurrentFormWithUserInfo(userInfo);

        // Create a merged form that includes the most recent data
        const finalForm = {
          ...currentForm,
          name: formWithUserInfo.name || currentForm.name,
          email: formWithUserInfo.email || currentForm.email,
          accessId: mostRecentAccessId || formWithUserInfo.accessId || currentForm.accessId
        };

        let fileInfo = '';
        if (currentForm.uploadedFiles && currentForm.uploadedFiles.length > 0) {
          fileInfo = `\nAttachments: ${currentForm.uploadedFiles.length} file(s) attached`;
        }

        const accessIdDisplay = finalForm.accessId || 'Not provided';

        return `Here's a summary of your security incident report:\n\n` +
               `Summary: ${finalForm.summary || 'Not provided'}\n` +
               `Priority: ${finalForm.priority || 'Not provided'}\n` +
               `Name: ${finalForm.name || 'Not provided'}\n` +
               `Email: ${finalForm.email || 'Not provided'}\n` +
               `ACCESS ID: ${accessIdDisplay}\n` +
               `Description: ${finalForm.description || 'Not provided'}${fileInfo}\n\n` +
               `Would you like to submit this security incident report?`;
      },
      options: ["Submit Security Report", "Back to Main Menu"],
      chatDisabled: true,
      function: async (chatState) => {
        if (chatState.userInput === "Submit Security Report") {
          const currentForm = getCurrentTicketForm() || {};
          const formWithUserInfo = getCurrentFormWithUserInfo(userInfo);

          // Create final merged form to handle timing issues
          const finalForm = {
            ...currentForm,
            name: formWithUserInfo.name || currentForm.name,
            email: formWithUserInfo.email || currentForm.email,
            accessId: mostRecentAccessId || formWithUserInfo.accessId || currentForm.accessId
          };

          // Prepare form data for security incident submission
          const formData = {
            summary: finalForm.summary || "",
            priority: finalForm.priority || "",
            description: finalForm.description || "",
            name: finalForm.name || "",
            email: finalForm.email || "",
            accessId: finalForm.accessId || ""
          };

          try {
            // Submit the security incident
            const result = await submitSecurityIncident(
              formData,
              currentForm.uploadedFiles || []
            );

            if (result.success) {
              submissionResult = {
                success: true,
                ticketKey: result.data?.data?.ticketKey,
                ticketUrl: result.data?.data?.ticketUrl
              };
              setTicketForm(prevForm => ({
                ...prevForm,
                ticketKey: result.data?.data?.ticketKey,
                ticketUrl: result.data?.data?.ticketUrl,
                submissionResult: submissionResult
              }));
            } else {
              submissionResult = {
                success: false,
                error: result.error
              };
              setTicketForm(prevForm => ({
                ...prevForm,
                submissionError: result.error
              }));
            }
          } catch (error) {
            submissionResult = {
              success: false,
              error: error.message
            };
            setTicketForm(prevForm => ({
              ...prevForm,
              submissionError: error.message
            }));
          }
        }
      },
      path: (chatState) => {
        if (chatState.userInput === "Submit Security Report") {
          // ✅ Navigate to success/error based on actual result
          return submissionResult && submissionResult.success ? "security_success" : "security_error";
        } else {
          return "start";
        }
      }
    },
    security_success: {
      message: () => {
        const currentForm = getCurrentTicketForm() || {};
        const result = currentForm.submissionResult || submissionResult;
        return generateSecuritySuccessMessage(result);
      },
      options: ["Back to Main Menu"],
      chatDisabled: true,
      renderHtml: ["BOT"],
      path: "start"
    },
    security_error: {
      message: () => {
        const currentForm = getCurrentTicketForm() || {};
        const result = currentForm.submissionResult || submissionResult;
        return `We apologize, but there was an error submitting your security incident report: ${result?.error || 'Unknown error'}\n\nPlease try again or contact our cybersecurity team directly.`;
      },
      options: ["Try Again", "Back to Main Menu"],
      chatDisabled: true,
      path: (chatState) => {
        if (chatState.userInput === "Try Again") {
          return "security_confirmation";
        } else {
          return "start";
        }
      }
    }
  };
};