export const DEFAULT_CONFIG = {
  LOGIN_URL: '/login',
  WELCOME_MESSAGE: 'Hello! What can I help you with?',
  WELCOME_MESSAGE_LOGGED_OUT: 'To ask questions, please log in.',
  WELCOME_MESSAGE_LOGIN_TRANSITION: 'Welcome! You are now logged in. What can I help you with?',
  WELCOME_MESSAGE_LOGOUT_TRANSITION: 'You have been logged out.',
  API_ENDPOINT: 'https://access-ai.ccs.uky.edu/api/query',
  //API_ENDPOINT: 'https://access-ai.ccs.uky.edu:543/api/query',

  // Netlify function URL
  netlifyBaseUrl: (typeof process !== 'undefined' && process.env) ? process.env.REACT_APP_NETLIFY_BASE_URL : 'https://access-ai.ccs.uky.edu/api/query',

  ERRORS: {
    API_UNAVAILABLE: 'Unable to contact the Q&A Bot. Please try again later.',
  },

  BEHAVIOR: {
    SHOW_RATING_AFTER_FAILED_QUERY: true
  },

  THEME: {
    PRIMARY_COLOR: '#1a5b6e',
    SECONDARY_COLOR: '#107180',
    FONT_FAMILY: 'Arial, sans-serif'
  },

  CHATBOT: {
    TITLE: 'ACCESS Q&A',
    AVATAR_URL: 'https://support.access-ci.org/themes/contrib/asp-theme/images/icons/ACCESS-arrrow.svg',
    TOOLTIP_TEXT: 'Ask me about ACCESS! 😊'
  }
};

// Helper functions from strings.js
export const buildWelcomeMessage = (isLoggedIn, welcomeMessage) => {
  if (isLoggedIn) {
    return welcomeMessage || DEFAULT_CONFIG.WELCOME_MESSAGE;
  } else {
    // Since tickets and feedback are available to everyone, use the normal welcome
    return welcomeMessage || DEFAULT_CONFIG.WELCOME_MESSAGE;
  }
};

export const getApiKey = (providedApiKey) => {
  // Return provided API key if available, otherwise fall back to environment variable
  return providedApiKey || ((typeof process !== 'undefined' && process.env) ? process.env.REACT_APP_API_KEY : null);
};