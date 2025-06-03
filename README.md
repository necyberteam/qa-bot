# Q&A Bot

A React component for integrating the Q&A Bot into your application. The bot can operate in two modes: **floating** (chat button that opens/closes a window) or **embedded** (always visible inline).

**Architecture**: Everything is React-backed for consistency and simplicity. HTML/plain JS usage loads a React-based standalone bundle.

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

This will serve the index.html file in the root directory, which demonstrates different ways to integrate the bot.

```bash
npm run build:lib
npm run build
npx serve
```

### Floating vs Embedded Modes

The Q&A Bot supports two display modes:

- **Floating Mode** (default): Shows a chat button that opens/closes a floating chat window
- **Embedded Mode**: Always visible, embedded directly in the page content

**All integration methods support both modes**, but have different defaults:

| Method | Default Mode | Override |
|--------|--------------|----------|
| Element ID (`#qa-bot`) | Floating | Set `embedded: true` |
| CSS Class (`.embedded-qa-bot`) | Embedded | n/a |
| JavaScript API | Floating | Set `embedded: true` |

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
     data-welcome="Hello!"></div>
```

### Method 3: Programmatic JavaScript API (Floating by Default)

Call the `qaBot()` function with full control:

```html
<script src="https://unpkg.com/@snf/access-qa-bot@0.2.0/dist/access-qa-bot.standalone.js"></script>

<div id="my-bot-container"></div>

<script>
// Check if user is logged in by looking for auth cookie
function isUserLoggedIn() {
    return document.cookie.split(';').some(cookie => {
        return cookie.trim().startsWith('SESSaccesscisso=');
    });
}

window.addEventListener('load', function() {
    const botController = qaBot({
        target: document.getElementById('my-bot-container'),
        embedded: false,  // false = floating (default), true = embedded
        welcome: "Custom welcome message!",
        isLoggedIn: isUserLoggedIn(),
        defaultOpen: false,
    });

    // Use the controller to interact with the bot
    botController.addMessage("Hello from JavaScript!");
    botController.openChat();  // Only works in floating mode
});
</script>
```

## Programmatic Control

When using the JavaScript API in plain HTML/JS (requires standalone bundle), you get a controller object with these methods:

```javascript
const botController = qaBot({...});

// Add a message to the chat
botController.addMessage("Hello World!");

// Set user login status
botController.setBotIsLoggedIn(true);

// Control chat window (floating mode only)
botController.openChat();
botController.closeChat();
botController.toggleChat();

// Cleanup
botController.destroy();
```

**Note**: The `qaBot()` function requires the standalone bundle (`access-qa-bot.standalone.js`) to be loaded first. React/Preact applications should use the `<QABot />` component instead.

## As a React Component

For React applications, import and use the component directly. If you want to be able to imperatively add a message to the chat, you can use the ref to do so.

```jsx
import React, { useRef, useState } from 'react';
import { QABot } from '@snf/access-qa-bot';

function MyApp() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [chatOpen, setChatOpen] = useState(false);
    const botRef = useRef();

    const handleAddMessage = () => {
        botRef.current?.addMessage("Hello from React!");
    };

    const handleOpenChat = () => {
        setChatOpen(true);
    };

    const handleToggleLogin = () => {
        setIsLoggedIn(!isLoggedIn);
    };

    return (
        <div className="app">
            <h1>My React Application</h1>

            <button onClick={handleAddMessage}>
                Send Message to Bot
            </button>

            <button onClick={handleOpenChat}>
                Open Chat (Controlled)
            </button>

            <button onClick={handleToggleLogin}>
                Toggle Login State
            </button>

            <QABot
                ref={botRef} // This is only needed if you want to add a message from outside the flow
                embedded={false}  // true for embedded, false for floating
                isLoggedIn={isLoggedIn}
                open={chatOpen}
                onOpenChange={setChatOpen}
                welcome="Welcome to the ACCESS Q&A Bot!"
                apiKey={process.env.REACT_APP_API_KEY}
            />
        </div>
    );
}
```

**React Component Notes:**
- Uses **controlled component pattern**: manage `open` and `isLoggedIn` state in your parent component
- `onOpenChange` callback receives the new open state when user interacts with chat
- For programmatic message injection, use the ref: `botRef.current?.addMessage("Hello!")`
- `defaultOpen` prop not available - use `open` prop with `useState` instead
- For state management (login, chat open/close), use props and state instead of imperative methods

## Configuration Properties

| Property | Type | Description |
|----------|------|-------------|
| `apiKey` / `api-key` | string | API key for authentication (defaults to demo key) |
| `defaultOpen` / `default-open` | boolean | Whether floating chat opens initially (ignored in embedded mode) **React Component: Use `open` prop instead** |
| `embedded` | boolean | **false** = floating mode, **true** = embedded mode |
| `isLoggedIn` / `is-logged-in` | boolean | Sets initial login state and reacts to changes |
| `loginUrl` / `login-url` | string | URL to redirect for login (default: '/login') |
| `open` | boolean | **React Component only**: Controls chat window open state (floating mode only) |
| `onOpenChange` | function | **React Component only**: Callback when chat window open state changes |
| `ringEffect` / `ring-effect` | boolean | Enable phone ring animation on tooltip (floating mode only) |
| `welcome` | string | Welcome message shown to the user |

**Note**: The React component uses a controlled component pattern with `open`/`onOpenChange`, while the JavaScript API uses `defaultOpen` for initial state.

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
```

## File Structure Guide

- **`index.html`** - Main demo showing all integration methods
- **`public/index.html`** - React app template (Create React App)
- **`build/index.html`** - Built React app
- **`src/`** - Source code
  - **`components/QABot.js`** - Main React component
  - **`lib.js`** - React-backed implementation for all usage patterns

## Important Notes

1. **React-Backed Architecture**:
   - Everything uses React components internally for consistency
   - HTML/plain JS usage loads a React-based standalone bundle
   - Single implementation reduces complexity and bugs

2. **Embedded vs Floating**:
   - Embedded mode is always visible and ignores `defaultOpen`
   - Floating mode shows a chat button; `defaultOpen` controls initial state
   - Chat window controls (`openChat`, `closeChat`, `toggleChat`) only work in floating mode

3. **Ring Effect**:
   - Only works in floating mode when the tooltip is visible
   - Triggers a phone-like ring animation to draw attention
   - Activates once when the bot is first loaded (500ms delay)
   - Won't repeat if user has already interacted with the chat

4. **Auto-Detection**: The standalone script automatically detects and initializes:
   - `#qa-bot` → Floating mode
   - `.embedded-qa-bot` → Embedded mode

5. **API Key**: Defaults to demo key if not provided

6. **Browser Support**: Uses modern browser features; consider polyfills for older browsers

## Examples Repository

See the demo files in this repository for complete working examples of all integration methods.