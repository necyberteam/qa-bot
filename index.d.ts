interface QABotProps {
  isLoggedIn?: boolean;
  isAnonymous?: boolean;
  defaultOpen?: boolean;
  apiKey?: string;
  embedded?: boolean;
  welcome?: string;
  prompt?: string;
  disabled?: boolean;
  visible?: boolean;
  onClose?: () => void;
  [key: string]: any; // Allow additional props
}

// React component with ref
interface QABotRef {
  toggle: () => boolean;
  open: () => void;
  close: () => void;
  isOpen: () => boolean;
}

// React component
export const QABot: React.ForwardRefExoticComponent<
  QABotProps & React.RefAttributes<QABotRef>
>;

// Web Component class (available in the standalone build)
export class WebComponentQABot extends HTMLElement {
  static observedAttributes: string[];
  attributeChangedCallback(name: string, oldValue: string, newValue: string): void;
  connectedCallback(): void;
  disconnectedCallback(): void;
  toggle(): boolean;
  open(): void;
  close(): void;
  isOpen(): boolean;
}

// Function for non-React integration
interface QAndAToolConfig extends QABotProps {
  target: HTMLElement;
  returnRef?: boolean;
}

// Return type when returnRef is true
interface QABotControlMethods {
  toggle: () => boolean;
  open: () => void;
  close: () => void;
  isOpen: () => boolean;
}

// Main function for programmatic usage (works with React or Web Component)
export function qAndATool(config: QAndAToolConfig): (() => void) | QABotControlMethods;

// Web Component specific function (exposed in the standalone bundle)
export function webComponentQAndATool(config: QAndAToolConfig): (() => void) | QABotControlMethods;

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
