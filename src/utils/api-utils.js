import { DEFAULT_CONFIG } from '../config/constants';

/**
 * Prepares data for future API submission
 * @param {Object} formData Form data for the ticket
 * @param {string} ticketType Type of ticket to create
 * @param {Array} uploadedFiles Files uploaded by the user (if any)
 * @returns {Promise<Object>} Formatted data for API submission
 */
export const prepareApiSubmission = async (formData, ticketType = 'support', uploadedFiles = []) => {
  console.log("| 2 🌎 prepareApiSubmission preparing data...", formData, ticketType, uploadedFiles);
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
  console.log("| 🌎 Submission data:", submissionData);
  return submissionData;
};

/**
 * POSTs prepared data to the netlify proxy endpoint
 * @param {Object} submissionData The data to send
 * @param {string} endpointName The name of the endpoint to use
 * @returns {Promise<Object>} The response from the proxy
 */
export const sendPreparedDataToProxy = async (submissionData, endpointName) => {
  console.log("| 🌎 endpointName parameter:", endpointName);
  const proxyEndpoint = `${DEFAULT_CONFIG.netlifyBaseUrl}${endpointName}`;
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