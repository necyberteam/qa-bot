export const DEFAULT_CONFIG = {
  LOGIN_URL: '/login',
  PROMPT_TEXT: 'Questions should stand alone and not refer to previous ones.',
  WELCOME_MESSAGE: 'Hello! What can I help you with?',
  WELCOME_MESSAGE_LOGGED_OUT: 'To ask questions, please log in.',
  WELCOME_MESSAGE_LOGIN_TRANSITION: 'Welcome! You are now logged in. How can I help you today?',
  WELCOME_MESSAGE_LOGOUT_TRANSITION: 'You have been logged out.',
  API_ENDPOINT: 'https://access-ai.ccs.uky.edu/api/query',

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
    TITLE: 'ACCESS Q&A Bot',
    AVATAR_URL: 'https://support.access-ci.org/themes/contrib/asp-theme/images/icons/ACCESS-arrrow.svg',
    TOOLTIP_TEXT: 'Ask me about ACCESS! 😊'
  }
};