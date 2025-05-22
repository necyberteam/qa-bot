import React, { useEffect, useRef, useImperativeHandle, useState } from 'react';
import ChatBot, { ChatBotProvider, useFlow } from "react-chatbotify";
import LoginButton from './LoginButton';
import '../styles/rcb-base.css';

/**
 * ACCESS Q&A Bot Component
 *
 * @param {Object}    [props]
 * @param {string}    [props.apiKey] - API key for the Q&A endpoint
 * @param {boolean}   [props.defaultOpen=false] - Whether the chat window is open by default (floating mode only)
 * @param {boolean}   [props.disabled=false] - Whether the chat input is disabled
 * @param {boolean}   [props.embedded=false] - Whether the bot is embedded in the page
 * @param {boolean}   [props.isLoggedIn=false] - Whether the user is logged in
 * @param {string}    [props.loginUrl='/login'] - URL to redirect for login
 * @param {Function}  [props.onClose] - Callback when the chat window is closed
 * @param {string}    [props.prompt='Questions should stand alone and not refer to previous ones.'] - Input prompt text
 * @param {boolean}   [props.visible=true] - Whether the bot is visible
 * @param {string}    [props.welcome='Hello! What can I help you with?'] - Welcome message
 * @returns {JSX.Element}
 */

const buildWelcomeMessage = (isLoggedIn, welcomeMessage) => {
  if (isLoggedIn) {
    return welcomeMessage || 'Hello! What can I help you with?';
  } else {
    return `Hello! To ask questions, please log in.`;
  }
}

const QABot = React.forwardRef((props, ref) => {
  const containerRef = useRef(null);
  const apiKey = props.apiKey || process.env.REACT_APP_API_KEY;
  const queryEndpoint = 'https://access-ai.ccs.uky.edu/api/query';

  // Add state for controlling props that need to be updated after initialization
  const [isLoggedIn, setIsLoggedIn] = useState(props.isLoggedIn !== undefined ? props.isLoggedIn : false);
  const [disabled, setDisabled] = useState(props.disabled !== undefined ? props.disabled : false);
  const [visible, setVisible] = useState(props.visible !== undefined ? props.visible : true);
  const [isOpen, setIsOpen] = useState(props.defaultOpen !== undefined ? props.defaultOpen : false);

  const defaultOpen = isOpen;
  const embedded = props.embedded || false;
  const loginUrl = props.loginUrl || '/login';
  const onClose = () => {
    setIsOpen(false);
    if (props.onClose) props.onClose();
  };
  const prompt = props.prompt || 'Questions should stand alone and not refer to previous ones.';
  const welcome = buildWelcomeMessage(isLoggedIn, props.welcome);

  // Create a ref to store the ChatBot component instance
  const chatBotRef = useRef(null);
  // Create a ref to store restartFlow function
  const flowRef = useRef(null);

  // Expose methods to parent components via the forwarded ref
  useImperativeHandle(ref, () => ({
    // Set login status
    setLoggedIn: (status) => {
      setIsLoggedIn(status);
      if (flowRef.current) {
        flowRef.current.restartFlow();
      }
    },
    // Open chat window
    open: () => {
      if (!embedded) {
        setIsOpen(true);
      }
    },
    // Close chat window
    close: () => {
      if (!embedded) {
        setIsOpen(false);
      }
    },
    // Toggle chat window
    toggle: () => {
      if (!embedded) {
        setIsOpen(prev => !prev);
      }
    },
    // Enable/disable input
    setDisabled: (status) => {
      setDisabled(status);
    },
    // Show/hide bot
    setVisible: (status) => {
      setVisible(status);
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

      await params.streamMessage(text);
    } catch (error) {
      await params.injectMessage("Unable to contact the Q&A Bot. Please try again later.");
      hasError = true;
    }
  }

  const flow = {
    start: {
      message: welcome,
      component: (
        <LoginButton loginUrl={loginUrl} />
      ),
      path: isLoggedIn ? 'loop' : 'start'
    },
    loop: {
      message: async (params) => {
        await handleQuery(params);
      },
      path: () => hasError ? 'start' : 'loop'
    }
  }

  // Get theme colors to pass to ChatBot
  const getThemeColors = () => {
    // Get colors from CSS variables if available, fall back to defaults
    const getCSSVariable = (name, fallback) => {
      if (containerRef.current) {
        // First check the container itself
        const containerStyle = getComputedStyle(containerRef.current);
        const containerValue = containerStyle.getPropertyValue(name);
        if (containerValue && containerValue.trim() !== '') {
          return containerValue.trim();
        }

        // Then check parent (useful for web component shadow DOM)
        if (containerRef.current.parentElement) {
          const parentStyle = getComputedStyle(containerRef.current.parentElement);
          const parentValue = parentStyle.getPropertyValue(name);
          if (parentValue && parentValue.trim() !== '') {
            return parentValue.trim();
          }
        }
      }
      return fallback;
    };

    return {
      primaryColor: getCSSVariable('--primary-color', '#1a5b6e'),
      secondaryColor: getCSSVariable('--secondary-color', '#107180'),
      fontFamily: getCSSVariable('--font-family', 'Arial, sans-serif')
    };
  };

  // FlowController component to capture the flow functions
  const FlowController = () => {
    const flow = useFlow();

    // Store the flow functions in the ref
    flowRef.current = flow;

    return null;
  };

  const chatBot = (
    <ChatBot
      ref={chatBotRef}
      settings={{
        general: {
          ...getThemeColors(),
          embedded: embedded
        },
        header: {
          title: 'ACCESS Q&A Bot',
          avatar: 'https://support.access-ci.org/themes/contrib/asp-theme/images/icons/ACCESS-arrrow.svg',
        },
        chatWindow: {
          defaultOpen: embedded ? true : defaultOpen, // Always open if embedded
        },
        chatInput: {
          enabledPlaceholderText: prompt,
          disabledPlaceholderText: 'Please log in to ask questions.',
          disabled: disabled || !isLoggedIn
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
    <div className={`access-qa-bot ${embedded ? "embedded-qa-bot" : ""} ${visible ? "" : "hidden"}`} ref={containerRef}>
      <ChatBotProvider>
        <FlowController />
        {chatBot}
      </ChatBotProvider>
    </div>
  );
});

export default QABot;