# ACCESS Q&A Bot

A React component and Web Component for integrating the ACCESS Q&A Bot into your application.

## Installation

```bash
npm install access-qa-bot
```

## Usage

### As a React Component

```jsx
import React, { useState } from 'react';
import { QABot } from 'access-qa-bot';

function MyApp() {
  const [isOpen, setIsOpen] = useState(false);
  const isLoggedIn = true; // Determine based on your auth logic

  return (
    <div className="app">
      <h1>My React Application</h1>

      <button onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? 'Close' : 'Open'} Q&A Bot
      </button>

      <QABot
        isLoggedIn={isLoggedIn}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        welcome="Welcome to the ACCESS Q&A Bot!"
        prompt="How can I help you today?"
        apiKey={process.env.REACT_APP_API_KEY}
      />
    </div>
  );
}
```

### As a Web Component

#### Method 1: Using HTML directly

```html
<script src="https://unpkg.com/access-qa-bot@0.2.0/dist/access-qa-bot.standalone.js"></script>

<access-qa-bot
  welcome="Welcome to the Q&A Bot!"
  prompt="Ask me anything about ACCESS..."
  is-logged-in
  is-open>
</access-qa-bot>
```

#### Method 2: Creating programmatically

```html
<script src="https://unpkg.com/access-qa-bot@0.2.0/dist/access-qa-bot.standalone.js"></script>

<div id="qa-container"></div>

<script>
  const container = document.getElementById('qa-container');
  const qaBot = document.createElement('access-qa-bot');
  qaBot.setAttribute('welcome', 'Hello!');
  qaBot.setAttribute('prompt', 'Ask something...');
  qaBot.setAttribute('is-logged-in', '');
  container.appendChild(qaBot);
</script>
```

#### Method 3: Using the JavaScript API

```html
<script src="https://unpkg.com/access-qa-bot@0.2.0/dist/access-qa-bot.standalone.js"></script>

<div id="js-api-container"></div>

<script>
  window.addEventListener('load', function() {
    if (window.accessQABot && window.accessQABot.qAndATool) {
      window.accessQABot.qAndATool({
        target: document.getElementById('js-api-container'),
        welcome: "This is created using the JavaScript API!",
        prompt: "Ask a question about ACCESS...",
        isLoggedIn: true,
        embedded: true,
        isOpen: true
      });
    }
  });
</script>
```

## Properties

| Property | Type | Description |
|----------|------|-------------|
| welcome | string | Welcome message shown to the user |
| prompt | string | Text shown in the input field |
| embedded | boolean | Display in embedded mode |
| isLoggedIn / is-logged-in | boolean | Whether the user is logged in |
| disabled | boolean | Disable the chat input |
| isOpen / is-open | boolean | Whether the chat is open |
| apiKey / api-key | string | API key for authentication |
| onClose | function | Callback when the chat is closed (React only) |

## Events

When using as a Web Component, you can listen for the following events:

```javascript
document.querySelector('access-qa-bot').addEventListener('qabot-close', () => {
  console.log('Chat was closed');
});
```

## Browser Support

The Web Component implementation uses modern browser features. For older browsers, consider using a polyfill.
