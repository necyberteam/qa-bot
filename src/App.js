import React from 'react';
import './App.css';
import QABot from './components/QABot';

function App(props) {
  return (
    <QABot
      embedded={props.embedded}
      defaultOpen={props.defaultOpen}
      welcome={props.welcome}
      prompt={props.prompt}
      isLoggedIn={props.isLoggedIn}
      isAnonymous={props.isAnonymous}
      disabled={props.disabled}
      onClose={props.onClose}
      apiKey={props.apiKey}
    />
  );
}

export default App;
