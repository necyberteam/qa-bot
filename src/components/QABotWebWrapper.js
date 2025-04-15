// QABotWebWrapper.js
import React from 'react';
import QABot from './QABot';
import '../web-component.css';

// This component wraps QABot with additional styling for web component usage
const QABotWebWrapper = (props) => {
  return (
    <div className="qa-bot-web-wrapper">
      <QABot {...props} />
    </div>
  );
};

export default QABotWebWrapper;