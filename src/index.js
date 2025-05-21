import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { qAndATool } from './lib';
import reportWebVitals from './reportWebVitals';

// Expose qAndATool globally so it can be called directly from HTML files like index.html
// This enables the non-React integration methods demonstrated in the top-level index.html
window.qAndATool = qAndATool;

// simulated consuming app's user state
// In current usage, disabled is a function of isLoggedIn
// But that will not always be the case
// The bot will eventually have some functionality when not logged in
const userLoggedIn = false;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App disabled={!userLoggedIn} />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
