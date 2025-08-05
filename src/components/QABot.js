import React, { useRef, useState, useEffect, useMemo } from 'react';
import ChatBot, { ChatBotProvider } from "react-chatbotify";
import HtmlRenderer from "@rcb-plugins/html-renderer";
import MarkdownRenderer from "@rcb-plugins/markdown-renderer";
import InputValidator from "@rcb-plugins/input-validator";
import { v4 as uuidv4 } from 'uuid';
import BotController from './BotController';
import useThemeColors from '../hooks/useThemeColors';
import useChatBotSettings from '../hooks/useChatBotSettings';
import useHandleAIQuery from '../hooks/useHandleAIQuery';
import useUpdateHeader from '../hooks/useUpdateHeader';
import useRingEffect from '../hooks/useRingEffect';
import useFocusableSendButton from '../hooks/useFocusableSendButton';
import useKeyboardNavigation from '../hooks/useKeyboardNavigation';
import { DEFAULT_CONFIG, buildWelcomeMessage } from '../config/constants';
import { createBotFlow } from '../utils/create-bot-flow';
import { FormProvider, useFormContext } from '../contexts/FormContext';

// Build signature for deployment verification
console.info(
  `%c🤖 ACCESS QA Bot - Function Components Fix Applied [${new Date().toISOString().slice(0,10)}]`,
  'background: #107180; color: white; padding: 2px 8px; border-radius: 3px; font-weight: bold;'
);

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
 * Internal QABot component that uses Form Context
 */
const QABotInternal = React.forwardRef((props, botRef) => {
  const {
    apiKey,
    open = false,
    onOpenChange,
    embedded = false,
    isLoggedIn,
    loginUrl = DEFAULT_CONFIG.LOGIN_URL,
    ringEffect = false,
    welcome,
    userEmail,
    userName,
    accessId
  } = props;

  const finalApiKey = apiKey || ((typeof process !== 'undefined' && process.env) ? process.env.REACT_APP_API_KEY : null);

  const [isBotLoggedIn, setIsBotLoggedIn] = useState(isLoggedIn !== undefined ? isLoggedIn : false);
  const sessionIdRef = useRef(getOrCreateSessionId());
  const sessionId = sessionIdRef.current;
  const [currentQueryId, setCurrentQueryId] = useState(null);

  // Use Form Context instead of local state
  const { ticketForm, feedbackForm, updateTicketForm, updateFeedbackForm, resetTicketForm, resetFeedbackForm } = useFormContext();

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
    isLoggedIn: isBotLoggedIn,
    loginUrl
  });

  const handleQuery = useHandleAIQuery(finalApiKey, sessionId, setCurrentQueryId);

  const formContext = useMemo(() => ({
    ticketForm: ticketForm || {},
    feedbackForm: feedbackForm || {},
    updateTicketForm,
    updateFeedbackForm,
    resetTicketForm,
    resetFeedbackForm
  }), [ticketForm, feedbackForm, updateTicketForm, updateFeedbackForm, resetTicketForm, resetFeedbackForm]);

  const flow = useMemo(() => createBotFlow({
    welcomeMessage,
    isBotLoggedIn,
    loginUrl,
    handleQuery,
    sessionId,
    currentQueryId,
    ticketForm,
    setTicketForm: updateTicketForm,
    feedbackForm,
    setFeedbackForm: updateFeedbackForm,
    formContext,
    apiKey: finalApiKey,
    userInfo: {
      email: userEmail || null,
      name: userName || null,
      accessId: accessId || null
    }
  }), [welcomeMessage, isBotLoggedIn, loginUrl, handleQuery, sessionId, currentQueryId, ticketForm, feedbackForm, updateTicketForm, updateFeedbackForm, formContext, finalApiKey, userEmail, userName, accessId]);

  useUpdateHeader(isBotLoggedIn, containerRef);
  useRingEffect(ringEffect, containerRef);
  useFocusableSendButton();
  useKeyboardNavigation();

  // Handle tooltip session tracking
  useEffect(() => {
    // Listen for chat window toggle (opening chat)
    const handleToggle = () => {
      // Mark tooltip as shown when user opens chat
      sessionStorage.setItem('qa_bot_tooltip_shown', 'true');
    };

    // Add event listener
    window.addEventListener('rcb-toggle-chat-window', handleToggle);

    // Cleanup
    return () => {
      window.removeEventListener('rcb-toggle-chat-window', handleToggle);
    };
  }, []);

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
            plugins={[HtmlRenderer(), MarkdownRenderer(), InputValidator()]}
          />
          {/* Live region for screen reader announcements */}
          <div
            aria-live="polite"
            aria-label="Bot response updates"
            className="sr-only"
            id="bot-live-region"
          />

          {/* Accessibility help text */}
          <div id="chat-input-help" className="sr-only">
            Type your message and press Enter to send. Use arrow keys to navigate through response options. Press Enter or Space to select an option.
          </div>

          {/* Keyboard navigation instructions */}
          <div id="keyboard-help" className="sr-only">
            Available keyboard shortcuts: Arrow keys to navigate options, Enter or Space to select, Tab to move between interactive elements, Escape to close dialogs.
          </div>
        </main>
      </ChatBotProvider>
    </div>
  );
});

QABotInternal.displayName = 'QABotInternal';

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
 * @param {string}    [props.userEmail] - User's email address (when logged in)
 * @param {string}    [props.userName] - User's display name (when logged in)
 * @param {string}    [props.accessId] - User's ACCESS ID (when logged in)
 * @returns {JSX.Element}
 */
const QABot = React.forwardRef((props, ref) => {
  return (
    <FormProvider>
      <QABotInternal {...props} ref={ref} />
    </FormProvider>
  );
});

QABot.displayName = 'QABot';

export default QABot;