import React, { useState, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import QABot from './components/QABot';
import reportWebVitals from './reportWebVitals';

function ExampleApp() {
  const [userLoggedIn, setUserLoggedIn] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [email, setUserEmail] = useState('');
  const [name, setUserName] = useState('');
  const [accessId, setAccessId] = useState('');
  const botRef = useRef();

  const handleSendHelloWorld = () => {
    if (botRef.current) {
      botRef.current.addMessage("Hello World!");
    }
  };

  return (
    <div>
      <div className="demo-container">
        <div className="demo-title">
          QA Bot React Component Demo
        </div>

        <div className="demo-controls">
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

          <div className="demo-section">
            <h3>User Information</h3>
            <p className="demo-help">When logged in, these fields will pre-populate ticket forms:</p>
            
            <div className="demo-field">
              <label htmlFor="user-email-react">Email:</label>
              <input
                id="user-email-react"
                type="email"
                value={email}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="user@example.com"
                className="demo-input"
              />
            </div>

            <div className="demo-field">
              <label htmlFor="user-name-react">Name:</label>
              <input
                id="user-name-react"
                type="text"
                value={name}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="John Doe"
                className="demo-input"
              />
            </div>

            <div className="demo-field">
              <label htmlFor="accessId-react">ACCESS ID:</label>
              <input
                id="accessId-react"
                type="text"
                value={accessId}
                onChange={(e) => setAccessId(e.target.value)}
                placeholder="johndoe123"
                className="demo-input"
              />
            </div>
          </div>

          <div className="demo-message-section">
            <h3>Send Message</h3>

            <button
              onClick={handleSendHelloWorld}
              className="demo-send-button"
            >
              Send Hello World (Imperative)
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
        apiKey={(typeof process !== 'undefined' && process.env) ? process.env.REACT_APP_API_KEY : null}
        welcome="What can I help you with?"
        userEmail={email || undefined}
        userName={name || undefined}
        accessId={accessId || undefined}
      />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ExampleApp />
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
