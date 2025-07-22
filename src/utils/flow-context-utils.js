/**
 * Utility functions for flows to access current form context
 * This solves the React closure issue by providing access to current form state
 */

// Store a reference to the current form context for use in flow functions
let currentFormContext = null;

/**
 * Sets the current form context reference
 * This should be called when the flow is created with the latest context
 */
export const setCurrentFormContext = (formContext) => {
  currentFormContext = formContext;
};

/**
 * Gets the current ticket form state
 * This always returns the latest state, not stale closure state
 */
export const getCurrentTicketForm = () => {
  if (!currentFormContext) {
    console.warn('Form context not available, returning empty form');
    return {};
  }
  const ticketForm = currentFormContext.ticketForm;
  return (ticketForm && typeof ticketForm === 'object') ? ticketForm : {};
};

/**
 * Gets the current feedback form state
 * This always returns the latest state, not stale closure state
 */
export const getCurrentFeedbackForm = () => {
  if (!currentFormContext) {
    console.warn('Form context not available, returning empty form');
    return {};
  }
  const feedbackForm = currentFormContext.feedbackForm;
  return (feedbackForm && typeof feedbackForm === 'object') ? feedbackForm : {};
};

/**
 * Updates the ticket form
 */
export const updateCurrentTicketForm = (updates) => {
  if (!currentFormContext) {
    console.warn('Form context not available, cannot update form');
    return;
  }
  currentFormContext.updateTicketForm(updates);
};

/**
 * Updates the feedback form
 */
export const updateCurrentFeedbackForm = (updates) => {
  if (!currentFormContext) {
    console.warn('Form context not available, cannot update form');
    return;
  }
  currentFormContext.updateFeedbackForm(updates);
};

/**
 * Gets a specific field value with fallback
 */
export const getCurrentFieldValue = (fieldName, formType = 'ticket', fallback = 'Not provided') => {
  const form = formType === 'ticket' ? getCurrentTicketForm() : getCurrentFeedbackForm();
  return (form && form[fieldName]) || fallback;
};

/**
 * Gets current form with user info merged
 */
export const getCurrentFormWithUserInfo = (userInfo = {}) => {
  const currentForm = getCurrentTicketForm() || {};
  const safeUserInfo = userInfo && typeof userInfo === 'object' ? userInfo : {};
  
  return {
    ...currentForm,
    email: safeUserInfo.email || currentForm.email,
    name: safeUserInfo.name || currentForm.name,
    accessId: safeUserInfo.accessId || currentForm.accessId
  };
};