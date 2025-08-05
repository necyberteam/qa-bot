import React, { useMemo } from 'react';
import { DEFAULT_CONFIG } from '../config/constants';
import NewChatButton from '../components/NewChatButton';
import { Button } from "react-chatbotify"

/**
 * Custom hook to generate ChatBot settings
 * @param {Object} params - Parameters for generating settings
 * @param {Object} params.themeColors - Theme colors from useThemeColors
 * @param {boolean} params.embedded - Whether the bot is embedded
 * @param {boolean} params.defaultOpen - Default open state (floating mode only)
 * @param {boolean} params.isLoggedIn - Whether user is logged in (passed to UserIcon)
 * @param {string} params.loginUrl - URL to navigate to for login
 * @returns {Object} ChatBot settings object
 */
const useChatBotSettings = ({
  themeColors,
  embedded,
  defaultOpen,
  isLoggedIn,
  loginUrl
}) => {
  const isBotLoggedIn = isLoggedIn;

  // Check if tooltip has been shown in this session
  const hasShownTooltip = sessionStorage.getItem('qa_bot_tooltip_shown');
  const tooltipMode = hasShownTooltip ? 'NEVER' : 'START';

  const settings = useMemo(() => {
    return {
      general: {
        ...themeColors,
        embedded: embedded,
        // Enhanced accessibility
        primaryColor: themeColors.primaryColor,
        fontFamily: 'Arial, sans-serif',
        // Ensure good contrast ratios
        secondaryColor: themeColors.secondaryColor
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
          () => isBotLoggedIn ? "✓ Logged In" : null,
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
        showCharacterCount: false,
        // Enhanced accessibility
        ariaLabel: 'Chat input area',
        ariaDescribedBy: 'chat-input-help'
      },
      chatHistory: {
        disabled: false
      },
      botBubble: {
        simulateStream: true,
        streamSpeed: 10,
        allowNewline: true,
        dangerouslySetInnerHTML: true,
        renderHtml: true,
        // Enhanced accessibility
        ariaLabel: 'Bot response',
        role: 'log'
      },
      chatButton: {
        icon: DEFAULT_CONFIG.CHATBOT.AVATAR_URL,
      },
      tooltip: {
        text: DEFAULT_CONFIG.CHATBOT.TOOLTIP_TEXT,
        mode: tooltipMode
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
          Button.FILE_ATTACHMENT_BUTTON,
          Button.EMOJI_PICKER_BUTTON,
          <NewChatButton key="new-chat-button" />
        ]
      },
      fileAttachment: {
        disabled: false,
        multiple: true,
        accept: ".pdf,.png,.jpg,.jpeg,.gif,.doc,.docx,.txt,.csv,.zip",
        sendFileName: true,
        showMediaDisplay: false
      },
      event: {
        rcbToggleChatWindow: true // Enable chat window toggle event
      }
    };
  }, [themeColors, embedded, defaultOpen, isBotLoggedIn, tooltipMode, loginUrl]);

  return settings;
};

export default useChatBotSettings;