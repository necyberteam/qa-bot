import React, { useMemo } from 'react';
import { DEFAULT_CONFIG } from '../config/constants';
import NewChatButton from '../components/NewChatButton';
import UserIcon from '../components/UserIcon';
import LoginButton from '../components/LoginButton';
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
  const isBotLoggedIn = isLoggedIn;
  const settings = useMemo(() => {
    return {
      general: {
        ...themeColors,
        embedded: embedded
      },
      header: {
        title: (
          <div key="header-title">
            <h1 className="sr-only">{DEFAULT_CONFIG.CHATBOT.TITLE}</h1>
            <span aria-hidden="true">{DEFAULT_CONFIG.CHATBOT.TITLE}</span>
          </div>
        ),
        avatar: DEFAULT_CONFIG.CHATBOT.AVATAR_URL,
        buttons: [
          isBotLoggedIn ? <UserIcon key="user-icon" /> : <LoginButton key="login-button" loginUrl="/login" isHeaderButton={true} />,
          Button.CLOSE_CHAT_BUTTON
        ]
      },
      chatWindow: {
        defaultOpen: embedded ? true : defaultOpen,
      },
      chatInput: {
        enabledPlaceholderText: 'Type your question here...',
        disabledPlaceholderText: '',
        disabled: false,
        allowNewline: true,
        sendButtonStyle: { display: 'flex' },
        characterLimit: 1000,
        sendButtonAriaLabel: 'Send message',
        showCharacterCount: false
      },
      chatHistory: {
        disabled: false
      },
      botBubble: {
        simulateStream: true,
        streamSpeed: 10,
        allowNewline: true,
        dangerouslySetInnerHTML: true,
        renderHtml: true
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
        text: (<div key="footer-text"><a href="https://support.access-ci.org/tools/access-qa-tool">About this tool</a>.</div>),
        buttons: [
          <NewChatButton key="new-chat-button" />
        ]
      },
      event: {
        rcbToggleChatWindow: true, // Enable chat window toggle event
      }
    };
  }, [themeColors, embedded, defaultOpen, isBotLoggedIn]);

  return settings;
};

export default useChatBotSettings;