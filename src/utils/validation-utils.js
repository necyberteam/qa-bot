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
 * Validates uploaded files for image types (PNG/JPG only)
 * @param {FileList} fileList - The FileList object from file input
 * @returns {Object} - Validation result with success boolean and optional error message
 */
export const validateImageFiles = (fileList) => {
  if (!fileList || fileList.length === 0) {
    return {
      success: false,
      promptContent: "Please select at least one file to upload.",
      promptDuration: 3000,
      promptType: 'error',
      highlightTextArea: true
    };
  }

  const maxFileSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
  const allowedExtensions = ['.png', '.jpg', '.jpeg'];

  for (let i = 0; i < fileList.length; i++) {
    const file = fileList[i];
    
    // Check file size
    if (file.size > maxFileSize) {
      return {
        success: false,
        promptContent: `File "${file.name}" is too large. Maximum size is 10MB.`,
        promptDuration: 3000,
        promptType: 'error',
        highlightTextArea: true
      };
    }
    
    // Check file type by MIME type
    if (!allowedTypes.includes(file.type)) {
      // Also check by file extension as fallback
      const fileName = file.name.toLowerCase();
      const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
      
      if (!hasValidExtension) {
        return {
          success: false,
          promptContent: `File "${file.name}" must be a PNG or JPG image.`,
          promptDuration: 3000,
          promptType: 'error',
          highlightTextArea: true
        };
      }
    }
  }
  
  return { success: true };
};

/**
 * Validates uploaded files for general attachments (multiple types allowed)
 * @param {FileList} fileList - The FileList object from file input
 * @returns {Object} - Validation result with success boolean and optional error message
 */
export const validateGeneralFiles = (fileList) => {
  if (!fileList || fileList.length === 0) {
    return {
      success: false,
      promptContent: "Please select at least one file to upload.",
      promptDuration: 3000,
      promptType: 'error',
      highlightTextArea: true
    };
  }

  const maxFileSize = 25 * 1024 * 1024; // 25MB for general files
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
        promptContent: `File "${file.name}" is too large. Maximum size per file is 25MB.`,
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
        promptContent: `File "${file.name}" has an unsupported format. Allowed formats: PDF, PNG, JPG, GIF, DOC, DOCX, TXT, CSV, ZIP.`,
        promptDuration: 4000,
        promptType: 'error',
        highlightTextArea: true
      };
    }
  }
  
  // Check total size
  if (totalSize > maxTotalSize) {
    return {
      success: false,
      promptContent: "Total file size exceeds 50MB. Please reduce the number or size of files.",
      promptDuration: 3000,
      promptType: 'error',
      highlightTextArea: true
    };
  }
  
  return { success: true };
};