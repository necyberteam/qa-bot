import { useEffect, useRef } from 'react';
import { useMessages } from 'react-chatbotify';
import { constants } from '../utils/strings';

/**
 * Custom hook to handle login state transitions with automatic message injection
 * @param {boolean} isBotLoggedIn - Current login state
 */
const useLoginStateTransition = (isBotLoggedIn) => {
  const prevLoginStateRef = useRef(isBotLoggedIn);
  const { injectMessage } = useMessages();

  useEffect(() => {
    const loginStateChanged = prevLoginStateRef.current !== isBotLoggedIn;
    const justLoggedIn = !prevLoginStateRef.current && isBotLoggedIn;

    if (loginStateChanged) {
      if (justLoggedIn) {
        injectMessage(constants.WELCOME_MESSAGE_LOGIN_TRANSITION, 'bot');
      } else {
        injectMessage(constants.WELCOME_MESSAGE_LOGOUT_TRANSITION, 'bot');
      }
    }

    // Update the previous state for next comparison
    prevLoginStateRef.current = isBotLoggedIn;
  }, [isBotLoggedIn, injectMessage]);
};

export default useLoginStateTransition;