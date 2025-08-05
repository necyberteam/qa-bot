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
  console.info('api-response-flow: Starting sendPreparedDataToProxy', { endpointName });

  // Use versioned API endpoints
  // These get redirected by netlify.toml in backend repo (e.g. /api/v1/tickets → /.netlify/functions/tickets)
  // But some legacy env files might have "/.netlify/functions/" or "/.netlify/functions"
  // Once we are sure no one else is developing with that pattern we can remove these replaces
  const serverBaseUrl = DEFAULT_CONFIG.netlifyBaseUrl
    .replace('/.netlify/functions/', '')
    .replace('/.netlify/functions', '');

  let proxyEndpoint;
  if (endpointName === 'create-support-ticket') {
    proxyEndpoint = `${serverBaseUrl}/api/v1/tickets`;
  } else if (endpointName === 'create-security-incident') {
    proxyEndpoint = `${serverBaseUrl}/api/v1/security-incidents`;
  } else {
    proxyEndpoint = `${DEFAULT_CONFIG.netlifyBaseUrl}/${endpointName}`;
  }

  console.info('api-response-flow: Proxy endpoint determined', { proxyEndpoint });

  try {
    console.info('api-response-flow: Sending POST request to proxy');
    const response = await fetch(proxyEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submissionData)
    });

    console.info('api-response-flow: Received response', { status: response.status, ok: response.ok });
    
    if (!response.ok) {
      console.info('api-response-flow: Response not OK, processing error');
      let errorMessage = '';
      try {
        const errorText = await response.text();
        console.error('| ❌ Post data to proxy failed:', response.status, errorText);
        console.info('api-response-flow: Error text received', { errorText });
        
        // Try to parse as JSON to get a better error message
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorJson.error || errorText;
        } catch {
          // If not JSON, use the text as-is
          errorMessage = errorText;
        }
      } catch {
        errorMessage = `HTTP ${response.status} ${response.statusText}`;
      }
      
      // Add user-friendly message for common HTTP errors
      if (response.status === 403) {
        errorMessage = 'The ticket service is temporarily unavailable. Please try again later or contact support directly.';
      } else if (response.status === 404) {
        errorMessage = 'Ticket service not found. Please try again later.';
      } else if (response.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (response.status === 401) {
        errorMessage = 'Authentication error with the ticket service. Please contact support.';
      }
      
      console.info('api-response-flow: Returning error response', { errorMessage, status: response.status });
      return {
        success: false,
        status: response.status,
        error: errorMessage
      };
    }

    console.info('api-response-flow: Response OK, parsing JSON');
    const data = await response.json();
    console.info('api-response-flow: Successfully parsed response data', { data });
    console.info('api-response-flow: Returning success response');
    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('| ❌ Post data to proxy exception:', error);
    console.info('api-response-flow: Caught exception during request', { error: error.message });
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