import React, { useRef, useState, useEffect, useMemo } from 'react';
import ChatBot, { ChatBotProvider } from "react-chatbotify";
import BotController from './BotController';
import useThemeColors from '../hooks/useThemeColors';
import useChatBotSettings from '../hooks/useChatBotSettings';
import useHandleAIQuery from '../hooks/useHandleAIQuery';
import { createBotFlow } from '../utils/create-bot-flow';
import useUpdateHeader from '../hooks/useUpdateHeader';
import useRingEffect from '../hooks/useRingEffect';
import { constants, getApiKey } from '../utils/strings';
import '../styles/rcb-base.css';

const QABot = React.forwardRef((props, ref) => {
  const {
    apiKey,
    defaultOpen,
    embedded = false,
    isLoggedIn,
    loginUrl = constants.LOGIN_URL,
    ringEffect = true,
    welcome
  } = props;

  const [isBotLoggedIn, setIsBotLoggedIn] = useState(isLoggedIn !== undefined ? isLoggedIn : false);
  const [hasQueryError, setHasQueryError] = useState(false);
  const [ticketForm, setTicketForm] = useState({});
  const [feedbackForm, setFeedbackForm] = useState({});
  const containerRef = useRef(null);
  const finalApiKey = getApiKey(apiKey);
  const handleQuery = useHandleAIQuery(finalApiKey, setHasQueryError);
  const themeColors = useThemeColors(containerRef);

  const flowConfig = {
    welcomeMessage: welcome,
    isBotLoggedIn,
    loginUrl,
    handleQuery,
    hasQueryError,
    ticketForm,
    setTicketForm,
    feedbackForm,
    setFeedbackForm
  };

  const flow = useMemo(() => {
    return createBotFlow(flowConfig);
  }, [
    welcome,
    isBotLoggedIn,
    loginUrl,
    handleQuery,
    hasQueryError,
    ticketForm,
    setTicketForm,
    feedbackForm,
    setFeedbackForm
  ]);

  const settings = useChatBotSettings({
    themeColors,
    embedded,
    defaultOpen
  });

  useEffect(() => {
    if (isLoggedIn !== undefined) setIsBotLoggedIn(isLoggedIn);
  }, [isLoggedIn]);

  useUpdateHeader(isBotLoggedIn, containerRef);
  useRingEffect(ringEffect, containerRef);

  return (
    <div className={`qa-bot ${embedded ? "embedded-qa-bot" : ""}`} ref={containerRef}>
      <ChatBotProvider>
        <BotController
          ref={ref}
          embedded={embedded}
          setIsBotLoggedIn={setIsBotLoggedIn}
          isBotLoggedIn={isBotLoggedIn}
        />
        <ChatBot
          settings={settings}
          flow={flow}
        />
      </ChatBotProvider>
    </div>
  );
});

export default QABot;