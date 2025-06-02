// Default configuration values for the QA Bot
export const constants = {
  LOGIN_URL: '/login',
  PROMPT_TEXT: 'Questions should stand alone and not refer to previous ones.',
  WELCOME_MESSAGE: 'Hello! What can I help you with?',
  WELCOME_MESSAGE_LOGGED_OUT: 'To ask questions, please log in.',
  WELCOME_MESSAGE_LOGIN_TRANSITION: 'Welcome! You are now logged in. How can I help you today?',
  WELCOME_MESSAGE_LOGOUT_TRANSITION: 'You have been logged out.',
  API_ENDPOINT: 'https://access-ai.ccs.uky.edu/api/query',

  // Error messages
  ERRORS: {
    API_UNAVAILABLE: 'Unable to contact the Q&A Bot. Please try again later.',
  },

  // Theme defaults
  THEME: {
    PRIMARY_COLOR: '#1a5b6e',
    SECONDARY_COLOR: '#107180',
    FONT_FAMILY: 'Arial, sans-serif'
  },

  // Chat bot UI defaults
  CHATBOT: {
    TITLE: 'ACCESS Q&A Bot',
    AVATAR_URL: 'https://support.access-ci.org/themes/contrib/asp-theme/images/icons/ACCESS-arrrow.svg',
    TOOLTIP_TEXT: 'Ask me about ACCESS! 😊'
  },

  // Netlify function constants
  netlifyBaseUrl: process.env.REACT_APP_NETLIFY_BASE_URL,
  netlifyFunctionName: process.env.REACT_APP_NETLIFY_FUNCTION_NAME,
};

export const buildWelcomeMessage = (isLoggedIn, welcomeMessage) => {
  if (isLoggedIn) {
    return welcomeMessage || constants.WELCOME_MESSAGE;
  } else {
    return constants.WELCOME_MESSAGE_LOGGED_OUT;
  }
};

export const getApiKey = (providedApiKey) => {
  // Return provided API key if available, otherwise fall back to environment variable
  return providedApiKey || process.env.REACT_APP_API_KEY;
};