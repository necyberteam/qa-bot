import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Popup Chat widget
const domNode = document.createElement('div');
const root = ReactDOM.createRoot(domNode); 
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
document.body.appendChild(domNode); 

// Look for optional elements for an embedded chat widget
const embeddedQABots = document.querySelectorAll('.embedded-qa-bot');
embeddedQABots.forEach(embeddedQABot => {
  // welcome message and prompt are data- attributes
  const welcome = embeddedQABot.dataset.welcome;
  const prompt = embeddedQABot.dataset.prompt;
  const embeddedDomNode = document.createElement('div');
  const embeddedRoot = ReactDOM.createRoot(embeddedDomNode); 
  embeddedRoot.render(
    <React.StrictMode>
      <App embedded welcome={welcome} prompt={prompt}/>
    </React.StrictMode>
  );
  embeddedQABot.appendChild(embeddedDomNode);
});

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
