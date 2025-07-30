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
  /** User's email address (when logged in) */
  userEmail?: string;
  /** User's display name (when logged in) */
  userName?: string;
  /** User's ACCESS ID (when logged in) */
  accessId?: string;
  [key: string]: any; // Allow additional props
}

// Note: The React component uses controlled mode - manage state in your parent component:
//
// const [isOpen, setIsOpen] = useState(false);
// const [userLoggedIn, setUserLoggedIn] = useState(false);
// <QABot open={isOpen} onOpenChange={setIsOpen} isLoggedIn={userLoggedIn} />
//
// To send messages programmatically, use the ref:
// const botRef = useRef();
// botRef.current?.addMessage("Hello World!");

// React component
export const QABot: React.ForwardRefExoticComponent<
  QABotProps & React.RefAttributes<{
    addMessage: (message: string) => void;
  }>
>;

// Function for non-React integration (now React-backed for everything)
interface QABotConfig extends QABotProps {
  target: HTMLElement;
}

// Main function for programmatic usage (now React-backed for all usage)
export function qaBot(config: QABotConfig): {
  addMessage: (message: string) => void;
  setBotIsLoggedIn: (status: boolean) => void;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  destroy: () => void;
};

// Default export (React component)
export default QABot;
