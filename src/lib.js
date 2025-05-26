import React from 'react';
import ReactDOM from 'react-dom/client';
import QABot from './components/QABot';
import App from './App';
import './App.css';
import './index.css';
import { WebComponentQABot, webComponentAccessQABot } from './web-component';

// Export QABot component directly for users who want to use it as a React component
export { QABot };

// Re-export the web component functionality for those accessing via the main entry point
export { WebComponentQABot };

// Function-based API that prioritizes web component usage
// and then attempts a react render (since some people may use the function within a react context)
export function accessQABot({
  target,
  apiKey,
  defaultOpen,
  disabled,
  embedded,
  isLoggedIn,
  loginUrl,
  prompt,
  version,
  welcome
}) {
  if (!target || !(target instanceof HTMLElement)) {
    console.error('QA Bot: A valid target DOM element is required');
    return;
  }

  // If the web component is available, use it
  if (typeof window !== 'undefined' && typeof customElements !== 'undefined' &&
      customElements.get('access-qa-bot')) {
    return webComponentAccessQABot({
      target,
      apiKey,
      defaultOpen,
      disabled,
      embedded,
      isLoggedIn,
      loginUrl,
      prompt,
      welcome
    });
  } else {
    // Use direct react rendering
    const root = ReactDOM.createRoot(target);
    const qaRef = React.createRef();

    root.render(
      <React.StrictMode>
        <App
          ref={qaRef}
          apiKey={apiKey}
          defaultOpen={defaultOpen}
          disabled={disabled}
          embedded={embedded}
          isLoggedIn={isLoggedIn}
          loginUrl={loginUrl}
          prompt={prompt}
          welcome={welcome}
        />
      </React.StrictMode>
    );

    // Return a controller object with the addMessage method
    return {
      // Add a message to the chat
      addMessage: (message) => {
        if (qaRef.current) {
          qaRef.current.addMessage(message);
        }
      },
      // Set login status
      setBotIsLoggedIn: (status) => {
        if (qaRef.current) {
          qaRef.current.setBotIsLoggedIn(status);
        }
      },
      // Open the chat window (floating mode only)
      openChat: () => {
        if (qaRef.current) {
          qaRef.current.openChat();
        }
      },
      // Close the chat window (floating mode only)
      closeChat: () => {
        if (qaRef.current) {
          qaRef.current.closeChat();
        }
      },
      // Toggle the chat window (floating mode only)
      toggleChat: () => {
        if (qaRef.current) {
          qaRef.current.toggleChat();
        }
      },
      // Cleanup function (backward compatibility)
      destroy: () => {
        root.unmount();
      }
    };
  }
}

// Default export for simplicity
export default QABot;