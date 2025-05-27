import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import QABot from './components/QABot';
import { accessQABot } from './lib';
import reportWebVitals from './reportWebVitals';

// Expose accessQABot globally so it can be called directly from HTML files like index.html
// This enables the non-React integration methods demonstrated in the top-level index.html
window.accessQABot = accessQABot;

// Example app component with interactive controls
function ExampleApp() {
  const [userLoggedIn, setUserLoggedIn] = useState(false);

  return (
    <div>
      {/* Development controls */}
      <div style={{
        padding: '20px',
        backgroundColor: '#f5f5f5',
        borderBottom: '1px solid #ddd',
        marginBottom: '20px'
      }}>
        <div style={{ marginBottom: '10px', fontSize: '1.5em' }}>
          <label>
            <input
              type="checkbox"
              style={{ height: '1.5em', width: '1.5em' }}
              checked={userLoggedIn}
              onChange={(e) => setUserLoggedIn(e.target.checked)}
            />
            {' '}User logged in
          </label>
        </div>
        <div style={{ marginTop: '10px', fontSize: '0.9em', color: '#666' }}>
          <em>Toggle to test login state changes</em>
        </div>
      </div>

      <QABot
        isLoggedIn={userLoggedIn}
        embedded={false}
        defaultOpen={false}
        disabled={false}
        loginUrl="/login"
        welcome="Welcome to the ACCESS Q&A Bot development environment!"
        apiKey={process.env.REACT_APP_API_KEY}
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
