interface QABotProps {
  isLoggedIn?: boolean;
  isAnonymous?: boolean;
  initiallyOpen?: boolean;
  apiKey?: string;
  embedded?: boolean;
  welcome?: string;
  prompt?: string;
  disabled?: boolean;
  onClose?: () => void;
  [key: string]: any; // Allow additional props
}

// React component
export const QABot: (props: QABotProps) => JSX.Element;

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
