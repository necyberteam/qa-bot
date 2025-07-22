import { DEFAULT_CONFIG } from '../config/constants';

/**
 * Legacy function - ProForma mapping is now handled by the API
 * @param {Object} formData Form data 
 * @param {number} requestTypeId The JSM request type ID
 * @returns {Object} Form data (unchanged - API handles ProForma mapping)
 */
const mapProFormaFields = (formData) => {
  // ProForma field mapping is now handled by the API
  // This function is kept for backward compatibility but does no transformation
  return formData;
};

/**
 * Prepares data for future API submission
 * @param {Object} formData Form data for the ticket
 * @param {string} ticketType Type of ticket to create
 * @param {Array} uploadedFiles Files uploaded by the user (if any)
 * @returns {Promise<Object>} Formatted data for API submission
 */
export const prepareApiSubmission = async (formData, ticketType = 'support', uploadedFiles = []) => {
  // Map ticket types to their requestTypeId values
  const REQUEST_TYPE_IDS = {
    SUPPORT: 17,
    LOGIN_ACCESS: 30,
    LOGIN_PROVIDER: 31,
    SECURITY: 26
  };
  
  const requestTypeIds = {
    support: REQUEST_TYPE_IDS.SUPPORT,
    general_help: REQUEST_TYPE_IDS.SUPPORT,
    feedback: REQUEST_TYPE_IDS.SUPPORT,
    loginAccess: REQUEST_TYPE_IDS.LOGIN_ACCESS,
    loginProvider: REQUEST_TYPE_IDS.LOGIN_PROVIDER,
    security: REQUEST_TYPE_IDS.SECURITY
  };

  const requestTypeId = requestTypeIds[ticketType] || requestTypeIds.support;
  
  // Determine the correct service desk ID based on ticket type
  const serviceDeskId = ticketType === 'security' ? 3 : 2;
  
  // Map ProForma fields to JSM custom field IDs (now handled by API)
  const mappedFormData = mapProFormaFields(formData, requestTypeId);

  // Basic submission data (API handles ProForma form mapping automatically)
  const submissionData = {
    serviceDeskId: serviceDeskId,
    requestTypeId: requestTypeId,
    requestFieldValues: {
      ...mappedFormData
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
  
  // Use versioned API endpoints (these get redirected by netlify.toml)
  const serverBaseUrl = DEFAULT_CONFIG.netlifyBaseUrl.replace('/.netlify/functions/', ''); // Get base server URL
  
  let proxyEndpoint;
  if (endpointName === 'create-support-ticket') {
    proxyEndpoint = `${serverBaseUrl}/api/v1/tickets`;
  } else if (endpointName === 'create-security-incident') {
    proxyEndpoint = `${serverBaseUrl}/api/v1/security-incidents`;
  } else {
    proxyEndpoint = `${DEFAULT_CONFIG.netlifyBaseUrl}/${endpointName}`;
  }
    

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
 * Submits a security incident to JSM
 * @param {Object} formData Security incident form data
 * @param {Array} uploadedFiles Files uploaded by the user (if any)
 * @returns {Promise<Object>} The response from the API
 */
export const submitSecurityIncident = async (formData, uploadedFiles = []) => {
  try {
    // Prepare the data for security incident submission
    const submissionData = await prepareApiSubmission(formData, 'security', uploadedFiles);
    
    // Submit to the security incident endpoint
    const result = await sendPreparedDataToProxy(submissionData, 'create-security-incident');
    
    return result;
  } catch (error) {
    console.error('| ❌ Security incident submission failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};