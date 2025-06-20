import React, { useRef, useState, useEffect, useMemo } from 'react';
import ChatBot, { ChatBotProvider } from "react-chatbotify";
import HtmlRenderer from "@rcb-plugins/html-renderer";
import { v4 as uuidv4 } from 'uuid';
import BotController from './BotController';
import useThemeColors from '../hooks/useThemeColors';
import useChatBotSettings from '../hooks/useChatBotSettings';
import useHandleAIQuery from '../hooks/useHandleAIQuery';
import useUpdateHeader from '../hooks/useUpdateHeader';
import useRingEffect from '../hooks/useRingEffect';
import useFocusableSendButton from '../hooks/useFocusableSendButton';
import { DEFAULT_CONFIG, buildWelcomeMessage } from '../config/constants';
import { createBotFlow } from '../utils/create-bot-flow';


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
  const [ticketForm, setTicketForm] = useState({});

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

  const flow = useMemo(() => createBotFlow({
    welcomeMessage,
    isBotLoggedIn,
    loginUrl,
    handleQuery,
    sessionId,
    currentQueryId,
    ticketForm,
    setTicketForm
  }), [welcomeMessage, isBotLoggedIn, loginUrl, handleQuery, sessionId, currentQueryId]);

  useUpdateHeader(isBotLoggedIn, containerRef);
  useRingEffect(ringEffect, containerRef);
  useFocusableSendButton();

  return (
    <div 
      className={`qa-bot ${embedded ? "embedded-qa-bot" : ""}`} 
      ref={containerRef}
      role="region"
      aria-label="Ask ACCESS tool"
    >
      <ChatBotProvider>
        <main role="main" aria-label="Chat interface">
          <BotController
            ref={botRef}
            embedded={embedded}
            isBotLoggedIn={isBotLoggedIn}
            currentOpen={open}
          />
          <ChatBot
            key={`chatbot-${sessionId}-${isBotLoggedIn}`}
            settings={chatBotSettings}
            flow={flow}
            plugins={[HtmlRenderer()]}
          />
          {/* Live region for screen reader announcements */}
          <div 
            aria-live="polite" 
            aria-label="Bot response updates"
            className="sr-only"
            id="bot-live-region"
          />
        </main>
      </ChatBotProvider>
    </div>
  );
});

export default QABot;