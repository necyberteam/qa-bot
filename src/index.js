import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { qAndATool } from './lib';
import reportWebVitals from './reportWebVitals';

// Expose qAndATool globally so it can be called directly from HTML files like index.html
// This enables the non-React integration methods demonstrated in the top-level index.html
window.qAndATool = qAndATool;

// Set up default state based on authentication
const isLoggedIn = !window.isAnonymous;
const disabled = window.isAnonymous === true;

// Standard CRA rendering
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App disabled={disabled} isLoggedIn={isLoggedIn} />
  </React.StrictMode>
);

// Simple login handler for demo purposes
const loginHandler = () => {
  if (disabled) {
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

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
