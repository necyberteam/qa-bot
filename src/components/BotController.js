import React, { useImperativeHandle } from 'react';
import { useFlow, useMessages, useChatWindow } from "react-chatbotify";

/**
 * BotController Component
 *
 * Handles the integration between react-chatbotify hooks and the imperative API.
 * This component must be rendered inside ChatBotProvider to access the hooks.
 *
 * @param {Object} props - Component props
 * @param {boolean} props.embedded - Whether the bot is embedded (affects chat window controls)
 * @param {Function} props.setIsBotLoggedIn - Function to update login state
 * @param {React.Ref} ref - The forwarded ref for the imperative API
 */
const BotController = React.forwardRef(({ embedded, setIsBotLoggedIn }, ref) => {
  // Get the chatbot hooks (must be inside ChatBotProvider)
  const messages = useMessages();
  const flow = useFlow();
  const chatWindow = useChatWindow();

  // Set up the imperative API methods
  useImperativeHandle(ref, () => ({
    // Add a message to the chat
    addMessage: (message) => {
      if (messages && messages.injectMessage) {
        messages.injectMessage(message);
      }
    },
    // Set login status
    setBotIsLoggedIn: (status) => {
      setIsBotLoggedIn(status);
      // Don't restart flow - let the flow's path functions handle the login state change
    },
    // Open the chat window (floating mode only)
    openChat: () => {
      if (!embedded && chatWindow && chatWindow.toggleChatWindow) {
        chatWindow.toggleChatWindow(true);
      }
    },
    // Close the chat window (floating mode only)
    closeChat: () => {
      if (!embedded && chatWindow && chatWindow.toggleChatWindow) {
        chatWindow.toggleChatWindow(false);
      }
    },
    // Toggle the chat window (floating mode only)
    toggleChat: () => {
      if (!embedded && chatWindow && chatWindow.toggleChatWindow) {
        chatWindow.toggleChatWindow();
      }
    }
  }), [messages, flow, chatWindow, embedded, setIsBotLoggedIn]);

  // This component doesn't render anything
  return null;
});

export default BotController;