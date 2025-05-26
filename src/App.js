/**
 * Wrapper component used by the accessQABot() JavaScript API
 */
import React from 'react';
import './App.css';
import QABot from './components/QABot';

const App = React.forwardRef((props, ref) => {
  return (
    <QABot
      ref={ref}
      apiKey={props.apiKey}
      defaultOpen={props.defaultOpen}
      disabled={props.disabled}
      embedded={props.embedded}
      isLoggedIn={props.isLoggedIn}
      loginUrl={props.loginUrl}
      onClose={props.onClose}
      prompt={props.prompt}
      welcome={props.welcome}
    />
  );
});

export default App;
