import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Popup Chat widget
const domNode = document.createElement('div');
const root = ReactDOM.createRoot(domNode);

const disabled = window.isAnonymous;

root.render(
  <React.StrictMode>
    <App disabled={disabled} />
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
      <App embedded welcome={welcome} prompt={prompt} disabled={disabled}/>
    </React.StrictMode>
  );
  embeddedQABot.appendChild(embeddedDomNode);
});

// attach login event to the disabled chatbot input
const loginHandler = () => {
  if (disabled) {
    const loginUrl = '/login?destination=' + window.location.pathname;
    window.location = loginUrl;
  }
}
const addCustomEventListener = (selector, event, handler) => {
  let rootElement = document.querySelector('body');
  rootElement.addEventListener(event, function (evt) {
          var targetElement = evt.target;
          while (targetElement != null) {
              if (targetElement.matches(selector)) {
                  handler(evt);
                  return;
              }
              targetElement = targetElement.parentElement;
          }
      },
      true
  );
}
//adding the Event Listeners to all the chatbot instances
addCustomEventListener('.rcb-chat-input','click',loginHandler);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
