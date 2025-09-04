export const DEFAULT_CONFIG = {
  LOGIN_URL: '/login',
  WELCOME_MESSAGE: 'Hello! What can I help you with?',
  WELCOME_MESSAGE_LOGGED_OUT: 'To ask questions, please log in.',
  WELCOME_MESSAGE_LOGIN_TRANSITION: 'Welcome! You are now logged in. What can I help you with?',
  WELCOME_MESSAGE_LOGOUT_TRANSITION: 'You have been logged out.',
  API_ENDPOINT: 'https://access-ai-grace1-external.ccs.uky.edu/access/chat/api/',
  RATING_ENDPOINT: 'https://access-ai-grace1-external.ccs.uky.edu/access/chat/rating/',
  METRICS_API_ENDPOINT: 'https://access-ai-grace1-external.ccs.uky.edu/access/xdmod/chat/api/',
  METRICS_RATING_ENDPOINT: 'https://access-ai-grace1-external.ccs.uky.edu/access/xdmod/chat/rating/',
  METRICS_QUESTIONS_URL: 'https://metrics.access-ci.org/qa_bot_faq',

  // Netlify function URL - this should point to the Netlify functions endpoint for ticket submission
  // NOT the Q&A API endpoint
  netlifyBaseUrl: (typeof process !== 'undefined' && process.env) ? process.env.REACT_APP_NETLIFY_BASE_URL : 'https://access-jsm-api.netlify.app',

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

// Runtime functions to get endpoints (handles env vars that may not be available at build time)
export const getApiEndpoint = () => {
  return (typeof process !== 'undefined' && process.env?.REACT_APP_API_ENDPOINT)
    ? process.env.REACT_APP_API_ENDPOINT
    : DEFAULT_CONFIG.API_ENDPOINT;
};

export const getRatingEndpoint = () => {
  return (typeof process !== 'undefined' && process.env?.REACT_APP_RATING_ENDPOINT)
    ? process.env.REACT_APP_RATING_ENDPOINT
    : DEFAULT_CONFIG.RATING_ENDPOINT;
};

export const getMetricsApiEndpoint = () => {
  return (typeof process !== 'undefined' && process.env?.REACT_APP_METRICS_API_ENDPOINT)
    ? process.env.REACT_APP_METRICS_API_ENDPOINT
    : DEFAULT_CONFIG.METRICS_API_ENDPOINT;
};

export const getMetricsRatingEndpoint = () => {
  return (typeof process !== 'undefined' && process.env?.REACT_APP_METRICS_RATING_ENDPOINT)
    ? process.env.REACT_APP_METRICS_RATING_ENDPOINT
    : DEFAULT_CONFIG.METRICS_RATING_ENDPOINT;
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
  // Simplified for better Netlify compatibility
  return providedApiKey || process.env.REACT_APP_API_KEY || null;
};