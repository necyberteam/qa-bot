/**
 * Email validation utility functions
 */

/**
 * Validates email format using a comprehensive regex pattern
 * @param {string} email - The email address to validate
 * @returns {boolean} - True if email is valid, false otherwise
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  // Comprehensive email regex pattern
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  return emailRegex.test(email.trim());
};

/**
 * Creates email validation for chat bot flows
 * @param {string} email - The email to validate
 * @returns {Object} - Validation result with success boolean and message string
 */
export const validateEmail = (email) => {
  const trimmedEmail = email?.trim() || '';
  
  if (!trimmedEmail) {
    return {
      success: false,
      promptContent: "Please enter an email address.",
      promptDuration: 3000,
      promptType: 'error',
      highlightTextArea: true
    };
  }
  
  if (!isValidEmail(trimmedEmail)) {
    return {
      success: false,
      promptContent: "Please enter a valid email address (e.g., user@example.com).",
      promptDuration: 3000,
      promptType: 'error',
      highlightTextArea: true
    };
  }
  
  return {
    success: true
  };
};

/**
 * File validation utility functions
 */

/**
 * Validates uploaded files for all flows
 * @param {FileList} fileList - The FileList object from file input
 * @returns {Object} - Validation result with success boolean and optional error message
 */
export const validateFileUpload = (fileList) => {
  if (!fileList || fileList.length === 0) {
    return {
      success: false,
      promptContent: "Please select at least one file to upload.",
      promptDuration: 3000,
      promptType: 'error',
      highlightTextArea: true
    };
  }

  const maxFileSize = 25 * 1024 * 1024; // 25MB per file
  const maxTotalSize = 50 * 1024 * 1024; // 50MB total
  const allowedExtensions = ['.pdf', '.png', '.jpg', '.jpeg', '.gif', '.doc', '.docx', '.txt', '.csv', '.zip'];
  
  let totalSize = 0;

  for (let i = 0; i < fileList.length; i++) {
    const file = fileList[i];
    totalSize += file.size;
    
    // Check individual file size
    if (file.size > maxFileSize) {
      return {
        success: false,
        promptContent: `File "${file.name}" is too large.`,
        promptDuration: 3000,
        promptType: 'error',
        highlightTextArea: true
      };
    }
    
    // Check file extension
    const fileName = file.name.toLowerCase();
    const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
    
    if (!hasValidExtension) {
      return {
        success: false,
        promptContent: `File "${file.name}" has an unsupported format.`,
        promptDuration: 3000,
        promptType: 'error',
        highlightTextArea: true
      };
    }
  }
  
  // Check total size
  if (totalSize > maxTotalSize) {
    return {
      success: false,
      promptContent: "Total file size is too large.",
      promptDuration: 3000,
      promptType: 'error',
      highlightTextArea: true
    };
  }
  
  return { success: true };
};