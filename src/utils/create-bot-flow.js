import React from 'react';
import LoginButton from '../components/LoginButton';
import { buildWelcomeMessage } from '../config/constants';
import { createMainMenuFlow } from './flows/main-menu-flow';
import { createQAFlow } from './flows/qa-flow';
import { createTicketFlow } from './flows/ticket-flow';
import { createFeedbackFlow } from './flows/feedback-flow';
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
  feedbackForm = {},
  setFeedbackForm = () => {},
  formContext,
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
    setFeedbackForm
  });

  // Create Q&A flow (requires login)
  const qaFlow = isBotLoggedIn 
    ? createQAFlow({
        fetchAndStreamResponse: handleQuery,
        sessionId,
        currentQueryId
      })
    : {
        go_ahead_and_ask: {
          message: "To ask questions, you need to log in first.",
          component: <LoginButton loginUrl={loginUrl} />,
          options: ["Back to Main Menu"],
          chatDisabled: true,
          path: (chatState) => {
            if (chatState.userInput === "Back to Main Menu") {
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

  const feedbackFlow = createFeedbackFlow({
    feedbackForm,
    setFeedbackForm,
    userInfo
  });

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
    ...(feedbackFlow || {}),
    ...(securityFlow || {}),
    // Add fallback loop for errors (only if logged in)
    ...(isBotLoggedIn && {
      loop: {
        message: async (params) => {
          await handleQuery(params);
        },
        path: () => hasQueryError ? 'start' : 'loop'
      }
    })
  };

  return flow;
}

export { createBotFlow };
