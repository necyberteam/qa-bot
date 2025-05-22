// src/web-component.js
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import QABot from './components/QABot';
import './styles/index.css'; // Import all styles

// Create a Web Component wrapper for the React component
class AccessQABot extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    // Create a container for the React component
    this.container = document.createElement('div');
    this.container.className = 'qa-bot-container';
    this.shadowRoot.appendChild(this.container);

    // Internal refs
    this._root = null;
    this._qaRef = React.createRef();

    // Copy over CSS from main document to ensure all styles are available
    this.injectStyles();
  }

  // Public API methods for controlling the bot
  setLoggedIn(status) {
    if (this._qaRef.current) {
      this._qaRef.current.setLoggedIn(status);
    } else {
      // If not rendered yet, set attribute for when it renders
      if (status) {
        this.setAttribute('is-logged-in', '');
      } else {
        this.removeAttribute('is-logged-in');
      }
    }
  }

  open() {
    if (this._qaRef.current) {
      this._qaRef.current.open();
    }
  }

  close() {
    if (this._qaRef.current) {
      this._qaRef.current.close();
    }
  }

  toggle() {
    if (this._qaRef.current) {
      this._qaRef.current.toggle();
    }
  }

  setDisabled(status) {
    if (this._qaRef.current) {
      this._qaRef.current.setDisabled(status);
    } else {
      if (status) {
        this.setAttribute('disabled', '');
      } else {
        this.removeAttribute('disabled');
      }
    }
  }

  setVisible(status) {
    if (this._qaRef.current) {
      this._qaRef.current.setVisible(status);
    } else {
      // Element-level visibility
      this.style.display = status ? '' : 'none';
    }
  }

  // Inject CSS from document to shadow DOM to maintain consistent styling
  injectStyles() {
    // Add base styles for proper element display
    const baseStyle = document.createElement('style');
    baseStyle.textContent = `
      :host {
        display: block;
        --primary-color: #1a5b6e;
        --secondary-color: #107180;
        --font-family: Arial, sans-serif;
      }

      .qa-bot-container {
        width: 100%;
        height: 100%;
        font-family: var(--font-family);
      }
    `;
    this.shadowRoot.appendChild(baseStyle);

    // Import essential styles needed for react-chatbotify
    // This ensures the web component looks identical to the React version
    const chatbotStyles = document.createElement('style');
    chatbotStyles.textContent = `
      /* Essential styles from react-chatbotify */
      .rcb-header-avatar {
        width: 24px !important;
        height: 24px !important;
        margin-right: 8px !important;
      }

      .rcb-chat-button {
        background-color: var(--primary-color) !important;
      }

      /* Ensure proper z-index for floating button */
      .rcb-floating-button {
        z-index: 1000 !important;
      }

      /* Make links in footer readable */
      .rcb-chat-footer a {
        color: var(--primary-color) !important;
      }

      /* Fix button styling */
      .rcb-send-button {
        background-color: var(--primary-color) !important;
      }
    `;
    this.shadowRoot.appendChild(chatbotStyles);

    // Import all styles from the document in case they're needed
    if (document.styleSheets) {
      try {
        const styleSheet = document.createElement('style');
        let cssText = '';

        // Collect CSS rules from document stylesheets
        for (let i = 0; i < document.styleSheets.length; i++) {
          try {
            const sheet = document.styleSheets[i];

            // Skip external stylesheets which can't be accessed due to CORS
            if (sheet.href && !sheet.href.startsWith(window.location.origin)) continue;

            const rules = sheet.cssRules || sheet.rules;
            if (!rules) continue;

            for (let j = 0; j < rules.length; j++) {
              // Include rules for chatbot, embedded chat, and related classes
              if (rules[j].selectorText &&
                  (rules[j].selectorText.includes('.rcb-') ||
                   rules[j].selectorText.includes('.access-qa-bot') ||
                   rules[j].selectorText.includes('.qa-bot-container'))) {
                cssText += rules[j].cssText + '\n';
              }
            }
          } catch (e) {
            // Skip inaccessible stylesheets
            continue;
          }
        }

        if (cssText) {
          styleSheet.textContent = cssText;
          this.shadowRoot.appendChild(styleSheet);
        }
      } catch (e) {
        console.warn('Failed to copy document styles to shadow DOM', e);
      }
    }
  }

  // Observe these attributes for changes
  static get observedAttributes() {
    return [
      'api-key',
      'default-open',
      'disabled',
      'embedded',
      'is-logged-in',
      'login-url',
      'prompt',
      'welcome'
    ];
  }

  // React to attribute changes
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this._render();
    }
  }

  // Convert attributes to props
  _getProps() {
    return {
      apiKey: this.getAttribute('api-key') || 'demo-key',
      defaultOpen: this.hasAttribute('default-open'),
      disabled: this.hasAttribute('disabled'),
      embedded: this.hasAttribute('embedded'),
      isLoggedIn: this.hasAttribute('is-logged-in'),
      loginUrl: this.getAttribute('login-url'),
      onClose: () => {
        this.dispatchEvent(new CustomEvent('qabot-close'));
      },
      prompt: this.getAttribute('prompt'),
      welcome: this.getAttribute('welcome')
    };
  }

  // Lifecycle methods
  connectedCallback() {
    // Add support for CSS custom properties from parent
    this.syncStyles();
    this._render();

    // Set up a MutationObserver to watch for style attribute changes
    this.styleObserver = new MutationObserver(() => this.syncStyles());
    this.styleObserver.observe(this, {
      attributes: true,
      attributeFilter: ['style']
    });
  }

  disconnectedCallback() {
    if (this.styleObserver) {
      this.styleObserver.disconnect();
    }

    if (this._root) {
      this._root.unmount();
    }
  }

  // Sync styles from host element to shadow DOM
  syncStyles() {
    if (this.style.cssText) {
      const styleProps = this.style.cssText.split(';')
        .filter(prop => prop.trim().startsWith('--'))
        .map(prop => prop.trim());

      if (styleProps.length > 0) {
        const containerStyle = this.container.style;
        styleProps.forEach(prop => {
          const [name, value] = prop.split(':').map(p => p.trim());
          containerStyle.setProperty(name, value);
        });
      }
    }
  }

  // Render the React component
  _render() {
    if (!this._root) {
      this._root = ReactDOM.createRoot(this.container);
    }

    const props = this._getProps();
    this._root.render(
      <React.StrictMode>
        <QABot ref={this._qaRef} {...props} />
      </React.StrictMode>
    );
  }
}

// Define the custom element
customElements.define('access-qa-bot', AccessQABot);

// Export the web component reference
export const WebComponentQABot = AccessQABot;

// Create a function-based API for programmatic initialization
export function webComponentQAndATool(config) {
  const { target, ...props } = config;

  if (!target || !(target instanceof HTMLElement)) {
    console.error('QA Bot: A valid target DOM element is required');
    return;
  }

  // Create a new QA bot web component instance
  const qaBot = document.createElement('access-qa-bot');

  // Set attributes based on props
  if (props.apiKey) qaBot.setAttribute('api-key', props.apiKey);
  if (props.defaultOpen) qaBot.setAttribute('default-open', '');
  if (props.disabled) qaBot.setAttribute('disabled', '');
  if (props.embedded) qaBot.setAttribute('embedded', '');
  if (props.isLoggedIn) qaBot.setAttribute('is-logged-in', '');
  if (props.loginUrl) qaBot.setAttribute('login-url', props.loginUrl);
  if (props.prompt) qaBot.setAttribute('prompt', props.prompt);
  if (props.welcome) qaBot.setAttribute('welcome', props.welcome);

  // Set CSS custom properties if provided
  if (props.primaryColor) {
    qaBot.style.setProperty('--primary-color', props.primaryColor);
  }

  if (props.secondaryColor) {
    qaBot.style.setProperty('--secondary-color', props.secondaryColor);
  }

  if (props.fontFamily) {
    qaBot.style.setProperty('--font-family', props.fontFamily);
  }

  // Append to target
  target.appendChild(qaBot);

  // Return controller object
  return {
    // Access the bot's methods
    setLoggedIn: (status) => qaBot.setLoggedIn(status),
    open: () => qaBot.open(),
    close: () => qaBot.close(),
    toggle: () => qaBot.toggle(),
    setDisabled: (status) => qaBot.setDisabled(status),
    setVisible: (status) => qaBot.setVisible(status),
    // Cleanup function (backward compatibility)
    destroy: () => {
      target.removeChild(qaBot);
    }
  };
}

// For standalone UMD build, expose the API globally
if (typeof window !== 'undefined') {
  // Provide a global process.env for the standalone build
  window.process = { env: { REACT_APP_API_KEY: 'demo-key' } };

  window.accessQABot = {
    WebComponentQABot,
    qAndATool: webComponentQAndATool
  };
}