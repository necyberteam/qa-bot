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
  version,
  isLoggedIn,
  isAnonymous,
  defaultOpen,
  embedded,
  welcome,
  prompt,
  disabled,
  onClose,
  apiKey
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
      isLoggedIn,
      isAnonymous,
      defaultOpen,
      embedded,
      welcome,
      prompt,
      disabled,
      onClose,
      apiKey
    });
  } else {
    // Use direct react rendering
    const root = ReactDOM.createRoot(target);

    root.render(
      <React.StrictMode>
        <App
          embedded={embedded}
          defaultOpen={defaultOpen}
          welcome={welcome}
          prompt={prompt}
          isLoggedIn={isLoggedIn}
          isAnonymous={isAnonymous}
          disabled={disabled}
          onClose={onClose}
          apiKey={apiKey}
        />
      </React.StrictMode>
    );

    // Return a cleanup function
    return () => {
      root.unmount();
    };
  }
}

// Default export for simplicity
export default QABot;