// src/web-component.js
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import QABot from './components/QABot';

// Create a Web Component wrapper for the React component
class AccessQABot extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    // Create a container for the React component
    this.container = document.createElement('div');
    this.container.className = 'qa-bot-container';
    this.shadowRoot.appendChild(this.container);

    // Copy over CSS from main document to ensure all styles are available
    this.injectStyles();
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

      .rcb-chat-header {
        background-color: var(--primary-color) !important;
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
              // Only include rules targeting rcb- prefixed classes (react-chatbotify)
              if (rules[j].selectorText &&
                  (rules[j].selectorText.includes('.rcb-') ||
                   rules[j].selectorText.includes('.access-qa-bot'))) {
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
      'welcome',
      'prompt',
      'embedded',
      'is-logged-in',
      'disabled',
      'is-open',
      'api-key'
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
      welcome: this.getAttribute('welcome'),
      prompt: this.getAttribute('prompt'),
      embedded: this.hasAttribute('embedded'),
      isLoggedIn: this.hasAttribute('is-logged-in'),
      disabled: this.hasAttribute('disabled'),
      isOpen: this.hasAttribute('is-open'),
      // Always provide an apiKey to prevent process.env reference errors
      apiKey: this.getAttribute('api-key') || 'demo-key',
      onClose: () => {
        // Dispatch custom event when closed
        this.dispatchEvent(new CustomEvent('qabot-close'));
      }
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

    if (this.root) {
      this.root.unmount();
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
    if (!this.root) {
      this.root = ReactDOM.createRoot(this.container);
    }

    const props = this._getProps();
    this.root.render(
      <React.StrictMode>
        <QABot {...props} />
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

  // Create and configure the element
  const qaBot = document.createElement('access-qa-bot');

  // Set attributes based on props
  if (props.welcome) qaBot.setAttribute('welcome', props.welcome);
  if (props.prompt) qaBot.setAttribute('prompt', props.prompt);
  if (props.embedded) qaBot.setAttribute('embedded', '');
  if (props.isLoggedIn) qaBot.setAttribute('is-logged-in', '');
  if (props.disabled) qaBot.setAttribute('disabled', '');
  if (props.isOpen) qaBot.setAttribute('is-open', '');
  if (props.apiKey) qaBot.setAttribute('api-key', props.apiKey);

  // Set CSS custom properties if provided
  if (props.styles) {
    Object.entries(props.styles).forEach(([prop, value]) => {
      if (prop.startsWith('--')) {
        qaBot.style.setProperty(prop, value);
      }
    });
  }

  // Add event listener for close if provided
  if (props.onClose) {
    qaBot.addEventListener('qabot-close', props.onClose);
  }

  // Append to target
  target.appendChild(qaBot);

  // Return cleanup function
  return () => {
    target.removeChild(qaBot);
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