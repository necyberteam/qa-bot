import React from 'react';
import './App.css';
import QABot from './components/QABot';

/**
 * Main App component
 * Handles login state and passes props to QABot component
 * props:
 * - embedded: boolean
 * - welcome: string
 * - prompt: string
 * - isLoggedIn: boolean
 * - disabled: boolean
 * - isOpen: boolean
 * - onClose: function
 */
function App(props) {
  return (
    <QABot
      embedded={props.embedded}
      welcome={props.welcome}
      prompt={props.prompt}
      isLoggedIn={props.isLoggedIn}
      disabled={props.disabled}
      isOpen={props.isOpen}
      onClose={props.onClose}
      apiKey={props.apiKey}
    />
  );
}

export default App;
