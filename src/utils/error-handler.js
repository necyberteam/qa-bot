import { constants } from './strings';

/**
 * Handles bot errors and returns user-friendly error messages
 * @param {Object|Error} error - The error object or response
 * @returns {string} User-friendly error message
 */
export const handleBotError = (error) => {
  console.error('Bot error:', error);

  // If it's an error object with a message property
  if (error && error.error) {
    return constants.ERRORS.API_UNAVAILABLE;
  }

  // If it's a standard Error object
  if (error instanceof Error) {
    return constants.ERRORS.API_UNAVAILABLE;
  }

  // Default fallback
  return constants.ERRORS.API_UNAVAILABLE;
};