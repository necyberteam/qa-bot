import React, { useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { useChatWindow } from "react-chatbotify";
import '../styles/embedded-container.css';
import '../styles/embedded-states.css';
import '../styles/responsive.css';

/**
 * Container component for embedded chat that handles open/close functionality
 */
const EmbeddedChatContainer = forwardRef(({ children, embeddedDefaultOpen = false }, ref) => {
  const { toggleChatWindow } = useChatWindow();
  const [embeddedIsOpen, setEmbeddedIsOpen] = useState(embeddedDefaultOpen);

  useEffect(() => {
    toggleChatWindow(embeddedDefaultOpen);
    setEmbeddedIsOpen(embeddedDefaultOpen);
  }, [embeddedDefaultOpen, toggleChatWindow]);

  useImperativeHandle(ref, () => ({
    toggle: () => {
      const newState = !embeddedIsOpen;
      setEmbeddedIsOpen(newState);
      toggleChatWindow(newState);
      return newState;
    },
    open: () => {
      setEmbeddedIsOpen(true);
      toggleChatWindow(true);
    },
    close: () => {
      setEmbeddedIsOpen(false);
      toggleChatWindow(false);
    },
    isOpen: () => embeddedIsOpen
  }));

  const handleToggle = () => {
    const newState = !embeddedIsOpen;
    setEmbeddedIsOpen(newState);
    toggleChatWindow(newState);
  };

  // Keyboard accessibility for bar
  const handleBarKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleToggle();
    }
  };

  return (
    <div className={`embedded-chat-container ${embeddedIsOpen ? 'open' : 'closed'}`}>
      {/* Chat content, visible when open */}
      <div className="embedded-chat-open" style={{ display: embeddedIsOpen ? 'block' : 'none' }}>
        <div
          className="embedded-chat-closed" // reuse bar style for open state header
          role="button"
          tabIndex={0}
          onClick={handleToggle}
          onKeyDown={handleBarKeyDown}
          style={{ display: 'flex', cursor: 'pointer' }}
        >
          <div className="title-with-icon">
            <div className="bot-icon"></div>
            <span>ACCESS Q&A Bot</span>
          </div>
          <span className="embedded-chat-chevron" aria-hidden="true" style={{ transform: 'rotate(180deg)' }}>▼</span>
        </div>
        <div className="embedded-chat-content">
          {children}
        </div>
      </div>

      {/* Closed header bar, visible when closed */}
      <div
        className="embedded-chat-closed"
        style={{ display: embeddedIsOpen ? 'none' : 'flex', cursor: 'pointer' }}
        role="button"
        tabIndex={0}
        onClick={handleToggle}
        onKeyDown={handleBarKeyDown}
      >
        <div className="title-with-icon">
          <div className="bot-icon"></div>
          <span>ACCESS Q&A Bot</span>
        </div>
        <span className="embedded-chat-chevron" aria-hidden="true">▼</span>
      </div>
    </div>
  );
});

export default EmbeddedChatContainer;