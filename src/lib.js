import React, { useRef } from 'react';
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
export function qAndATool(config) {
  const { target, version, isLoggedIn, isAnonymous, defaultOpen, returnRef, ...otherProps } = config;

  if (!target || !(target instanceof HTMLElement)) {
    console.error('QA Bot: A valid target DOM element is required');
    return;
  }

  // If the web component is available, use it
  if (typeof window !== 'undefined' && typeof customElements !== 'undefined' &&
      customElements.get('access-qa-bot')) {
    return webComponentQAndATool({
      target,
      isLoggedIn,
      isAnonymous,
      defaultOpen,
      returnRef,
      ...otherProps
    });
  } else {
    // Use direct react rendering with ref support
    const root = ReactDOM.createRoot(target);
    const qaRef = React.createRef();

    root.render(
      <React.StrictMode>
        <QABot
          ref={qaRef}
          embedded={otherProps.embedded}
          defaultOpen={defaultOpen}
          welcome={otherProps.welcome}
          prompt={otherProps.prompt}
          isLoggedIn={isLoggedIn}
          isAnonymous={isAnonymous}
          disabled={otherProps.disabled}
          onClose={otherProps.onClose}
          apiKey={otherProps.apiKey}
        />
      </React.StrictMode>
    );

    // If returnRef is true, return ref methods for programmatic control
    if (returnRef) {
      // Return an object with the control methods that match the QABot component's API
      return {
        toggle: () => qaRef.current && qaRef.current.toggle(),
        open: () => qaRef.current && qaRef.current.open(),
        close: () => qaRef.current && qaRef.current.close(),
        isOpen: () => qaRef.current && qaRef.current.isOpen()
      };
    }

    // Otherwise return a cleanup function
    return () => {
      root.unmount();
    };
  }
}

// Default export for simplicity
export default QABot;