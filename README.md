# ACCESS Q&A Bot

A React component and Web Component for integrating the ACCESS Q&A Bot into your application. The bot can operate in two modes: **floating** (chat button that opens/closes a window) or **embedded** (always visible inline).

## Installation

```bash
npm install @snf/access-qa-bot
```

## Developing React App

```bash
npm install
npm run start
```

## Running the Demo

This will serve the index.html file in the root directory, which demonsrates two different ways to integrate the bot.

```bash
npm run build:lib
npm run build
npx serve
```


### Floating vs Embedded Modes

The ACCESS Q&A Bot supports two display modes:

- **Floating Mode** (default): Shows a chat button that opens/closes a floating chat window
- **Embedded Mode**: Always visible, embedded directly in the page content

**All integration methods support both modes**, but have different defaults:

| Method | Default Mode | Override |
|--------|--------------|----------|
| Element ID (`#qa-bot`) | Floating | Set `embedded: true` |
| CSS Class (`.embedded-qa-bot`) | Embedded | n/a |
| JavaScript API | Floating | Set `embedded: true` |
| Custom Element (`<access-qa-bot>`) | Floating | Add `embedded` attribute |

## Integration Methods

### Method 1: Auto-Detection by Element ID (Floating by Default)

Simply add a div with id `qa-bot` to your HTML:

```html
<script src="https://unpkg.com/@snf/access-qa-bot@0.2.0/dist/access-qa-bot.standalone.js"></script>

<!-- Automatically creates a floating chat button -->
<div id="qa-bot"></div>
```

### Method 2: Auto-Detection by CSS Class (Embedded by Default)

Use the `embedded-qa-bot` class with optional data attributes:

```html
<script src="https://unpkg.com/@snf/access-qa-bot@0.2.0/dist/access-qa-bot.standalone.js"></script>

<!-- Automatically creates an embedded chat widget -->
<div class="embedded-qa-bot"
     data-welcome="Hello!"
     data-prompt="Ask me anything..."></div>
```

### Method 3: Programmatic JavaScript API (Floating by Default)

Call the `accessQABot()` function with full control:

```html
<script src="https://unpkg.com/@snf/access-qa-bot@0.2.0/dist/access-qa-bot.standalone.js"></script>

<div id="my-bot-container"></div>

<script>
window.addEventListener('load', function() {
    const controller = accessQABot({
        target: document.getElementById('my-bot-container'),
        embedded: false,  // false = floating (default), true = embedded
        welcome: "Custom welcome message!",
        prompt: "Ask me about ACCESS...",
        isLoggedIn: true,
        defaultOpen: false,
        ringEffect: true  // Enable phone ring animation on tooltip
    });

    // Use the controller to interact with the bot
    controller.addMessage("Hello from JavaScript!");
    controller.openChat();  // Only works in floating mode
});
</script>
```

### Method 4: Custom Web Component Element (Floating by Default)

Use the `<access-qa-bot>` custom element directly in your HTML:

```html
<script src="https://unpkg.com/@snf/access-qa-bot@0.2.0/dist/access-qa-bot.standalone.js"></script>

<!-- Floating mode (default) -->
<access-qa-bot
    welcome="Welcome to the Q&A Bot!"
    prompt="Ask me anything about ACCESS..."
    is-logged-in
    default-open
    ring-effect>
</access-qa-bot>

<!-- Embedded mode -->
<access-qa-bot
    embedded
    welcome="This is an embedded bot!"
    prompt="Ask your questions here...">
</access-qa-bot>
```

**Custom Element Attributes:**
- `api-key` - API key for authentication
- `default-open` - Initially open floating chat (boolean attribute)
- `disabled` - Disable chat input (boolean attribute)
- `embedded` - Use embedded mode (boolean attribute)
- `is-logged-in` - User is logged in (boolean attribute)
- `login-url` - URL for login redirect
- `prompt` - Input placeholder text
- `ring-effect` - Enable phone ring animation on tooltip (boolean attribute)
- `welcome` - Welcome message

**Accessing the Custom Element Programmatically:**
```javascript
// Get reference to the custom element
const botElement = document.querySelector('access-qa-bot');

// Call methods directly on the element
botElement.addMessage("Hello World!");
botElement.setBotIsLoggedIn(true);
botElement.openChat();  // Floating mode only
botElement.closeChat(); // Floating mode only
botElement.toggleChat(); // Floating mode only
```

## Programmatic Control

When using the JavaScript API, you get a controller object with these methods:

```javascript
const controller = accessQABot({...});

// Add a message to the chat
controller.addMessage("Hello World!");

// Set user login status
controller.setBotIsLoggedIn(true);

// Control chat window (floating mode only)
controller.openChat();
controller.closeChat();
controller.toggleChat();

// Cleanup
controller.destroy();
```

## As a React Component

For React applications, import and use the component directly:

```jsx
import React, { useRef, useState } from 'react';
import { QABot, accessQABot } from '@snf/access-qa-bot';

function MyApp() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const botRef = useRef();

    const handleAddMessage = () => {
        botRef.current?.addMessage("Hello from React!");
    };

    // You can also use the programmatic API in React if needed
    const handleCreateProgrammaticBot = () => {
        const container = document.getElementById('programmatic-bot');
        if (container) {
            accessQABot({
                target: container,
                embedded: true,
                welcome: "Programmatically created bot!",
                isLoggedIn: isLoggedIn,
                ringEffect: true
            });
        }
    };

    return (
        <div className="app">
            <h1>My React Application</h1>

            <button onClick={handleAddMessage}>
                Send Message to Bot
            </button>

            <button onClick={handleCreateProgrammaticBot}>
                Create Programmatic Bot
            </button>

            <QABot
                ref={botRef}
                embedded={false}  // true for embedded, false for floating
                isLoggedIn={isLoggedIn}
                defaultOpen={false}
                welcome="Welcome to the ACCESS Q&A Bot!"
                prompt="How can I help you today?"
                ringEffect={true}
                apiKey={process.env.REACT_APP_API_KEY}
            />

            <div id="programmatic-bot"></div>
        </div>
    );
}
```

## Configuration Properties

| Property | Type | Description |
|----------|------|-------------|
| `apiKey` / `api-key` | string | API key for authentication (defaults to demo key) |
| `defaultOpen` / `default-open` | boolean | Whether floating chat opens initially (ignored in embedded mode) |
| `disabled` | boolean | Disable the chat input |
| `embedded` | boolean | **false** = floating mode, **true** = embedded mode |
| `isLoggedIn` / `is-logged-in` | boolean | Whether the user is logged in |
| `loginUrl` / `login-url` | string | URL to redirect for login (default: '/login') |
| `prompt` | string | Placeholder text shown in the input field |
| `ringEffect` / `ring-effect` | boolean | Enable phone ring animation on tooltip (floating mode only) |
| `welcome` | string | Welcome message shown to the user |

### CSS Custom Properties (Theming)

Customize the appearance by setting CSS custom properties on the container:

```html
<div id="qa-bot" style="
    --primary-color: #007bff;
    --secondary-color: #6c757d;
    --font-family: 'Arial', sans-serif;
"></div>
```

## Direct CDN Deployment

For websites that don't use npm, include directly via CDN:

```html
<!-- CSS (optional, for embedded styling) -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/necyberteam/qa-bot@v0.2.0/build/static/css/main.css">

<!-- JavaScript -->
<script src="https://cdn.jsdelivr.net/gh/necyberteam/qa-bot@v0.2.0/dist/access-qa-bot.standalone.js"></script>

<!-- Your content -->
<div id="qa-bot"></div>
```

## Development and Testing

### Development Server (React Implementation)
```bash
npm start
# Opens http://localhost:3000 with React dev server
```

### Testing Standalone Integration
```bash
# Build the library and project
npm run build:lib
npm run build

# Serve the standalone demo files
npx serve

# Then visit:
# http://localhost:3000/index.html (integration demos)
# http://localhost:3000/web-component-demo.html (web component demos)
```

## File Structure Guide

- **`index.html`** - Main demo showing all integration methods
- **`web-component-demo.html`** - Web Component specific demos
- **`public/index.html`** - React app template (Create React App)
- **`build/index.html`** - Built React app
- **`src/`** - Source code
  - **`components/QABot.js`** - Main React component
  - **`web-component.js`** - Web Component implementation
  - **`lib.js`** - JavaScript API

## Important Notes

1. **Embedded vs Floating**:
   - Embedded mode is always visible and ignores `defaultOpen`
   - Floating mode shows a chat button; `defaultOpen` controls initial state
   - Chat window controls (`openChat`, `closeChat`, `toggleChat`) only work in floating mode

2. **Ring Effect**:
   - Only works in floating mode when the tooltip is visible
   - Triggers a phone-like ring animation to draw attention
   - Activates once when the bot is first loaded (500ms delay)
   - Won't repeat if user has already interacted with the chat

3. **Auto-Detection**: The standalone script automatically detects and initializes:
   - `#qa-bot` → Floating mode
   - `.embedded-qa-bot` → Embedded mode

4. **API Key**: Defaults to demo key if not provided

5. **Browser Support**: Uses modern browser features; consider polyfills for older browsers

## Examples Repository

See the demo files in this repository for complete working examples of all integration methods.
