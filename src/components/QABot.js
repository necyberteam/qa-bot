import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import ChatBot, { ChatBotProvider } from "react-chatbotify";
import EmbeddedChatContainer from './EmbeddedChatContainer';
import { getThemeColors } from '../utils/ThemeUtils';
import '../styles/rcb-base.css';

/**
 * ACCESS Q&A Bot Component
 *
 * @param {Object} props
 * @param {string} [props.apiKey] - API key for the Q&A endpoint
 * @param {string} [props.welcome='Hello! What can I help you with?'] - Welcome message
 * @param {string} [props.prompt='Questions should stand alone and not refer to previous ones.'] - Input prompt text
 * @param {boolean} [props.embedded=false] - Whether the bot is embedded in the page
 * @param {boolean} [props.isLoggedIn=false] - Whether the user is logged in
 * @param {boolean} [props.isAnonymous] - Whether the user is anonymous (defaults to !isLoggedIn)
 * @param {boolean} [props.disabled] - Whether the chat input is disabled (defaults to isAnonymous)
 * @param {boolean} [props.defaultOpen=false] - Whether the chat window is open by default
 * @param {boolean} [props.visible=true] - Whether the bot is visible
 * @param {Function} [props.onClose] - Callback when the chat window is closed
 * @returns {JSX.Element}
 */
const QABot = forwardRef((props, ref) => {
  const containerRef = useRef(null);
  const embeddedContainerRef = useRef(null);
  const apiKey = props.apiKey || process.env.REACT_APP_API_KEY;
  const queryEndpoint = 'https://access-ai.ccs.uky.edu/api/query';

  const welcome = props.welcome || 'Hello! What can I help you with?';
  const prompt = props.prompt || 'Questions should stand alone and not refer to previous ones.';
  const embedded = props.embedded || false;
  const isLoggedIn = props.isLoggedIn !== undefined ? props.isLoggedIn : false;
  const isAnonymous = props.isAnonymous !== undefined ? props.isAnonymous : !isLoggedIn;
  const disabled = props.disabled !== undefined ? props.disabled : isAnonymous;
  const defaultOpen = props.defaultOpen !== undefined ? props.defaultOpen : false;
  const visible = props.visible !== undefined ? props.visible : true;
  const onClose = props.onClose;

  console.log("| QABot instantiated with props:", { ...props, defaultOpen });

  // Expose methods for controlling the bot
  useImperativeHandle(ref, () => ({
    toggle: () => {
      if (embedded && embeddedContainerRef.current) {
        return embeddedContainerRef.current.toggle();
      }
      return false;
    },
    open: () => {
      if (embedded && embeddedContainerRef.current) {
        embeddedContainerRef.current.open();
      }
    },
    close: () => {
      if (embedded && embeddedContainerRef.current) {
        embeddedContainerRef.current.close();
      }
    },
    isOpen: () => {
      if (embedded && embeddedContainerRef.current) {
        return embeddedContainerRef.current.isOpen();
      }
      return false;
    }
  }));

  let hasError = false;

  // Get theme colors from CSS variables if available
  useEffect(() => {
    if (containerRef.current && containerRef.current.parentElement) {
      // If container's parent has CSS variables, they'll be picked up in getThemeColors
    }
  }, []);

  const handleQuery = async (params) => {
    // POST question to the QA API
    try {
      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': apiKey
        },
        body: JSON.stringify({ query: params.userInput })
      };

      const response = await fetch(queryEndpoint, requestOptions);
      const body = await response.json();
      const text = body.response;

      for (let i = 0; i < text.length; i++) {
        await params.streamMessage(text.slice(0, i + 1));
        await new Promise(resolve => setTimeout(resolve, 2));
      }
    } catch (error) {
      await params.injectMessage("Unable to contact the Q&A Bot. Please try again later.");
      hasError = true;
    }
  }

  const flow = {
    start: {
      message: welcome,
      path: 'loop'
    },
    loop: {
      message: async (params) => {
        await handleQuery(params);
      },
      path: () => {
        if (hasError) {
          return 'start'
        }
        return 'loop'
      }
    }
  }

  const containerClassName = `access-qa-bot ${embedded ? "embedded-qa-bot" : ""} ${visible ? "" : "hidden"}`;

  // Create a close button for embedded mode
  const createCloseButton = (embeddedRef) => {
    return (
      <button
        className="embedded-close-button"
        onClick={() => embeddedRef.current && embeddedRef.current.close()}
      >
        ×
      </button>
    );
  };

  const chatBot = (
    <ChatBot
      settings={{
        general: {
          ...getThemeColors(containerRef),
          embedded: embedded
        },
        header: {
          title: 'ACCESS Q&A Bot',
          avatar: 'https://support.access-ci.org/themes/contrib/asp-theme/images/icons/ACCESS-arrrow.svg',
          // Only override buttons in embedded mode, otherwise keep default
          ...(embedded ? { buttons: [createCloseButton(embeddedContainerRef)] } : {})
        },
        chatWindow: {
          defaultOpen: defaultOpen, // Will be ignored if embedded=true
        },
        chatInput: {
          enabledPlaceholderText: prompt,
          disabledPlaceholderText: 'Please log in to ask questions.',
          disabled: disabled
        },
        chatHistory: { disabled: true },
        botBubble: {
          simulateStream: true,
          dangerouslySetInnerHtml: true
        },
        chatButton: {
          icon: 'https://support.access-ci.org/themes/contrib/asp-theme/images/icons/ACCESS-arrrow.svg',
        },
        tooltip: {
          text: 'Ask me about ACCESS! 😊',
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
      }}
      onClose={onClose}
      flow={flow}
    />
  );

  if (!visible) {
    return null;
  }

  return (
    <div className={containerClassName} ref={containerRef}>
      <ChatBotProvider>
        {embedded ? (
          <EmbeddedChatContainer
            ref={embeddedContainerRef}
            embeddedDefaultOpen={defaultOpen}
          >
            {chatBot}
          </EmbeddedChatContainer>
        ) : (
          chatBot
        )}
      </ChatBotProvider>
    </div>
  );
});

export default QABot;