import React from 'react';
import HomeIcon from '../components/icons/HomeIcon';

// Constants for the QA Bot
export const CONSTANTS = {
  // URLs
  queryEndpointUrl: 'https://access-ai.ccs.uky.edu/api/query',
  avatarUrl: 'https://support.access-ci.org/themes/contrib/asp-theme/images/icons/ACCESS-arrrow.svg',
  aboutToolUrl: 'https://support.access-ci.org/tools/access-qa-tool',
  feedbackUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSeWnE1r738GU1u_ri3TRpw9dItn6JNPi7-FH7QFB9bAHSVN0w/viewform',
  netlifyBaseUrl: process.env.REACT_APP_NETLIFY_BASE_URL,
  netlifyFunctionName: process.env.REACT_APP_NETLIFY_FUNCTION_NAME,

  // Text content
  aboutToolText: 'about this tool',
  feedbackText: 'give us feedback',
  headerTitleText: 'ACCESS Q&A Bot',
  disabledPlaceholderText: 'Please log in to ask questions.',
  tooltipText: 'Ask me about ACCESS! 😊',
};

// Default props for the QA Bot
export const DEFAULTS = {
  welcome: 'Hello! What can I help you with?',
  prompt: 'Questions should stand alone and not refer to previous ones.',
  embedded: false,
  isLoggedIn: false,
  isAnonymous: true,
  disabled: true,
  isOpen: false,
};

/**
 * Prepares data for future API submission
 * @param {Object} formData Form data for the ticket
 * @param {string} ticketType Type of ticket to create
 * @param {Array} uploadedFiles Files uploaded by the user (if any)
 * @returns {Promise<Object>} Formatted data for API submission
 */
export const prepareApiSubmission = async (formData, ticketType = 'support', uploadedFiles = []) => {
  console.log("| 2 🌎 prepareApiSubmission preparing data...");
  // Map ticket types to their requestTypeId values
  const requestTypeIds = {
    support: 17,
    loginAccess: 30,
    loginProvider: 31,
    dev: 10006  // Added dev ticket type
  };

  // Basic submission data
  const submissionData = {
    serviceDeskId: ticketType === 'dev' ? 1 : 2,
    requestTypeId: requestTypeIds[ticketType] || requestTypeIds.support,
    requestFieldValues: {
      ...formData
    }
  };

  // Add file information if any files were uploaded
  if (uploadedFiles && uploadedFiles.length > 0) {
    // Process each file to convert to base64
    const processedFiles = await Promise.all(
      uploadedFiles.map(async (file) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            // Get the base64 string by removing the data URL prefix
            const base64String = reader.result.split(',')[1];
            resolve({
              fileName: file.name,
              contentType: file.type,
              size: file.size,
              fileData: base64String
            });
          };
          reader.onerror = () => reject(new Error(`Failed to read file ${file.name}`));
          reader.readAsDataURL(file);
        });
      })
    );

    submissionData.attachments = processedFiles;
  }
  return submissionData;
};

/**
 * POSTs prepared data to the netlify proxy endpoint
 * @param {Object} submissionData The data to send
 * @param {string} endpointName The name of the endpoint to use
 * @returns {Promise<Object>} The response from the proxy
 */
export const sendPreparedDataToProxy = async (submissionData, endpointName) => {
  const proxyEndpoint = `${CONSTANTS.netlifyBaseUrl}${CONSTANTS.netlifyFunctionName}/${endpointName}`;
  console.log(`| 4 🌎 Sending prepared data (${proxyEndpoint}):`, submissionData);

  try {
    const response = await fetch(proxyEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submissionData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('| ❌ Post data to proxy failed:', response.status, errorText);
      return {
        success: false,
        status: response.status,
        error: errorText
      };
    }

    const data = await response.json();
    console.log('| ✅ Post data to proxy successful:', data);
    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('| ❌ Post data to proxy exception:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Creates footer JSX for the chatbot
 * @returns {JSX.Element} Footer content
 */
export const createFooterContent = () => {
  return (
    <div>
      Find out more <a href={CONSTANTS.aboutToolUrl}>{CONSTANTS.aboutToolText}</a> or <a href={CONSTANTS.feedbackUrl}>{CONSTANTS.feedbackText}</a>.
    </div>
  );
};

/**
 * Creates header configuration for ChatBot component
 * @returns {Object} Header configuration object
 */
export const createHeaderSettings = () => {
  return {
    title: CONSTANTS.headerTitleText,
    avatar: CONSTANTS.avatarUrl,
    buttons: [
      <div className="header-home-button">
        <button
          onClick={() => alert("You clicked the home button!")}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            padding: '5px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <HomeIcon />
        </button>
      </div>
    ]
  };
};

/**
 * Creates settings configuration for ChatBot component
 * @param {Object} config - Configuration options
 * @param {Function} config.getThemeColors - Function to get theme colors
 * @param {string} config.prompt - Prompt text for enabled state
 * @param {boolean} config.disabled - Whether the input is disabled
 * @returns {Object} Complete settings object for ChatBot
 */
export const createChatBotSettings = ({ getThemeColors, prompt, disabled }) => {
  return {
    general: getThemeColors(),
    header: createHeaderSettings(),
    chatInput: {
      enabledPlaceholderText: prompt,
      disabledPlaceholderText: CONSTANTS.disabledPlaceholderText,
      disabled: disabled
    },
    chatHistory: { disabled: true },
    botBubble: {
      simStream: true,
      dangerouslySetInnerHtml: true
    },
    chatButton: {
      icon: CONSTANTS.avatarUrl,
    },
    tooltip: {
      text: CONSTANTS.tooltipText,
    },
    audio: {
      disabled: true,
    },
    emoji: {
      disabled: true,
    },
    fileAttachment: {
      disabled: true,
    },
    notification: {
      disabled: true,
    },
    footer: {
      text: createFooterContent(),
    },
  };
};
