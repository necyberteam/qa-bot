import React from 'react';
import LoginButton from '../components/LoginButton';
import { buildWelcomeMessage } from '../config/constants';
import { createMainMenuFlow } from './flows/main-menu-flow';
import { createQAFlow } from './flows/qa-flow';
import { createTicketFlow } from './flows/ticket-flow';
import { createFeedbackFlow } from './flows/feedback-flow';
import { createDevTicketFlow } from './flows/dev-ticket-flow';

function createBotFlow({
  welcomeMessage,
  isBotLoggedIn,
  loginUrl,
  handleQuery,
  hasQueryError,
  ticketForm = {},
  setTicketForm = () => {},
  feedbackForm = {},
  setFeedbackForm = () => {}
}) {
  // If not logged in, show simple login flow
  if (!isBotLoggedIn) {
    return {
      start: {
        message: buildWelcomeMessage(isBotLoggedIn, welcomeMessage),
        component: <LoginButton loginUrl={loginUrl} />,
        path: 'start'
      }
    };
  }

  // If logged in, create the full complex flow
  const mainMenuFlow = createMainMenuFlow({
    welcome: buildWelcomeMessage(isBotLoggedIn, welcomeMessage),
    setTicketForm,
    setFeedbackForm
  });

  const qaFlow = createQAFlow({
    fetchAndStreamResponse: handleQuery // Adapting the old name to new function
  });

  const ticketFlow = createTicketFlow({
    ticketForm,
    setTicketForm
  });

  const feedbackFlow = createFeedbackFlow({
    feedbackForm,
    setFeedbackForm
  });

  const devTicketFlow = createDevTicketFlow({
    ticketForm,
    setTicketForm
  });

  // Combine all flows
  const flow = {
    ...mainMenuFlow,
    ...qaFlow,
    ...ticketFlow,
    ...feedbackFlow,
    ...devTicketFlow,
    // Add fallback loop for errors
    loop: {
      message: async (params) => {
        await handleQuery(params);
      },
      path: () => hasQueryError ? 'start' : 'loop'
    }
  };

  return flow;
}

export { createBotFlow };
