interface QABotProps {
  apiKey?: string;
  /** Whether the chat window is open by default (floating mode only, ignored for embedded) */
  defaultOpen?: boolean;
  /** Whether the bot is embedded in the page (always open when embedded) */
  embedded?: boolean;
  isLoggedIn?: boolean;
  loginUrl?: string;
  welcome?: string;
  [key: string]: any; // Allow additional props
}

// Note: To control the chat window externally, use the useChatWindow hook from react-chatbotify:
// import { useChatWindow } from 'react-chatbotify';
// const { toggleChatWindow } = useChatWindow();

// React component
export const QABot: React.ForwardRefExoticComponent<
  QABotProps & React.RefAttributes<{
    addMessage: (message: string) => void;
    setBotIsLoggedIn: (status: boolean) => void;
    openChat: () => void;
    closeChat: () => void;
    toggleChat: () => void;
  }>
>;

// Web Component class (available in the standalone build)
export class WebComponentQABot extends HTMLElement {
  static observedAttributes: string[];
  attributeChangedCallback(name: string, oldValue: string, newValue: string): void;
  connectedCallback(): void;
  disconnectedCallback(): void;
}

// Function for non-React integration
interface QABotConfig extends QABotProps {
  target: HTMLElement;
}

// Main function for programmatic usage (works with React or Web Component)
export function qaBot(config: QABotConfig): {
  addMessage: (message: string) => void;
  setBotIsLoggedIn: (status: boolean) => void;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  destroy: () => void;
};

// Web Component specific function (exposed in the standalone bundle)
export function webComponentQABot(config: QABotConfig): () => void;

// Default export (React component)
export default QABot;

// Augment the HTMLElementTagNameMap to include our custom element
declare global {
  interface HTMLElementTagNameMap {
    'qa-bot': WebComponentQABot;
  }

  // Global object for standalone usage
  interface Window {
    qaBot?: typeof webComponentQABot;
  }

  // Global function available without window prefix
  var qaBot: typeof webComponentQABot;
}
