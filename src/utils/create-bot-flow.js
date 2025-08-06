import { buildWelcomeMessage } from '../config/constants';
import { createMainMenuFlow } from './flows/main-menu-flow';
import { createQAFlow } from './flows/qa-flow';
import { createTicketFlow } from './flows/ticket-flow';
// import { createFeedbackFlow } from './flows/feedback-flow';
import { createSecurityFlow } from './flows/security-flow';
import { setCurrentFormContext } from './flow-context-utils';

function createBotFlow({
  welcomeMessage,
  isBotLoggedIn,
  loginUrl,
  handleQuery,
  hasQueryError,
  sessionId,
  currentQueryId,
  ticketForm = {},
  setTicketForm = () => {},
  // feedbackForm = {},
  // setFeedbackForm = () => {},
  formContext,
  apiKey,
  userInfo = {}
}) {
  // Set the current form context for use in flow functions
  if (formContext) {
    setCurrentFormContext(formContext);
  }
  // Always create the main menu flow (available to everyone)
  const mainMenuFlow = createMainMenuFlow({
    welcome: buildWelcomeMessage(true, welcomeMessage), // Always use logged-in style welcome
    setTicketForm,
    // setFeedbackForm
  });

  // Create Q&A flow (requires login)
  const qaFlow = isBotLoggedIn
    ? createQAFlow({
        fetchAndStreamResponse: handleQuery,
        sessionId,
        currentQueryId,
        apiKey
      })
    : {
        go_ahead_and_ask: {
          message: `To ask questions, you need to log in first.

<a href="${loginUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 10px 20px; background-color: white; border: 1px solid #107180; color: #107180; text-decoration: none; border-radius: 4px; font-weight: bold; margin: 10px 0; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);">Log In</a>

After logging in, you can ask your question or return to the main menu.`,
          options: ["Back to Main Menu", "I'm Logged In Now"],
          chatDisabled: true,
          path: (chatState) => {
            if (chatState.userInput === "Back to Main Menu") {
              return "start";
            }
            if (chatState.userInput === "I'm Logged In Now") {
              // Re-check login status by returning to start flow
              return "start";
            }
            return "go_ahead_and_ask";
          }
        }
      };

  // Create ticket and feedback flows (available to everyone)
  const ticketFlow = createTicketFlow({
    ticketForm,
    setTicketForm,
    userInfo
  });

  // TODO: Add feedback flow back in
  // const feedbackFlow = createFeedbackFlow({
  //   feedbackForm,
  //   setFeedbackForm,
  //   userInfo
  // });

  const securityFlow = createSecurityFlow({
    ticketForm,
    setTicketForm,
    userInfo
  });

  // Combine all flows with null safety
  const flow = {
    ...(mainMenuFlow || {}),
    ...(qaFlow || {}),
    ...(ticketFlow || {}),
    //...(feedbackFlow || {}), // TODO: add feedback flow back in
    ...(securityFlow || {}),
    // Add fallback loop for errors (only if logged in)
    ...(isBotLoggedIn && {
      loop: {
        message: async (params) => {
          await handleQuery(params);
        },
        renderMarkdown: ["BOT"],
        path: () => hasQueryError ? 'start' : 'loop'
      }
    })
  };

  return flow;
}

export { createBotFlow };
