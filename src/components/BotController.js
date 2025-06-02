import React, { useImperativeHandle, useEffect, useRef } from 'react';
import { useFlow, useMessages, useChatWindow } from "react-chatbotify";
import useLoginStateTransition from '../hooks/useLoginStateTransition';

/**
 * BotController Component
 *
 * Handles the integration between react-chatbotify hooks and the imperative API.
 * This component must be rendered inside ChatBotProvider to access the hooks.
 *
 * @param {Object} props - Component props
 * @param {boolean} props.embedded - Whether the bot is embedded (affects chat window controls)
 * @param {Function} props.setIsBotLoggedIn - Function to update login state
 * @param {boolean} props.isBotLoggedIn - Current login state
 * @param {Function} props.onOpenChange - Callback for open state changes
 * @param {boolean} props.currentOpen - Current open state
 * @param {React.Ref} ref - The forwarded ref for the imperative API
 */
const BotController = React.forwardRef(({
  embedded,
  setIsBotLoggedIn,
  isBotLoggedIn,
  onOpenChange,
  currentOpen
}, ref) => {
  // Get the chatbot hooks (must be inside ChatBotProvider)
  const messages = useMessages();
  const flow = useFlow();
  const chatWindow = useChatWindow();

  // Track the last known state to avoid infinite loops
  const lastOpenRef = useRef(currentOpen);

  // Handle login state transitions with automatic message injection
  useLoginStateTransition(isBotLoggedIn);

  // Sync open state with chat window when it changes
  useEffect(() => {
    if (!embedded && chatWindow && chatWindow.toggleChatWindow) {
      // Only sync if the state actually changed
      if (lastOpenRef.current !== currentOpen) {
        console.log('| BotController | Syncing chat window state to:', currentOpen);
        chatWindow.toggleChatWindow(currentOpen);
        lastOpenRef.current = currentOpen;
      }
    }
  }, [currentOpen, embedded, chatWindow]);

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
        lastOpenRef.current = true;
        // Notify parent of state change
        if (onOpenChange) {
          onOpenChange(true);
        }
      }
    },
    // Close the chat window (floating mode only)
    closeChat: () => {
      if (!embedded && chatWindow && chatWindow.toggleChatWindow) {
        chatWindow.toggleChatWindow(false);
        lastOpenRef.current = false;
        // Notify parent of state change
        if (onOpenChange) {
          onOpenChange(false);
        }
      }
    },
    // Toggle the chat window (floating mode only)
    toggleChat: () => {
      if (!embedded && chatWindow && chatWindow.toggleChatWindow) {
        const newState = !lastOpenRef.current;
        chatWindow.toggleChatWindow();
        lastOpenRef.current = newState;
        // Notify parent of state change
        if (onOpenChange) {
          onOpenChange(newState);
        }
      }
    }
  }), [messages, chatWindow, embedded, setIsBotLoggedIn, onOpenChange]);

  // This component doesn't render anything
  return null;
});

export default BotController;