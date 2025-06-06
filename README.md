# Q&A Bot

A React component for integrating the Q&A Bot into your application.  Also includes a standalone bundle for plain HTML/JS usage.

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

## Integration Methods

The QABot can be integrated using a standalone javascript function, or as a react/preact component.

### React Component

For React applications, import and use the component directly.
- To control the chat programmatically, manage `open` and `isLoggedIn` state in your parent component.
- Use `onOpenChange` to keep your state in sync with user interactions.
- You can imperatively add a message to the bot using the `addMessage` function

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
                ref={botRef} // only needed if you want use the addMessage function
                embedded={false}
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

#### React Component Props

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `apiKey` | string | `"demo-key"` | API key for authentication |
| `embedded` | boolean | `false` | Floating or embedded mode |
| `isLoggedIn` | boolean | `false` | User login state |
| `loginUrl` | string | `"/login"` | Login redirect URL |
| `open` | boolean | - | Controls chat window (floating mode only) |
| `onOpenChange` | function | - | Chat window state change callback |
| `ringEffect` | boolean | `true` | Phone ring animation on tooltip |
| `welcome` | string | - | Welcome message |

### Standalone Javascript

```html
<script src="https://unpkg.com/@snf/access-qa-bot@2.1.0/dist/access-qa-bot.standalone.js"></script>

<div id="qa-bot"></div>

<script>
qaBot({
    target: document.getElementById('qa-bot'),
    embedded: false,
    welcome: "Custom welcome message!",
    defaultOpen: false,
});
</script>
```

#### Programmatic Control

When using the JavaScript API in plain HTML/JS (requires standalone bundle), you get a controller object with imperative methods:

```javascript
const botController = qaBot({
    target: document.getElementById('qa-bot'),
    embedded: false,
    welcome: "Custom welcome message!",
    defaultOpen: false,
});

botController.addMessage("Hello World!");
botController.setBotIsLoggedIn(true);
// (floating mode only)
botController.openChat();
botController.closeChat();
botController.toggleChat();
// Cleanup
botController.destroy();
```

#### JavaScript API Configuration

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `target` | HTMLElement | - | **Required**: DOM element to render into |
| `apiKey` | string | `"demo-key"` | API key for authentication |
| `defaultOpen` | boolean | `false` | Initial chat window state |
| `embedded` | boolean | `false` | Floating or embedded mode |
| `isLoggedIn` | boolean | `false` | User login state |
| `loginUrl` | string | `"/login"` | Login redirect URL |
| `ringEffect` | boolean | `true` | Phone ring animation on tooltip |
| `welcome` | string | - | Welcome message |

> **More Examples**: See `index.html` in this repository for examples including login state management, embedded mode, and programmatic control. Run the react app to see the same in a react context.

### CSS Custom Properties (Theming)

Customize the appearance by setting CSS custom properties on the container:

```html
<div id="qa-bot" style="
    --primary-color: #007bff;
    --secondary-color: #6c757d;
    --font-family: 'Arial', sans-serif;
"></div>
```