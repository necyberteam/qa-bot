import React, { useRef } from 'react';
import QABot from './QABot';

/**
 * Demo component showing how to use QABot with programmatic control
 */
const QABotDemo = () => {
  const qaRef = useRef(null);

  const handleOpenClick = () => {
    if (qaRef.current) {
      qaRef.current.open();
    }
  };

  const handleCloseClick = () => {
    if (qaRef.current) {
      qaRef.current.close();
    }
  };

  const handleToggleClick = () => {
    if (qaRef.current) {
      const isOpen = qaRef.current.toggle();
      console.log('QABot is now', isOpen ? 'open' : 'closed');
    }
  };

  const handleCheckStateClick = () => {
    if (qaRef.current) {
      const isOpen = qaRef.current.isOpen();
      alert(`QABot is currently ${isOpen ? 'open' : 'closed'}`);
    }
  };

  return (
    <div className="qa-bot-demo">
      <div className="controls">
        <h3>Programmatic Control</h3>
        <div className="button-row">
          <button onClick={handleOpenClick}>Open Bot</button>
          <button onClick={handleCloseClick}>Close Bot</button>
          <button onClick={handleToggleClick}>Toggle Bot</button>
          <button onClick={handleCheckStateClick}>Check State</button>
        </div>
      </div>

      <div className="embedded-bot-container" style={{ height: '600px', marginTop: '20px' }}>
        <QABot
          ref={qaRef}
          embedded={true}
          welcome="Hello! I'm controlled programmatically."
          prompt="Ask me a question about ACCESS..."
          defaultOpen={false}
          isLoggedIn={true}
        />
      </div>
    </div>
  );
};

export default QABotDemo;