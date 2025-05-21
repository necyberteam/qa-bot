# ACCESS Q&A Bot

A React component and Web Component for integrating the ACCESS Q&A Bot into your application.

## Installation

```bash
npm install @snf/access-qa-bot
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
        defaultOpen={isOpen}
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
<script src="https://unpkg.com/@snf/access-qa-bot@0.2.0/dist/access-qa-bot.standalone.js"></script>

<access-qa-bot
  welcome="Welcome to the Q&A Bot!"
  prompt="Ask me anything about ACCESS..."
  is-logged-in
  default-open>
</access-qa-bot>
```

#### Method 2: Creating programmatically

```html
<script src="https://unpkg.com/@snf/access-qa-bot@0.2.0/dist/access-qa-bot.standalone.js"></script>

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
<script src="https://unpkg.com/@snf/access-qa-bot@0.2.0/dist/access-qa-bot.standalone.js"></script>

<div id="js-api-container"></div>

<script>
  window.addEventListener('load', function() {
    if (window.accessQABot && window.accessQABot.qAndATool) {
      window.accessQABot.qAndATool({
        target: document.getElementById('js-api-container'),
        welcome: "This is created using the JavaScript API!",
        prompt: "Ask a question about ACCESS...",
        isLoggedIn: true,
        embedded: true
      });
    }
  });
</script>
```

### Direct Deployment via jsDelivr CDN

For websites that don't use npm packages, you can directly include the ACCESS Q&A Bot using jsDelivr CDN:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/necyberteam/qa-bot@v0.2.0/build/static/css/main.css">
<div style="display:none;" id="qa-bot">
    &nbsp;
</div>
<script src="https://cdn.jsdelivr.net/gh/necyberteam/qa-bot@v0.2.0/build/static/js/main.js"></script>
<script src="https://cdn.jsdelivr.net/gh/necyberteam/qa-bot@v0.2.0/build/static/js/453.chunk.js"></script>
```

Replace `v0.2.0` with the specific version you want to use. This method provides the React version of the bot and automatically initializes it when the page loads.

## Properties

| Property | Type | Description |
|----------|------|-------------|
| apiKey / api-key | string | API key for authentication |
| defaultOpen / default-open | boolean | Whether the floating chat window is initially open |
| disabled | boolean | Disable the chat input |
| embedded | boolean | Display in embedded mode |
| isLoggedIn / is-logged-in | boolean | Whether the user is logged in |
| loginUrl / login-url | string | URL to redirect for login |
| onClose | function | Callback when the chat is closed (React only) |
| prompt | string | Text shown in the input field |
| visible | boolean | Whether the bot is visible |
| welcome | string | Welcome message shown to the user |

## Important Notes

1. The `defaultOpen` property only applies to the floating chat window. When in embedded mode, the chat is always open.

## Events

When using as a Web Component, you can listen for the following events:

```javascript
document.querySelector('access-qa-bot').addEventListener('qabot-close', () => {
  console.log('Chat was closed');
});
```

## Disambiguating all the different html files here

- **index.html**: The main demo file showcasing React-based integration methods with three different approaches to integrate the QA Bot: auto-mounting to a specific div ID, using class-based selectors, and explicitly calling the JavaScript function.

- **public/index.html**: The standard React application template file created by Create React App. This serves as the base HTML template that gets processed during the React build process.

- **build/index.html**: The minified production version of the public/index.html file after the build process has completed. This contains all the necessary script and link tags to load the compiled React application.

- **web-component-demo.html**: A standalone demo specifically showcasing the Web Component implementation (using the custom `<access-qa-bot>` element). This demonstrates three integration methods: standard floating button, embedded mode, and using the JavaScript API with the Web Component.

The **index.html** file is focused on the React component usage, while **web-component-demo.html** focuses on the Web Component usage, providing complete examples for both integration approaches.

## Development and Testing

### Development Server
When running the default development script (`npm start` or `yarn start`), the application serves the content from the `public` directory using React's development server. This shows the default React implementation with hot reloading enabled. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

```bash
# Start the development server (React implementation)
npm start
```

### Testing Standalone Demo Files
To test the standalone demo files (`index.html` and `web-component-demo.html`) at the root level, you need to:

1. Stop the development server (if running)
2. Build the library (`npm run build:lib`)
3. Build the project (`npm run build`)
4. Serve the root directory using a static file server:

```bash
# After building, serve the files from root
npx serve
```

Then you can access:
- The React demo at `/index.html` (or just `/`)
- The Web Component demo at `/web-component-demo.html`

This allows testing both integration approaches (React components and Web Components) in their respective demo environments.

Note: The standalone demos rely on the built files in the `dist` and `build` directories, so make sure to build the project before testing.

## Browser Support

The Web Component implementation uses modern browser features. For older browsers, consider using a polyfill.
