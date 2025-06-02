interface QABotProps {
  apiKey?: string;
  /** Whether the chat window is open (floating mode only, ignored for embedded) */
  open?: boolean;
  /** Callback when chat window open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Whether the bot is embedded in the page (always open when embedded) */
  embedded?: boolean;
  isLoggedIn?: boolean;
  loginUrl?: string;
  welcome?: string;
  [key: string]: any; // Allow additional props
}

// Note: The React component uses controlled mode - manage state in your parent component:
//
// const [isOpen, setIsOpen] = useState(false);
// <QABot open={isOpen} onOpenChange={setIsOpen} />
//
// To control the chat window via imperative methods, use the ref:
// const botRef = useRef();
// botRef.current?.openChat();

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
