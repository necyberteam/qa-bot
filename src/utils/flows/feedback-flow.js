import React from 'react';
import FileUploadComponent from '../../components/FileUploadComponent';
import { getCurrentFeedbackForm } from '../flow-context-utils';
import { createOptionalFieldValidator, processOptionalInput } from '../optional-field-utils';
import { validateEmail, isValidEmail } from '../validation-utils';

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
  // Create FileUploadComponent as a function for better cross-environment compatibility
  const fileUploadElement = () => (
    <FileUploadComponent
      onFileUpload={(files) =>
        setFeedbackForm({
          ...(feedbackForm || {}),
          uploadedFiles: files
        })
      }
    />
  );

  return {
    feedback: {
      message: "We appreciate your feedback about ACCESS.\n\nFeedback submitted through this form will only be shared within the ACCESS teams. We encourage the sharing of contact information for potential follow-up, but understand that anonymity may be preferred when providing feedback on sensitive issues.\n\nPlease provide your detailed feedback:",
      function: (chatState) => {
        // Clear any previous feedback form state to start fresh
        setFeedbackForm({
          feedback: chatState.userInput,
          // Explicitly clear all other fields to prevent state persistence
          recommendations: undefined,
          primaryRole: undefined,
          needsCustomRole: false,
          customRole: undefined,
          communityInterest: undefined,
          upload: undefined,
          uploadConfirmed: false,
          uploadedFiles: undefined,
          wantsContact: undefined,
          useCustomContactInfo: false,
          customName: undefined,
          customEmail: undefined,
          customAccessId: undefined
        });
      },
      path: "feedback_please_tell_us_more"
    },
    feedback_please_tell_us_more: {
      message: "Please detail any recommendations for improvement:",
      function: (chatState) => setFeedbackForm({...(feedbackForm || {}), recommendations: chatState.userInput}),
      path: "feedback_upload"
    },
    feedback_primary_role: {
      message: "What is your primary role pertaining to ACCESS?",
      options: [
        "ACCESS Staff",
        "Campus Champion / Research Facilitator",
        "Educator",
        "Researcher",
        "Resource Provider",
        "Reviewer",
        "Other"
      ],
      chatDisabled: true,
      function: (chatState) => {
        const currentForm = getCurrentFeedbackForm();
        if (chatState.userInput === "Other") {
          setFeedbackForm({...currentForm, primaryRole: "Other", needsCustomRole: true});
        } else {
          setFeedbackForm({...currentForm, primaryRole: chatState.userInput, needsCustomRole: false});
        }
      },
      path: (chatState) => {
        return chatState.userInput === "Other" ? "feedback_custom_role" : "feedback_contact_choice";
      }
    },
    feedback_custom_role: {
      message: "Please specify your role:",
      function: (chatState) => {
        const currentForm = getCurrentFeedbackForm();
        setFeedbackForm({...currentForm, customRole: chatState.userInput});
      },
      path: "feedback_contact_choice"
    },
    feedback_community_interest: {
      message: "Are you interested, or potentially interested, in serving the ACCESS community and helping us improve in any of these roles? (This is not a commitment. We'll reach out with more information.) Select all that apply:",
      checkboxes: {
        items: [
          "ACCESS Community Expert / Support",
          "Design of Future Features",
          "Focus Group Participant",
          "Panel Reviewer",
          "Researcher Advisory Committee Member",
          "Other",
          "Not interested at this time"
        ],
        min: 0,
        max: 7
      },
      chatDisabled: true,
      function: (chatState) => {
        const currentForm = getCurrentFeedbackForm();
        setFeedbackForm({...currentForm, communityInterest: chatState.userInput});
      },
      path: "feedback_summary"
    },
    feedback_upload: {
      message: "Would you like to upload a screenshot or file to help us better understand your feedback?",
      options: ["Yes", "No"],
      chatDisabled: true,
      function: (chatState) => setFeedbackForm({...(feedbackForm || {}), upload: chatState.userInput}),
      path: (chatState) => {
        if (chatState.userInput === "Yes") {
          return "feedback_upload_yes";
        } else {
          return "feedback_primary_role";
        }
      }
    },
    feedback_upload_yes: {
      message: "Please upload a screenshot or file to help us better understand your feedback.",
      component: fileUploadElement,
      options: ["Continue"],
      chatDisabled: true,
      function: () => setFeedbackForm({...(feedbackForm || {}), uploadConfirmed: true}),
      path: "feedback_primary_role"
    },
    feedback_contact_choice: {
      message: "Would you like to provide your contact information for follow up?",
      options: ["Include my contact info", "Submit anonymously"],
      chatDisabled: true,
      function: (chatState) => {
        const wantsContact = chatState.userInput === "Include my contact info";
        setFeedbackForm({
          ...(feedbackForm || {}),
          wantsContact: wantsContact ? "Yes" : "No",
          // Clear any contact info flags for fresh start
          useCustomContactInfo: false
        });
      },
      path: (chatState) => {
        if (chatState.userInput === "Include my contact info") {
          // If we have complete user info, go to confirmation step
          if (userInfo.email && userInfo.name && userInfo.accessId) {
            return "feedback_contact_confirm";
          }
          // Otherwise collect missing info - set flag to use custom info
          // Use the updatedForm from the function above to preserve wantsContact
          const currentForm = getCurrentFeedbackForm();
          const wantsContact = chatState.userInput === "Include my contact info";
          setFeedbackForm({
            ...currentForm,
            useCustomContactInfo: true,
            wantsContact: wantsContact ? "Yes" : "No"
          });
          if (!userInfo.name) return "feedback_name";
          if (!userInfo.email) return "feedback_email";
          if (!userInfo.accessId) return "feedback_accessid";
          return "feedback_summary";
        }
        return "feedback_summary";
      }
    },
    feedback_contact_confirm: {
      message: () => {
        return `We have the following contact information from your account:\n\n` +
               `Name: ${userInfo.name || 'Not provided'}\n` +
               `Email: ${userInfo.email || 'Not provided'}\n` +
               `ACCESS ID: ${userInfo.accessId || 'Not provided'}\n\n` +
               `Would you like to use this information or provide different details?`;
      },
      options: ["Use this information", "I'll provide different details"],
      chatDisabled: true,
      function: (chatState) => {
        // Set a flag to indicate whether to use pre-populated data or collect new data
        setFeedbackForm({
          ...(feedbackForm || {}),
          useCustomContactInfo: chatState.userInput === "I'll provide different details"
        });
      },
      path: (chatState) => {
        if (chatState.userInput === "Use this information") {
          return "feedback_community_interest";
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
      validateTextInput: (email) => validateEmail(email),
      function: (chatState) => {
        const currentForm = getCurrentFeedbackForm();
        setFeedbackForm({...currentForm, customEmail: chatState.userInput});
      },
      path: "feedback_accessid"
    },
    feedback_accessid: {
      message: "What is your ACCESS ID? (Optional - press Enter to skip)",
      validateTextInput: createOptionalFieldValidator(),
      function: (chatState) => {
        const currentForm = getCurrentFeedbackForm();
        setFeedbackForm({...currentForm, customAccessId: processOptionalInput(chatState.userInput)});
      },
      path: "feedback_community_interest"
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
          finalAccessId = userInfo.accessId || 'Not provided';
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
          contactInfo = `Contact Information: Anonymous submission\n`;
        }

        // Format primary role
        let primaryRole = currentForm.primaryRole || 'Not provided';
        if (currentForm.primaryRole === 'Other' && currentForm.customRole) {
          primaryRole = `Other: ${currentForm.customRole}`;
        }

        // Format community interest - handle timing issue like ACCESS ID (only for non-anonymous)
        let communityInterestLine = '';
        if (currentForm.wantsContact === "Yes") {
          let communityInterest = 'Not provided';

          // If coming directly from community interest step, use chatState.userInput
          if (chatState.prevPath === 'feedback_community_interest') {
            communityInterest = chatState.userInput || 'Not provided';
          } else if (currentForm.communityInterest && Array.isArray(currentForm.communityInterest)) {
            communityInterest = currentForm.communityInterest.join(', ');
          } else if (currentForm.communityInterest) {
            communityInterest = currentForm.communityInterest;
          }

          communityInterestLine = `Community Interest: ${communityInterest}\n`;
        }

        return `Thank you for providing your feedback. Here's a summary:\n\n` +
               contactInfo +
               `Feedback: ${currentForm.feedback || 'Not provided'}\n` +
               `Recommendations: ${currentForm.recommendations || 'Not provided'}\n` +
               `Primary Role: ${primaryRole}\n` +
               communityInterestLine +
               `${fileInfo}\n\n` +
               `Would you like to submit this feedback?`;
      },
      options: ["Submit Feedback", "Back to Main Menu"],
      chatDisabled: true,
      path: (chatState) => {
        if (chatState.userInput === "Submit Feedback") {
          return "feedback_success";
        } else {
          return "start";
        }
      }
    },
    feedback_success: {
      message: () => {
        const currentForm = getCurrentFeedbackForm();
        const baseMessage = "Thank you for your feedback!";

        // Determine if they provided a valid email (using same logic as summary)
        let finalEmail;
        if (currentForm.wantsContact === "No") {
          finalEmail = null;
        } else if (currentForm.useCustomContactInfo) {
          finalEmail = currentForm.customEmail;
        } else {
          finalEmail = userInfo.email;
        }

        // Only add follow-up message if they provided a valid email
        if (finalEmail && finalEmail.trim() && isValidEmail(finalEmail)) {
          return `${baseMessage} We will follow up with you shortly.`;
        }

        return baseMessage;
      },
      options: ["Back to Main Menu"],
      chatDisabled: true,
      path: "start"
    }
  };
};