import React from 'react';
import ReactDOM from 'react-dom/client';
import QABot from './components/QABot';
import App from './App';
import './App.css';
import './index.css';
import { WebComponentQABot, webComponentQAndATool } from './web-component';

// Export QABot component directly for users who want to use it as a React component
export { QABot };

// Re-export the web component functionality for those accessing via the main entry point
export { WebComponentQABot };

// Function-based API that prioritizes web component usage
// and then attempts a react render (since some people may use the function within a react context)
export function qAndATool({
  target,
  apiKey,
  defaultOpen,
  disabled,
  embedded,
  isLoggedIn,
  loginUrl,
  onClose,
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
    return webComponentQAndATool({
      target,
      apiKey,
      defaultOpen,
      disabled,
      embedded,
      isLoggedIn,
      loginUrl,
      onClose,
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
          onClose={onClose}
          prompt={prompt}
          welcome={welcome}
        />
      </React.StrictMode>
    );

    // Return a controller object with methods to manipulate the bot
    return {
      // Control methods that delegate to the QABot component via ref
      setLoggedIn: (status) => {
        if (qaRef.current) {
          qaRef.current.setLoggedIn(status);
        }
      },
      open: () => {
        if (qaRef.current) {
          qaRef.current.open();
        }
      },
      close: () => {
        if (qaRef.current) {
          qaRef.current.close();
        }
      },
      toggle: () => {
        if (qaRef.current) {
          qaRef.current.toggle();
        }
      },
      setDisabled: (status) => {
        if (qaRef.current) {
          qaRef.current.setDisabled(status);
        }
      },
      setVisible: (status) => {
        if (qaRef.current) {
          qaRef.current.setVisible(status);
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