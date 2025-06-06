import React, { useRef, useState, useEffect } from 'react';
import ChatBot, { ChatBotProvider } from "react-chatbotify";
import { v4 as uuidv4 } from 'uuid';
import BotController from './BotController';
import useThemeColors from '../hooks/useThemeColors';
import useChatBotSettings from '../hooks/useChatBotSettings';
import useHandleAIQuery from '../hooks/useHandleAIQuery';
import useChatFlow from '../hooks/useChatFlow';
import useUpdateHeader from '../hooks/useUpdateHeader';
import useRingEffect from '../hooks/useRingEffect';
import { DEFAULT_CONFIG } from '../config/constants';


const generateSessionId = () => {
  return `qa_bot_session_${uuidv4()}`;
};

const getOrCreateSessionId = () => {
  // Check if we already have a session ID in localStorage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('qa_bot_session_')) {
      const sessionId = localStorage.getItem(key);
      if (sessionId) {
        return sessionId;
      }
    }
  }
  const newSessionId = generateSessionId();
  localStorage.setItem(newSessionId, newSessionId);
  return newSessionId;
};

const buildWelcomeMessage = (isLoggedIn, welcomeMessage) => {
  if (isLoggedIn) {
    return welcomeMessage || DEFAULT_CONFIG.WELCOME_MESSAGE;
  } else {
    return DEFAULT_CONFIG.WELCOME_MESSAGE_LOGGED_OUT;
  }
}

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
const QABot = React.forwardRef((props, botRef) => {
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
  const sessionIdRef = useRef(getOrCreateSessionId());
  const sessionId = sessionIdRef.current;
  const [currentQueryId, setCurrentQueryId] = useState(null);

  // Update internal state when isLoggedIn prop changes
  useEffect(() => {
    if (isLoggedIn !== undefined) {
      setIsBotLoggedIn(isLoggedIn);
    }
  }, [isLoggedIn]);

  // Initialize currentQueryId as null - will be set by useHandleAIQuery
  // when actual queries are processed

  // Listen for chat window toggle events from react-chatbotify
  useEffect(() => {
    if (!embedded && onOpenChange) {
      const handleChatWindowToggle = (event) => {
        if (botRef && botRef.current && botRef.current._markAsUserInteraction) {
          botRef.current._markAsUserInteraction();
        }
        const newOpenState = event.data.newState;
        onOpenChange(newOpenState);
      };
      window.addEventListener('rcb-toggle-chat-window', handleChatWindowToggle);

      return () => {
        window.removeEventListener('rcb-toggle-chat-window', handleChatWindowToggle);
      };
    }
  }, [embedded, onOpenChange, botRef]);

  const welcomeMessage = buildWelcomeMessage(isBotLoggedIn, welcome);
  const containerRef = useRef(null);
  const themeColors = useThemeColors(containerRef);

  const chatBotSettings = useChatBotSettings({
    themeColors,
    embedded,
    defaultOpen: open,
    isLoggedIn: isBotLoggedIn
  });

  const handleQuery = useHandleAIQuery(finalApiKey, sessionId, setCurrentQueryId);

  const flow = useChatFlow({
    welcomeMessage,
    isBotLoggedIn,
    loginUrl,
    handleQuery,
    sessionId,
    currentQueryId
  });

  useUpdateHeader(isBotLoggedIn, containerRef);
  useRingEffect(ringEffect, containerRef);

  return (
        <div className={`qa-bot ${embedded ? "embedded-qa-bot" : ""}`} ref={containerRef}>
      <ChatBotProvider>
        <BotController
          ref={botRef}
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