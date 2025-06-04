import React, { useRef, useState, useEffect } from 'react';
import ChatBot, { ChatBotProvider } from "react-chatbotify";
import BotController from './BotController';
import useThemeColors from '../hooks/useThemeColors';
import useChatBotSettings from '../hooks/useChatBotSettings';
import useHandleAIQuery from '../hooks/useHandleAIQuery';
import useChatFlow from '../hooks/useChatFlow';
import useUpdateHeader from '../hooks/useUpdateHeader';
import useRingEffect from '../hooks/useRingEffect';
import { DEFAULT_CONFIG } from '../config/constants';

/**
 * Q&A Bot Component (Controlled)
 *
 * @param {Object}    [props]
 * @param {string}    [props.apiKey] - API key for the Q&A endpoint
 * @param {boolean}   [props.open] - Whether the chat window is open (floating mode only, ignored for embedded)
 * @param {Function}  [props.onOpenChange] - Callback when chat window open state changes
 * @param {boolean}   [props.embedded=false] - Whether the bot is embedded in the page (always open when embedded)
 * @param {boolean}   [props.isLoggedIn=false] - Whether the user is logged in
 * @param {string}    [props.loginUrl='/login'] - URL to redirect for login
 * @param {boolean}   [props.ringEffect=true] - Whether to apply the phone ring animation effect to the tooltip
 * @param {string}    [props.welcome='Hello! What can I help you with?'] - Welcome message
 * @returns {JSX.Element}
 */

const buildWelcomeMessage = (isLoggedIn, welcomeMessage) => {
  if (isLoggedIn) {
    return welcomeMessage || DEFAULT_CONFIG.WELCOME_MESSAGE;
  } else {
    return DEFAULT_CONFIG.WELCOME_MESSAGE_LOGGED_OUT;
  }
}

const QABot = React.forwardRef((props, ref) => {
  const {
    apiKey,
    open = false,
    onOpenChange,
    embedded = false,
    isLoggedIn,
    loginUrl = DEFAULT_CONFIG.LOGIN_URL,
    ringEffect = true,
    welcome
  } = props;

  const finalApiKey = apiKey || process.env.REACT_APP_API_KEY;

  const [isBotLoggedIn, setIsBotLoggedIn] = useState(isLoggedIn !== undefined ? isLoggedIn : false);
  const [hasQueryError, setHasQueryError] = useState(false);

  // Update internal state when isLoggedIn prop changes
  useEffect(() => {
    if (isLoggedIn !== undefined) {
      setIsBotLoggedIn(isLoggedIn);
    }
  }, [isLoggedIn]);

  // Listen for chat window toggle events from react-chatbotify
  useEffect(() => {
    if (!embedded && onOpenChange) {
      const handleChatWindowToggle = (event) => {
        if (ref && ref.current && ref.current._markAsUserInteraction) {
          ref.current._markAsUserInteraction();
        }
        const newOpenState = event.data.newState;
        onOpenChange(newOpenState);
      };
      window.addEventListener('rcb-toggle-chat-window', handleChatWindowToggle);

      return () => {
        window.removeEventListener('rcb-toggle-chat-window', handleChatWindowToggle);
      };
    }
  }, [embedded, onOpenChange, ref]);

  const welcomeMessage = buildWelcomeMessage(isBotLoggedIn, welcome);
  const containerRef = useRef(null);
  const themeColors = useThemeColors(containerRef);

  const chatBotSettings = useChatBotSettings({
    themeColors,
    embedded,
    defaultOpen: open,
    isLoggedIn: isBotLoggedIn
  });

  // Use the AI query handling hook
  const handleQuery = useHandleAIQuery(finalApiKey, setHasQueryError);

  // Use the chat flow hook
  const flow = useChatFlow({
    welcomeMessage,
    isBotLoggedIn,
    loginUrl,
    handleQuery,
    hasQueryError
  });

  useUpdateHeader(isBotLoggedIn, containerRef);
  useRingEffect(ringEffect, containerRef);

  return (
    <div className={`qa-bot ${embedded ? "embedded-qa-bot" : ""}`} ref={containerRef}>
      <ChatBotProvider>
        <BotController
          ref={ref}
          embedded={embedded}
          isBotLoggedIn={isBotLoggedIn}
          currentOpen={open}
        />
        <ChatBot
          settings={chatBotSettings}
          flow={flow}
        />
      </ChatBotProvider>
    </div>
  );
});

export default QABot;