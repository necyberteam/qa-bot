import React from 'react';
import FileUploadComponent from '../../../components/FileUploadComponent';
import { prepareApiSubmission, sendPreparedDataToProxy } from '../../api-utils';

/**
 * Creates a reusable file upload component for ticket flows
 * @param {Function} setTicketForm - Function to update ticket form state
 * @param {Object} ticketForm - Current ticket form state
 * @returns {JSX.Element} File upload component
 */
export const createFileUploadComponent = (setTicketForm, ticketForm) => (
  <FileUploadComponent
    onFileUpload={(files) =>
      setTicketForm({
        ...(ticketForm || {}),
        uploadedFiles: files
      })
    }
  />
);

/**
 * Creates a submission handler with external result storage to avoid React closure issues
 * @param {Function} setTicketForm - Function to update ticket form state
 * @returns {Object} Object containing submitTicket function and getSubmissionResult function
 */
export const createSubmissionHandler = (setTicketForm) => {
  let submissionResult = null;

  const submitTicket = async (formData, ticketType, uploadedFiles = []) => {
    try {
      const apiData = await prepareApiSubmission(
        formData,
        ticketType,
        uploadedFiles
      );
      const proxyResponse = await sendPreparedDataToProxy(apiData, 'create-support-ticket');
      
      if (proxyResponse.success) {
        submissionResult = {
          success: true,
          ticketKey: proxyResponse.data.data.ticketKey,
          ticketUrl: proxyResponse.data.data.ticketUrl
        };
        setTicketForm(prevForm => ({
          ...prevForm, 
          ticketKey: proxyResponse.data.data.ticketKey, 
          ticketUrl: proxyResponse.data.data.ticketUrl
        }));
      } else {
        console.error(`| ❌ ${ticketType} ticket creation failed:`, proxyResponse.data?.message || proxyResponse.error);
        submissionResult = {
          success: false,
          error: proxyResponse.data?.message || proxyResponse.error
        };
        setTicketForm(prevForm => ({...prevForm, submissionError: proxyResponse.data?.message || proxyResponse.error}));
      }
    } catch (error) {
      console.error(`| ❌ Error sending ${ticketType} data to proxy:`, error);
      submissionResult = {
        success: false,
        error: error.message
      };
      setTicketForm(prevForm => ({...prevForm, submissionError: error.message}));
    }
  };

  const getSubmissionResult = () => submissionResult;

  return { submitTicket, getSubmissionResult };
};

/**
 * Generates a success message with clickable URL
 * @param {Object} submissionResult - Result from ticket submission
 * @param {string} ticketType - Type of ticket for display purposes
 * @returns {string} Success message with clickable URL
 */
export const generateSuccessMessage = (submissionResult, ticketType = 'ticket') => {
  if (submissionResult && !submissionResult.success) {
    return `We apologize, but there was an error submitting your ${ticketType}: ${submissionResult.error}\n\nPlease try again or contact our support team directly.`;
  } else if (submissionResult && submissionResult.success && submissionResult.ticketUrl && submissionResult.ticketKey) {
    return `Your ${ticketType} has been submitted successfully.\n\nTicket: <a href="${submissionResult.ticketUrl}" target="_blank">${submissionResult.ticketKey}</a>\n\nOur support team will review your request and respond accordingly. Thank you for contacting ACCESS.`;
  } else if (submissionResult && submissionResult.success) {
    return `Your ${ticketType} has been submitted successfully.\n\nOur support team will review your request and respond accordingly. Thank you for contacting ACCESS.`;
  } else {
    return `Your ${ticketType} has been submitted successfully.\n\nOur support team will review your request and respond accordingly. Thank you for contacting ACCESS.`;
  }
};

/**
 * Generates file info string for summaries
 * @param {Array} uploadedFiles - Array of uploaded files
 * @returns {string} File information string
 */
export const getFileInfo = (uploadedFiles) => {
  if (uploadedFiles && uploadedFiles.length > 0) {
    return `\nAttachments: ${uploadedFiles.length} file(s) attached`;
  }
  return '';
};