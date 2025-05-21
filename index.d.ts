interface QABotProps {
  apiKey?: string;
  defaultOpen?: boolean;
  disabled?: boolean;
  embedded?: boolean;
  isLoggedIn?: boolean;
  loginUrl?: string;
  onClose?: () => void;
  prompt?: string;
  visible?: boolean;
  welcome?: string;
  [key: string]: any; // Allow additional props
}

// React component
export const QABot: React.ForwardRefExoticComponent<
  QABotProps & React.RefAttributes<unknown>
>;

// Web Component class (available in the standalone build)
export class WebComponentQABot extends HTMLElement {
  static observedAttributes: string[];
  attributeChangedCallback(name: string, oldValue: string, newValue: string): void;
  connectedCallback(): void;
  disconnectedCallback(): void;
}

// Function for non-React integration
interface QAndAToolConfig extends QABotProps {
  target: HTMLElement;
}

// Main function for programmatic usage (works with React or Web Component)
export function qAndATool(config: QAndAToolConfig): () => void;

// Web Component specific function (exposed in the standalone bundle)
export function webComponentQAndATool(config: QAndAToolConfig): () => void;

// Default export (React component)
export default QABot;

// Augment the HTMLElementTagNameMap to include our custom element
declare global {
  interface HTMLElementTagNameMap {
    'access-qa-bot': WebComponentQABot;
  }

  // Global object for standalone usage
  interface Window {
    accessQABot?: {
      WebComponentQABot: typeof WebComponentQABot;
      qAndATool: typeof webComponentQAndATool;
    }
  }
}
