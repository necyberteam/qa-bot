import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { qAndATool } from './lib';

// Expose qAndATool globally so it can be called directly from HTML files like index.html
// This enables the non-React integration methods demonstrated in the top-level index.html
window.qAndATool = qAndATool;

// Demo-specific code to handle login state
function initializeDemo() {
  // Get login state from a data attribute or the existing global variable
  const isLoggedIn = document.body.hasAttribute('data-logged-in') ||
                    (window.isAnonymous !== undefined ? !window.isAnonymous : false);

  // Standard CRA rendering for the demo
  const rootElement = document.getElementById('root');
  if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App disabled={!isLoggedIn} isLoggedIn={isLoggedIn} />
      </React.StrictMode>
    );
  }

  // Simple login handler for demo purposes
  const loginHandler = () => {
    if (!isLoggedIn) {
      const loginUrl = '/login?destination=' + window.location.pathname;
      window.location = loginUrl;
    }
  }

  // Add listener to chat input for login redirection
  document.querySelector('body').addEventListener('click', (evt) => {
    let targetElement = evt.target;
    while (targetElement != null) {
      if (targetElement.matches('.rcb-chat-input')) {
        loginHandler(evt);
        return;
      }
      targetElement = targetElement.parentElement;
    }
  }, true);
}

// Initialize the demo when the DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeDemo);
} else {
  initializeDemo();
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
import reportWebVitals from './reportWebVitals';
reportWebVitals();