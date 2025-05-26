import React, { useRef, useState, useEffect } from 'react';
import ChatBot, { ChatBotProvider } from "react-chatbotify";
import BotController from './BotController';
import useThemeColors from '../hooks/useThemeColors';
import useChatBotSettings from '../hooks/useChatBotSettings';
import useHandleAIQuery from '../hooks/useHandleAIQuery';
import useChatFlow from '../hooks/useChatFlow';
import useUpdateHeader from '../hooks/useUpdateHeader';
import { DEFAULT_CONFIG } from '../config/constants';
import '../styles/rcb-base.css';

/**
 * ACCESS Q&A Bot Component
 *
 * @param {Object}    [props]
 * @param {string}    [props.apiKey] - API key for the Q&A endpoint
 * @param {boolean}   [props.defaultOpen=false] - Whether the chat window is open by default (floating mode only, ignored for embedded)
 * @param {boolean}   [props.disabled=false] - Whether the chat input is disabled
 * @param {boolean}   [props.embedded=false] - Whether the bot is embedded in the page (always open when embedded)
 * @param {boolean}   [props.isLoggedIn=false] - Whether the user is logged in
 * @param {string}    [props.loginUrl='/login'] - URL to redirect for login
 * @param {string}    [props.prompt='Questions should stand alone and not refer to previous ones.'] - Input prompt text
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
  // Destructure props
  const {
    apiKey,
    defaultOpen,
    disabled,
    embedded = false,
    isLoggedIn,
    loginUrl = DEFAULT_CONFIG.LOGIN_URL,
    prompt = DEFAULT_CONFIG.PROMPT_TEXT,
    welcome
  } = props;

  // API configuration
  const finalApiKey = apiKey || process.env.REACT_APP_API_KEY;

  // State management
  const [isBotLoggedIn, setIsBotLoggedIn] = useState(isLoggedIn !== undefined ? isLoggedIn : false);
  const [hasQueryError, setHasQueryError] = useState(false);

  // Update internal state when isLoggedIn prop changes
  useEffect(() => {
    if (isLoggedIn !== undefined) {
      setIsBotLoggedIn(isLoggedIn);
    }
  }, [isLoggedIn]);

  // Derived values
  const welcomeMessage = buildWelcomeMessage(isBotLoggedIn, welcome);

  // Refs
  const containerRef = useRef(null);

  const themeColors = useThemeColors(containerRef);
  const chatBotSettings = useChatBotSettings({
    themeColors,
    embedded,
    defaultOpen: defaultOpen,
    prompt,
    disabled: disabled,
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

  // Use custom hook to update header title dynamically
  useUpdateHeader(isBotLoggedIn, containerRef);

  return (
    <div className={`access-qa-bot ${embedded ? "embedded-qa-bot" : ""}`} ref={containerRef}>
      <ChatBotProvider>
        <BotController
          ref={ref}
          embedded={embedded}
          setIsBotLoggedIn={setIsBotLoggedIn}
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