import React from 'react';
import { useMemo } from 'react';
import LoginButton from '../components/LoginButton';
import ThumbsUpThumbsDown from '../components/ThumbsUpThumbsDown';
import { DEFAULT_CONFIG } from '../config/constants';

/**
 * Custom hook to generate the chat flow configuration
 * @param {Object} params - Parameters for the flow
 * @param {string} params.welcomeMessage - Welcome message to display
 * @param {boolean} params.isBotLoggedIn - Whether the bot user is logged in
 * @param {string} params.loginUrl - URL for login
 * @param {Function} params.handleQuery - Function to handle AI queries
 * @param {string} params.sessionId - Session ID for tracking the conversation
 * @returns {Object} Flow configuration object
 */

function calculateWelcomeMessage(isBotLoggedIn, welcomeMessage) {
  const loggedInWelcome = welcomeMessage !== undefined
    ? welcomeMessage
    : DEFAULT_CONFIG.WELCOME_MESSAGE;

  return isBotLoggedIn
    ? loggedInWelcome
    : DEFAULT_CONFIG.WELCOME_MESSAGE_LOGGED_OUT;
}

function renderLoginButton(isBotLoggedIn, loginUrl) {
  return !isBotLoggedIn
    ? <LoginButton loginUrl={loginUrl} />
    : null;
}

function determineNextPathAfterQuery(querySuccess) {
  if (querySuccess) {
    return 'ratingForm';
  }

  return DEFAULT_CONFIG.BEHAVIOR.SHOW_RATING_AFTER_FAILED_QUERY
    ? 'ratingForm'
    : 'silentStart';
}

const useChatFlow = ({
  welcomeMessage,
  isBotLoggedIn,
  loginUrl,
  handleQuery,
  sessionId,
  currentQueryId
}) => {
  const flow = useMemo(() => ({
    start: {
      message: calculateWelcomeMessage(isBotLoggedIn, welcomeMessage),
      component: renderLoginButton(isBotLoggedIn, loginUrl),
      path: isBotLoggedIn ? 'loop' : 'start'
    },
    silentStart: {
      component: renderLoginButton(isBotLoggedIn, loginUrl),
      path: isBotLoggedIn ? 'loop' : 'start'
    },
    ratingForm: {
      message: 'Was this response helpful?',
      component: <ThumbsUpThumbsDown sessionId={sessionId} currentQueryId={currentQueryId} />,
      path: 'loop'
    },
    loop: {
      message: async (params) => {
        const querySuccess = await handleQuery(params);
        console.log('| querySuccess', querySuccess);
        const nextPath = determineNextPathAfterQuery(querySuccess);
        await params.goToPath(nextPath);
        return "";
      },
      transition: { duration: 0, interruptable: false }
    }
  }), [isBotLoggedIn, loginUrl, handleQuery, welcomeMessage, sessionId, currentQueryId]);

  return flow;
};

export default useChatFlow;