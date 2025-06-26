/**
 * Creates a validation function for optional fields that auto-fills with "Not provided"
 * and automatically submits when the user presses Enter on an empty field.
 * 
 * @returns {Function} Validation function for optional fields
 */
export const createOptionalFieldValidator = () => {
  return (userInput) => {
    // If empty, auto-fill with "Not provided" and submit
    if (!userInput || userInput.trim() === '') {
      setTimeout(() => {
        const inputField = document.querySelector('.rcb-chat-input-textarea');
        if (inputField) {
          inputField.value = "Not provided";
          const inputEvent = new Event('input', { bubbles: true });
          inputField.dispatchEvent(inputEvent);
          
          // Auto-submit by triggering mousedown on send button
          setTimeout(() => {
            const sendButton = document.querySelector('.rcb-send-button, .rcb-chat-send-button, [aria-label*="send"], button[type="submit"]');
            if (sendButton) {
              const mouseDownEvent = new MouseEvent('mousedown', {
                bubbles: true,
                cancelable: true,
                view: window
              });
              sendButton.dispatchEvent(mouseDownEvent);
            }
          }, 200);
        }
      }, 100);
    }
    
    return { success: true };
  };
};

/**
 * Processes optional field input, converting empty values to "Not provided"
 * 
 * @param {string} userInput - The user's input
 * @returns {string} Processed input value
 */
export const processOptionalInput = (userInput) => {
  if (!userInput || userInput.trim() === '') {
    return "Not provided";
  }
  return userInput;
};