import React from 'react';
import { useMemo } from 'react';
import LoginButton from '../components/LoginButton';
import { DEFAULT_CONFIG } from '../config/constants';

/**
 * Custom hook to generate the chat flow configuration
 * @param {Object} params - Parameters for the flow
 * @param {string} params.welcomeMessage - Welcome message to display
 * @param {boolean} params.isBotLoggedIn - Whether the bot user is logged in
 * @param {string} params.loginUrl - URL for login
 * @param {Function} params.handleQuery - Function to handle AI queries
 * @param {boolean} params.hasQueryError - Whether there's a query error
 * @returns {Object} Flow configuration object
 */

function calculateWelcomeMessage(isBotLoggedIn, welcomeMessage) {
  const loggedInWelcome = welcomeMessage !== undefined ? welcomeMessage : DEFAULT_CONFIG.WELCOME_MESSAGE;
  const loggedOutWelcome = DEFAULT_CONFIG.WELCOME_MESSAGE_LOGGED_OUT;
  return isBotLoggedIn ? loggedInWelcome : loggedOutWelcome;
}

function calculateComponent(isBotLoggedIn, loginUrl){
  return !isBotLoggedIn ? <LoginButton loginUrl={loginUrl} /> : null;
}

const useChatFlow = ({ welcomeMessage, isBotLoggedIn, loginUrl, handleQuery, hasQueryError }) => {
  const flow = useMemo(() => ({
    start: {
      message: calculateWelcomeMessage(isBotLoggedIn, welcomeMessage),
      component: calculateComponent(isBotLoggedIn, loginUrl),
      path: isBotLoggedIn ? 'loop' : 'start'
    },
    loop: {
      message: async (params) => {
        await handleQuery(params);
      },
      path: () => hasQueryError ? 'start' : 'loop'
    }
  }), [isBotLoggedIn, loginUrl, handleQuery, hasQueryError, welcomeMessage]);

  return flow;
};

export default useChatFlow;