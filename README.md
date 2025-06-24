# ACCESS Q&A Bot

A React component for integrating the ACCESS Q&A Bot into your application. Features intelligent Q&A responses, support ticket creation with ProForma integration, and user feedback collection. Also includes a standalone bundle for plain HTML/JS usage.

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

## Features

- **🤖 Intelligent Q&A**: AI-powered responses to user questions about ACCESS
- **🎫 Support Tickets**: Create help tickets for general support, ACCESS login issues, and resource provider login problems
- **📝 Feedback Collection**: Gather user feedback and suggestions  
- **👤 User Pre-population**: Auto-fill forms with user info when logged in
- **🎨 Rich Formatting**: Support for HTML and Markdown in responses
- **♿ Accessibility**: Full screen reader support and keyboard navigation
- **📱 Responsive**: Works on desktop and mobile devices

### Display Modes

The Q&A Bot supports two display modes:

- **Floating Mode** (default): Shows a chat button that opens/closes a floating chat window
- **Embedded Mode**: Always visible, embedded directly in the page content

## Available Flows

The bot supports several conversation flows:

### 🤖 Q&A Flow
- Ask questions about ACCESS resources, services, and documentation
- Receive AI-powered responses with HTML and Markdown formatting
- Built-in feedback system with thumbs up/down options after each response
- Automatic feedback tracking and analytics
- Users can provide feedback or continue asking questions immediately
- Negative feedback offers direct path to support ticket creation
- Requires user to be logged in

### 🎫 Support Ticket Flows
- **General Help**: Create support tickets for any ACCESS-related issues
- **ACCESS Login**: Get help with ACCESS website login problems  
- **Resource Login**: Get help with resource provider login issues
- All flows support file attachments and are integrated with JSM ProForma

### 📝 Feedback Flow
- Collect user feedback and suggestions
- Optional file attachments for screenshots or documents

### 🔒 Security Incident Flow
- Report security issues, vulnerabilities, and incidents
- Dedicated priority levels: Critical, High, Medium, Low
- Direct routing to ACCESS cybersecurity team (Service Desk ID: 3)
- Support for file attachments (screenshots, logs, evidence)
- Professional incident tracking with ticket reference links
- User contact information pre-population when logged in

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
| `ringEffect` | boolean | `false` | Phone ring animation on tooltip |
| `welcome` | string | - | Welcome message |
| `userEmail` | string | - | User's email (pre-populates ticket forms when logged in) |
| `userName` | string | - | User's display name (pre-populates ticket forms when logged in) |
| `username` | string | - | User's username/ACCESS ID (pre-populates ticket forms when logged in) |

### Standalone Javascript

```html
<script src="https://unpkg.com/@snf/access-qa-bot@2.x/dist/access-qa-bot.standalone.js"></script>

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
| `ringEffect` | boolean | `false` | Phone ring animation on tooltip |
| `welcome` | string | - | Welcome message |
| `userEmail` | string | - | User's email (pre-populates ticket forms when logged in) |
| `userName` | string | - | User's display name (pre-populates ticket forms when logged in) |
| `username` | string | - | User's username/ACCESS ID (pre-populates ticket forms when logged in) |

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

## Configuration

### Environment Variables

For React applications, you can set these environment variables:

```bash
REACT_APP_API_KEY=your-api-key-here
```

### API Integration

The bot integrates with the ACCESS Q&A API and JSM (Jira Service Management) for ticket creation. Configure your backend endpoints to handle:

- Q&A queries with streaming responses
- Support ticket creation with ProForma field mapping
- File upload processing
- User authentication and session management

## Changelog

### Version 2.3.0

#### ✨ New Features
- **Security Incident Reporting**: Complete security incident reporting flow for cybersecurity team
- **Dedicated Security Routing**: Direct integration with ACCESS cybersecurity team (Service Desk ID: 3)
- **Professional Security Flow**: Priority levels, detailed incident tracking, and file attachments
- **Enhanced API Integration**: Expanded API endpoints for security incident submission

#### 🔧 Security & Infrastructure
- **Robust Error Handling**: Comprehensive null checks and error handling across all flows
- **Security Portal Integration**: Proper routing to dedicated security service desk
- **File Upload Support**: Attachment support for security evidence and documentation

### Version 2.2.0

#### ✨ New Features
- **Integrated Feedback System**: Added thumbs up/down feedback collection after each Q&A response
- **Seamless User Experience**: Users can provide feedback or continue asking questions without interruption
- **Smart Flow Routing**: Negative feedback automatically offers direct path to support ticket creation
- **Feedback Analytics**: Automatic tracking of user satisfaction with API endpoint integration
- **Responsive Design**: Optimized feedback UI with hover effects and accessibility features

#### 🎨 UI/UX Improvements
- Streamlined Q&A conversation flow with optional feedback prompts
- Enhanced button styling with smooth animations and brand color consistency
- Improved input field placeholder text for better user guidance
- Fixed horizontal scroll bar issues in user message bubbles

### Version 2.1.0

#### ✨ New Features
- **Form Context System**: Implemented React Context to solve closure issues and ensure fresh form state
- **User Info Pre-population**: Added support for pre-filling ticket forms with user email, name, and username when logged in
- **HTML & Markdown Rendering**: Added support for rich text formatting in Q&A responses
- **Enhanced Ticket Flows**: Improved all support ticket flows with better user experience

#### 🐛 Bug Fixes
- Fixed React closure issues causing stale form data in ticket summaries
- Resolved priority and ACCESS ID display issues in ticket forms
- Fixed form state management across all ticket flows

#### 🎨 UI/UX Improvements
- Updated button text: "Create XXX Ticket" → "Yes, let's create a ticket"
- Changed "New Chat" button to "Restart" for clarity
- Improved accessibility with better ARIA labels
- Enhanced responsive design for mobile devices

#### 🔧 Technical Improvements
- Removed unused helper functions (`getCurrentPriority`, `getCurrentAccessId`)
- Cleaned up debug console statements for production
- Added markdown renderer plugin alongside HTML renderer
- Improved build configuration and excluded build directory from version control

#### 📚 Documentation
- Updated README with comprehensive feature list and integration examples
- Added detailed API documentation and configuration options
- Included changelog for version tracking