import React from 'react';
import FileUploadComponent from '../../components/FileUploadComponent';
import { prepareApiSubmission } from '../api-utils';
import { getCurrentFeedbackForm } from '../flow-context-utils';

/**
 * Creates the feedback conversation flow
 *
 * @param {Object} params Configuration
 * @param {Object} params.feedbackForm Form state for feedback
 * @param {Function} params.setFeedbackForm Function to update feedback form
 * @returns {Object} Feedback flow configuration
 */
export const createFeedbackFlow = ({
  feedbackForm = {},
  setFeedbackForm = () => {},
  userInfo = {}
}) => {
  // Store the FileUploadComponent JSX in a variable for better readability
  const fileUploadElement = (
    <FileUploadComponent
      onFileUpload={(files) =>
        setFeedbackForm({
          ...feedbackForm,
          uploadedFiles: files
        })
      }
    />
  );

  return {
    feedback: {
      message: "We appreciate your feedback about ACCESS.\n\nWould you like to provide your contact information for follow up, or submit feedback anonymously?",
      options: ["Include my contact info", "Submit anonymously"],
      chatDisabled: true,
      function: (chatState) => {
        const wantsContact = chatState.userInput === "Include my contact info";
        setFeedbackForm({
          ...feedbackForm,
          wantsContact: wantsContact ? "Yes" : "No",
          // Clear any contact info flags for fresh start
          useCustomContactInfo: false
        });
      },
      path: (chatState) => {
        if (chatState.userInput === "Include my contact info") {
          // If we have complete user info, go to confirmation step after collecting feedback
          return "feedback_please_tell_us_more";
        }
        return "feedback_please_tell_us_more";
      }
    },
    feedback_please_tell_us_more: {
      message: "Please provide your detailed feedback.",
      function: (chatState) => setFeedbackForm({...feedbackForm, feedback: chatState.userInput}),
      path: "feedback_upload"
    },
    feedback_upload: {
      message: "Would you like to upload a screenshot or file to help us better understand your feedback?",
      options: ["Yes", "No"],
      chatDisabled: true,
      function: (chatState) => setFeedbackForm({...feedbackForm, upload: chatState.userInput}),
      path: (chatState) => {
        if (chatState.userInput === "Yes") {
          return "feedback_upload_yes";
        } else {
          // Add contact choice to form state for path decisions
          setFeedbackForm({...feedbackForm, pathDecision: feedbackForm.wantsContact});
          // Check if they want contact info and handle accordingly
          if (feedbackForm.wantsContact === "Yes") {
            // If we have complete user info, go to confirmation step
            if (userInfo.email && userInfo.name && userInfo.username) {
              return "feedback_contact_confirm";
            }
            // Otherwise collect missing info - set flag to use custom info
            const currentForm = getCurrentFeedbackForm();
            setFeedbackForm({...currentForm, useCustomContactInfo: true});
            if (!userInfo.name) return "feedback_name";
            if (!userInfo.email) return "feedback_email";
            if (!userInfo.username) return "feedback_accessid";
            return "feedback_summary";
          }
          return "feedback_summary";
        }
      }
    },
    feedback_upload_yes: {
      message: "Please upload a screenshot or file to help us better understand your feedback.",
      component: fileUploadElement,
      options: ["Continue"],
      chatDisabled: true,
      function: (chatState) => setFeedbackForm({...feedbackForm, uploadConfirmed: true}),
      path: (chatState) => {
        // Check if they want contact info and handle accordingly
        if (feedbackForm.wantsContact === "Yes") {
          // If we have complete user info, go to confirmation step
          if (userInfo.email && userInfo.name && userInfo.username) {
            return "feedback_contact_confirm";
          }
          // Otherwise collect missing info - set flag to use custom info
          const currentForm = getCurrentFeedbackForm();
          setFeedbackForm({...currentForm, useCustomContactInfo: true});
          if (!userInfo.name) return "feedback_name";
          if (!userInfo.email) return "feedback_email";
          if (!userInfo.username) return "feedback_accessid";
          return "feedback_summary";
        }
        return "feedback_summary";
      }
    },
    feedback_contact_confirm: {
      message: (chatState) => {
        return `We have the following contact information from your account:\n\n` +
               `Name: ${userInfo.name || 'Not provided'}\n` +
               `Email: ${userInfo.email || 'Not provided'}\n` +
               `ACCESS ID: ${userInfo.username || 'Not provided'}\n\n` +
               `Would you like to use this information or provide different details?`;
      },
      options: ["Use this information", "I'll provide different details"],
      chatDisabled: true,
      function: (chatState) => {
        // Set a flag to indicate whether to use pre-populated data or collect new data
        setFeedbackForm({
          ...feedbackForm,
          useCustomContactInfo: chatState.userInput === "I'll provide different details"
        });
      },
      path: (chatState) => {
        if (chatState.userInput === "Use this information") {
          return "feedback_summary";
        } else {
          return "feedback_name";
        }
      }
    },
    feedback_name: {
      message: "What is your name?",
      function: (chatState) => {
        const currentForm = getCurrentFeedbackForm();
        setFeedbackForm({...currentForm, customName: chatState.userInput});
      },
      path: "feedback_email"
    },
    feedback_email: {
      message: "What is your email address?",
      function: (chatState) => {
        const currentForm = getCurrentFeedbackForm();
        setFeedbackForm({...currentForm, customEmail: chatState.userInput});
      },
      path: "feedback_accessid"
    },
    feedback_accessid: {
      message: "What is your ACCESS ID?",
      function: (chatState) => {
        const currentForm = getCurrentFeedbackForm();
        setFeedbackForm({...currentForm, customAccessId: chatState.userInput});
      },
      path: "feedback_summary"
    },
    feedback_summary: {
      message: (chatState) => {
        const currentForm = getCurrentFeedbackForm();
        let finalName, finalEmail, finalAccessId;
        
        if (currentForm.wantsContact === "No") {
          // Anonymous submission - no contact info
          finalName = finalEmail = finalAccessId = 'Anonymous';
        } else if (currentForm.useCustomContactInfo) {
          // Custom contact info provided
          finalName = currentForm.customName || 'Not provided';
          finalEmail = currentForm.customEmail || 'Not provided';
          // Handle ACCESS ID specially since it's the last field collected
          finalAccessId = chatState.prevPath === 'feedback_accessid' 
            ? chatState.userInput 
            : (currentForm.customAccessId || 'Not provided');
        } else {
          // Use pre-populated userInfo
          finalName = userInfo.name || 'Not provided';
          finalEmail = userInfo.email || 'Not provided';
          finalAccessId = userInfo.username || 'Not provided';
        }

        let fileInfo = '';
        if (currentForm.uploadedFiles && currentForm.uploadedFiles.length > 0) {
          fileInfo = `\nAttachments: ${currentForm.uploadedFiles.length} file(s) attached`;
        }

        let contactInfo = '';
        if (currentForm.wantsContact === "Yes") {
          contactInfo = `Name: ${finalName}\n` +
                       `Email: ${finalEmail}\n` +
                       `ACCESS ID: ${finalAccessId}\n` +
                       '';
        } else {
          contactInfo = `Contact Information: Not provided\n`;
        }

        return `Thank you for providing your feedback. Here's a summary:\n\n` +
               contactInfo +
               `Feedback: ${currentForm.feedback || 'Not provided'}${fileInfo}\n\n` +
               `Would you like to submit this feedback?`;
      },
      options: ["Submit Feedback", "Back to Main Menu"],
      chatDisabled: true,
      function: async (chatState) => {
        if (chatState.userInput === "Submit Feedback") {
          const currentForm = getCurrentFeedbackForm();
          let finalName, finalEmail, finalAccessId;
          
          if (currentForm.wantsContact === "No") {
            // Anonymous submission - no contact info sent
            finalName = finalEmail = finalAccessId = "";
          } else if (currentForm.useCustomContactInfo) {
            // Use custom contact info
            finalName = currentForm.customName || "";
            finalEmail = currentForm.customEmail || "";
            finalAccessId = currentForm.customAccessId || "";
          } else {
            // Use pre-populated userInfo
            finalName = userInfo.name || "";
            finalEmail = userInfo.email || "";
            finalAccessId = userInfo.username || "";
          }

          // Prepare form data from feedback inputs
          const formData = {
            summary: "Feedback from ACCESS Help",
            description: currentForm.feedback || "",
            customfield_10103: finalAccessId,
            email: finalEmail,
            customfield_10108: finalName
          };

          try {
            // Also prepare API data for future use
            const apiData = await prepareApiSubmission(
              formData,
              'support',
              currentForm.uploadedFiles || []
            );

          } catch (error) {
            console.error("| ❌ Error preparing feedback data:", error);
          }
        }
      },
      path: (chatState) => {
        if (chatState.userInput === "Submit Feedback") {
          return "feedback_success";
        } else {
          return "start";
        }
      }
    },
    feedback_success: {
      message: "Thank you for your feedback! If you provided your contact information, we will follow up with you shortly.",
      options: ["Back to Main Menu"],
      chatDisabled: true,
      path: "start"
    }
  };
};