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
      message: (chatState) => {
        // Handle ACCESS ID using chatState.userInput due to React state timing
        // and this only works because ACCESS ID is the last field collected before the summary.
        // Instead we should either: 1) fix the fundamental closure issue so message functions can access current state,
        // or 2) implement a more robust state management approach that doesn't depend on field collection order.
        const currentAccessId = chatState.prevPath === 'feedback_accessid' ? chatState.userInput : (feedbackForm.accessid || 'Not provided');

        let fileInfo = '';
        if (feedbackForm.uploadedFiles && feedbackForm.uploadedFiles.length > 0) {
          fileInfo = `\nAttachments: ${feedbackForm.uploadedFiles.length} file(s) attached`;
        }

        let contactInfo = '';
        if (feedbackForm.wantsContact === "Yes") {
          contactInfo = `Name: ${feedbackForm.name || 'Not provided'}\n` +
                       `Email: ${feedbackForm.email || 'Not provided'}\n` +
                       `ACCESS ID: ${currentAccessId}\n` +
                       '';
        } else {
          contactInfo = `Contact Information: Not provided\n`;
        }

        return `Thank you for providing your feedback. Here's a summary:\n\n` +
               contactInfo +
               `Feedback: ${feedbackForm.feedback || 'Not provided'}${fileInfo}\n\n` +
               `Would you like to submit this feedback?`;
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

          } catch (error) {
            console.error("| ❌ Error preparing feedback data:", error);
          }
        }
      },
      path: "feedback_success"
    },
    feedback_success: {
      message: "Thank you for your feedback! If you provided your contact information, we will follow up with you shortly.",
      options: ["Back to Main Menu"],
      chatDisabled: true,
      path: "start"
    }
  };
};