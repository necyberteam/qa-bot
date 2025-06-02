import React from 'react';
import FileUploadComponent from '../../components/FileUploadComponent';
import { prepareApiSubmission } from '../api-utils';

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
  setFeedbackForm = () => {}
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
      message: "We appreciate your feedback about ACCESS.",
      function: (chatState) => setFeedbackForm({...feedbackForm, feedback: chatState.userInput}),
      transition: { duration: 500 },
      path: "feedback_please_tell_us_more"
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
      path: (chatState) => chatState.userInput === "Yes"
        ? "feedback_upload_yes"
        : "feedback_contact"
    },
    feedback_upload_yes: {
      message: "Please upload a screenshot or file to help us better understand your feedback.",
      component: fileUploadElement,
      options: ["Continue"],
      chatDisabled: true,
      function: (chatState) => setFeedbackForm({...feedbackForm, uploadConfirmed: true}),
      path: "feedback_contact"
    },
    feedback_contact: {
      message: "Would you like to provide your contact information for follow up?",
      options: ["Yes", "No"],
      chatDisabled: true,
      function: (chatState) => setFeedbackForm({...feedbackForm, wantsContact: chatState.userInput}),
      path: (chatState) => chatState.userInput === "Yes"
        ? "feedback_name"
        : "feedback_summary"
    },
    feedback_name: {
      message: "What is your name?",
      function: (chatState) => setFeedbackForm({...feedbackForm, name: chatState.userInput}),
      path: "feedback_email"
    },
    feedback_email: {
      message: "What is your email address?",
      function: (chatState) => setFeedbackForm({...feedbackForm, email: chatState.userInput}),
      path: "feedback_accessid"
    },
    feedback_accessid: {
      message: "What is your ACCESS ID?",
      function: (chatState) => setFeedbackForm({...feedbackForm, accessid: chatState.userInput}),
      path: "feedback_summary"
    },
    feedback_summary: {
      message: () => {
        let fileInfo = '';
        if (feedbackForm.uploadedFiles && feedbackForm.uploadedFiles.length > 0) {
          fileInfo = `\nAttachments: ${feedbackForm.uploadedFiles.length} file(s) attached`;
        }

        return `Thank you for sharing your feedback!${fileInfo}`;
      },
      options: ["Submit Feedback", "Back to Main Menu"],
      chatDisabled: true,
      function: async (chatState) => {
        if (chatState.userInput === "Submit Feedback") {
          // Prepare form data from feedback inputs
          const formData = {
            summary: "Feedback from ACCESS Help",
            description: feedbackForm.feedback || "",
            customfield_10103: feedbackForm.accessid || "",
            email: feedbackForm.email || "",
            customfield_10108: feedbackForm.name || ""
          };

          try {
            // Also prepare API data for future use
            const apiData = await prepareApiSubmission(
              formData,
              'support',
              feedbackForm.uploadedFiles || []
            );
            console.log("| 🌎 API submission data:", apiData);
          } catch (error) {
            console.error("| ❌ Error preparing feedback data:", error);
          }
        }
      },
      path: "start"
    }
  };
};