import React, { useState, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import QABot from './components/QABot';
import reportWebVitals from './reportWebVitals';

// Example app component with interactive controls
function ExampleApp() {
  const [userLoggedIn, setUserLoggedIn] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const botRef = useRef();

  const handleSendHelloWorld = () => {
    if (botRef.current) {
      botRef.current.addMessage("Hello World!");
    }
  };

  return (
    <div>
      {/* Demo controls */}
      <div className="demo-container">
        <div className="demo-title">
          QA Bot React Component Demo
        </div>

        <div className="demo-controls">
          {/* User controls */}
          <div className="demo-section">
            <h3>User Settings</h3>

            <label className="demo-checkbox">
              <input
                type="checkbox"
                checked={userLoggedIn}
                onChange={(e) => setUserLoggedIn(e.target.checked)}
              />
              User is logged in
            </label>

            <label className="demo-checkbox">
              <input
                type="checkbox"
                checked={chatOpen}
                onChange={(e) => setChatOpen(e.target.checked)}
              />
              Chat window open
            </label>
          </div>

          {/* Message sender */}
          <div className="demo-message-section">
            <h3>Send Message</h3>

            <button
              onClick={handleSendHelloWorld}
              className="demo-send-button"
            >
              Send Hello World
            </button>
          </div>
        </div>
      </div>

      <QABot
        ref={botRef}
        isLoggedIn={userLoggedIn}
        embedded={false}
        open={chatOpen}
        onOpenChange={setChatOpen}
        loginUrl="/login"
        apiKey={process.env.REACT_APP_API_KEY}
        welcome="Hello! I'm the ACCESS Q&A Bot. How can I help you today?"
      />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ExampleApp />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
