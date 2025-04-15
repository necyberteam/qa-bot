import React, { useEffect, useRef } from 'react';
import ChatBot from "react-chatbotify";
import '../App.css';

const QABot = (props) => {
  const welcome = props.welcome || 'Hello! What can I help you with?';
  const prompt = props.prompt || 'Questions should stand alone and not refer to previous ones.';
  const embedded = props.embedded || false;

  // Ref for the container element
  const containerRef = useRef(null);

  const isLoggedIn = props.isLoggedIn !== undefined ? props.isLoggedIn : false;
  // Derive disabled state, respecting explicit disabled prop if provided
  const disabled = props.disabled !== undefined ? props.disabled : !isLoggedIn;

  // Use isOpen prop with default to false if not provided
  const isOpen = props.isOpen !== undefined ? props.isOpen : false;
  const onClose = props.onClose;

  const apiKey = props.apiKey || process.env.REACT_APP_API_KEY;
  const queryEndpoint = 'https://access-ai.ccs.uky.edu/api/query';
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

  // Get theme colors, with fallbacks and CSS variable support
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
      fontFamily: getCSSVariable('--font-family', 'Arial, sans-serif'),
      embedded: embedded
    };
  };

  return (
    <div className="access-qa-bot" ref={containerRef}>
      <ChatBot
        options={{
          theme: getThemeColors(),
          header: {
            title: 'ACCESS Q&A Bot',
            avatar: 'https://support.access-ci.org/themes/contrib/asp-theme/images/icons/ACCESS-arrrow.svg',
          },
          chatInput: {
            enabledPlaceholderText: prompt,
            disabledPlaceholderText: 'Please log in to ask questions.',
            disabled: disabled
          },
          chatHistory: { disabled: true },
          botBubble: {
            simStream: true,
            dangerouslySetInnerHtml: true
          },
          isOpen: isOpen,
          onClose: onClose,
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
        flow={flow}
      />
    </div>
  );
}

export default QABot;