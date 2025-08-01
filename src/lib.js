import React from 'react';
import ReactDOM from 'react-dom/client';
import QABot from './components/QABot';
import './styles/index.css'; // QA Bot styles

// Export for react
export { QABot };

// React wrapper component for programmatic API
const ProgrammaticQABot = React.forwardRef((props, ref) => {
  const [botIsLoggedIn, setBotIsLoggedIn] = React.useState(props.isLoggedIn || false);
  const [chatOpen, setChatOpen] = React.useState(props.defaultOpen || false);
  const qaRef = React.useRef();

  // Expose controller methods via ref
  React.useImperativeHandle(ref, () => ({
    addMessage: (message) => {
      if (qaRef.current) {
        qaRef.current.addMessage(message);
      }
    },
    setBotIsLoggedIn: (status) => {
      setBotIsLoggedIn(status);
    },
    openChat: () => {
      if (!props.embedded && qaRef.current) {
        setChatOpen(true);
      }
    },
    closeChat: () => {
      if (!props.embedded && qaRef.current) {
        setChatOpen(false);
      }
    },
    toggleChat: () => {
      if (!props.embedded && qaRef.current) {
        setChatOpen(prev => !prev);
      }
    }
  }), [props.embedded]);

  return (
    <QABot
      ref={qaRef}
      apiKey={props.apiKey}
      embedded={props.embedded}
      isLoggedIn={botIsLoggedIn}
      open={props.embedded ? true : chatOpen}
      onOpenChange={props.embedded ? undefined : setChatOpen}
      loginUrl={props.loginUrl}
      ringEffect={props.ringEffect}
      welcome={props.welcome}
      userEmail={props.userEmail}
      userName={props.userName}
      accessId={props.accessId}
    />
  );
});

ProgrammaticQABot.displayName = 'ProgrammaticQABot';

// Export for JS API - now React-backed for all usage
export function qaBot(config) {
  if (!config.target || !(config.target instanceof HTMLElement)) {
    console.error('QA Bot: A valid target DOM element is required');
    return;
  }

  const root = ReactDOM.createRoot(config.target);
  const wrapperRef = { current: null };

  root.render(
    <React.StrictMode>
      <ProgrammaticQABot
        ref={(ref) => { wrapperRef.current = ref; }}
        apiKey={config.apiKey}
        defaultOpen={config.defaultOpen}
        embedded={config.embedded}
        isLoggedIn={config.isLoggedIn}
        loginUrl={config.loginUrl}
        ringEffect={config.ringEffect}
        welcome={config.welcome}
        userEmail={config.userEmail}
        userName={config.userName}
        accessId={config.accessId}
      />
    </React.StrictMode>
  );

  return {
    addMessage: (message) => wrapperRef.current?.addMessage(message),
    setBotIsLoggedIn: (status) => wrapperRef.current?.setBotIsLoggedIn(status),
    openChat: () => wrapperRef.current?.openChat(),
    closeChat: () => wrapperRef.current?.closeChat(),
    toggleChat: () => wrapperRef.current?.toggleChat(),
    destroy: () => {
      wrapperRef.current = null;
      root.unmount();
    }
  };
}
export default qaBot;