import React from 'react';
import FileUploadComponent from '../../../components/FileUploadComponent';
import { prepareApiSubmission, sendPreparedDataToProxy } from '../../api-utils';

/**
 * Creates a reusable file upload component for ticket flows
 * @param {Function} setTicketForm - Function to update ticket form state
 * @param {Object} ticketForm - Current ticket form state
 * @returns {Function} Function that returns a FileUploadComponent JSX element
 */
export const createFileUploadComponent = (setTicketForm, ticketForm) => {
  const FileUploadWrapper = () => (
    <FileUploadComponent
      onFileUpload={(files) =>
        setTicketForm({
          ...(ticketForm || {}),
          uploadedFiles: files
        })
      }
    />
  );

  FileUploadWrapper.displayName = 'FileUploadWrapper';
  return FileUploadWrapper;
};

/**
 * Creates a submission handler with external result storage to avoid React closure issues
 * @param {Function} setTicketForm - Function to update ticket form state
 * @returns {Object} Object containing submitTicket function and getSubmissionResult function
 */
export const createSubmissionHandler = (setTicketForm) => {
  let submissionResult = null;

  const submitTicket = async (formData, ticketType, uploadedFiles = []) => {
    console.info('api-response-flow: Starting submitTicket', { ticketType, hasFiles: uploadedFiles.length > 0 });
    try {
      const apiData = await prepareApiSubmission(
        formData,
        ticketType,
        uploadedFiles
      );
      console.info('api-response-flow: API data prepared, sending to proxy');
      const proxyResponse = await sendPreparedDataToProxy(apiData, 'create-support-ticket');
      console.info('api-response-flow: Received proxy response', { success: proxyResponse.success });

      if (proxyResponse.success) {
        console.info('api-response-flow: Ticket creation successful', { 
          ticketKey: proxyResponse.data.data.ticketKey,
          ticketUrl: proxyResponse.data.data.ticketUrl 
        });
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
        console.info('api-response-flow: Submission result stored and form updated');
        return submissionResult; // ✅ Return success result
      } else {
        console.error(`| ❌ ${ticketType} ticket creation failed:`, proxyResponse);
        console.info('api-response-flow: Ticket creation failed', { error: proxyResponse.error });
        submissionResult = {
          success: false,
          error: proxyResponse.error || 'Unknown error'
        };
        setTicketForm(prevForm => ({...prevForm, submissionError: proxyResponse.error || 'Unknown error'}));
        return submissionResult; // ✅ Return failure result
      }
    } catch (error) {
      console.error(`| ❌ Error sending ${ticketType} data to proxy:`, error);
      console.info('api-response-flow: Exception caught in submitTicket', { error: error.message });
      submissionResult = {
        success: false,
        error: error.message
      };
      setTicketForm(prevForm => ({...prevForm, submissionError: error.message}));
      return submissionResult; // ✅ Return error result
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
  console.info('api-response-flow: Generating success message', { submissionResult, ticketType });
  
  // Handle null/undefined submission result as an error
  if (!submissionResult) {
    console.info('api-response-flow: No submission result provided');
    return `We apologize, but there was an error submitting your ${ticketType}.\n\nPlease try again or contact our support team directly.`;
  }

  // Handle explicit failure
  if (!submissionResult.success) {
    console.info('api-response-flow: Submission result indicates failure', { error: submissionResult.error });
    return `We apologize, but there was an error submitting your ${ticketType}: ${submissionResult.error || 'Unknown error'}\n\nPlease try again or contact our support team directly.`;
  }

  // Handle success with ticket URL and key
  if (submissionResult.ticketUrl && submissionResult.ticketKey) {
    console.info('api-response-flow: Success with ticket URL and key', { 
      ticketUrl: submissionResult.ticketUrl, 
      ticketKey: submissionResult.ticketKey 
    });
    return `Your ${ticketType} has been submitted successfully.\n\nTicket: <a href="${submissionResult.ticketUrl}" target="_blank">${submissionResult.ticketKey}</a>\n\nOur support team will review your request and respond accordingly. Thank you for contacting ACCESS.`;
  }

  // Handle success without ticket URL (but this might indicate a partial failure)
  console.info('api-response-flow: Success but missing ticket URL/key');
  return `Your ${ticketType} has been submitted successfully.\n\nOur support team will review your request and respond accordingly. Thank you for contacting ACCESS.`;
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