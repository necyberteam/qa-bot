import React, { useMemo } from 'react';
import { DEFAULT_CONFIG } from '../config/constants';
import UserIcon from '../components/UserIcon';
import { Button } from "react-chatbotify"

/**
 * Custom hook to generate ChatBot settings
 * @param {Object} params - Parameters for generating settings
 * @param {Object} params.themeColors - Theme colors from useThemeColors
 * @param {boolean} params.embedded - Whether the bot is embedded
 * @param {boolean} params.defaultOpen - Default open state (floating mode only)
 * @param {boolean} params.isLoggedIn - Whether user is logged in (passed to UserIcon)
 * @returns {Object} ChatBot settings object
 */
const useChatBotSettings = ({
  themeColors,
  embedded,
  defaultOpen,
  isLoggedIn
}) => {
  const settings = useMemo(() => {
    return {
      general: {
        ...themeColors,
        embedded: embedded
      },
      header: {
        title: DEFAULT_CONFIG.CHATBOT.TITLE,
        avatar: DEFAULT_CONFIG.CHATBOT.AVATAR_URL,
        buttons: [
          <UserIcon key="user-icon" />,
          Button.CLOSE_CHAT_BUTTON
        ]
      },
      chatWindow: {
        defaultOpen: embedded ? true : defaultOpen,
      },
      chatInput: {
        enabledPlaceholderText: DEFAULT_CONFIG.PROMPT_TEXT,
        disabledPlaceholderText: 'Please log in to ask questions.',
        disabled: false
      },
      chatHistory: {
        disabled: false
      },
      botBubble: {
        simulateStream: true,
        dangerouslySetInnerHtml: true
      },
      chatButton: {
        icon: DEFAULT_CONFIG.CHATBOT.AVATAR_URL,
      },
      tooltip: {
        text: DEFAULT_CONFIG.CHATBOT.TOOLTIP_TEXT,
        mode: 'START'
      },
      audio: {
        disabled: true,
      },
      emoji: {
        disabled: true,
      },
      fileAttachment: {
        disabled: true,
      },
      notification: {
        disabled: true,
      },
      footer: {
        text: (<div>Find out more <a href="https://support.access-ci.org/tools/access-qa-tool">about this tool</a> or <a href="https://docs.google.com/forms/d/e/1FAIpQLSeWnE1r738GU1u_ri3TRpw9dItn6JNPi7-FH7QFB9bAHSVN0w/viewform">give us feedback</a>.</div>),
      },
      event: {
        rcbToggleChatWindow: true, // Enable chat window toggle event
      },
    };
  }, [themeColors, embedded, defaultOpen]);

  return settings;
};

export default useChatBotSettings;