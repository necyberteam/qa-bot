import './App.css';
import ChatBot from "react-chatbotify";

const queryEndpoint = 'https://access-qa.ccs.uky.edu:6060/api/query';
const apiKey = process.env.REACT_APP_API_KEY;
let hasError = false;

const handleQuery = async (params) => {
  // POST question to the QA API
  try {
    const requestOptions = {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-API-KEY': apiKey
      },
      body: JSON.stringify({ query: params.userInput })
    };
    const response = await fetch(queryEndpoint, requestOptions)
    const body = await response.json();
    const text = body.response;

    for (let i = 0; i < text.length; i++) {
      await params.streamMessage(text.slice(0, i + 1));
      await new Promise(resolve => setTimeout(resolve, 2));
    }
  } catch (error) {
    await params.injectMessage("Unable to contact the Q&A Bot. Please try again later.");
    hasError = true;
  }
}

const MyChatBot = (props) => {
  let welcome = 'Hello! What can I help you with?'
  if (props.welcome !== undefined) {
    welcome = props.welcome;
  }
  let prompt = 'What would you like to know about ACCESS?'
  if (props.prompt !== undefined) {
    prompt = props.prompt;
  }
  const flow = {
    start: {
      message: welcome,
      path: 'loop'
    },
    loop: {
      message: async (params) => {
        await handleQuery(params);
      },
      path: () => {
        if (hasError) {
          return 'start'
        }
        return 'loop'
      }
    }
  
  }
  return (
    <ChatBot 
      options={{
        theme: { 
          primaryColor: '#1a5b6e',
          secondaryColor: '#107180',
          fontFamily: 'Arial, sans-serif',
          embedded: props.embedded, 
        },
        header: {
          title: 'ACCESS Q&A Bot',
          avatar: 'https://support.access-ci.org/themes/contrib/asp-theme/images/icons/ACCESS-arrrow.svg',
        },
        chatInput: {
          enabledPlaceholderText: prompt,
        },
        chatHistory: { storageKey: "qa_bot" },
        botBubble: { 
          simStream: true,
          dangerouslySetInnerHtml: true
         },
        isOpen: false,
        chatButton: {
          icon: 'https://support.access-ci.org/themes/contrib/asp-theme/images/icons/ACCESS-arrrow.svg',
        },
        tooltip: {
          text: 'Ask me about ACCESS! 😊',
        },
        audio: {
          disabled: true,
        },
        emoji: {
          disabled: true,
        },
        fileAttachment: {
          disabled: true,
        },
        notification: {
          disabled: true,
        },
        footer: {
          text: (<div>Find out more <a href="https://support.access-ci.org/tools/access-qa-tool">about this tool</a>.</div>),
        },
      }}
      flow={flow}
    />
  );
}
function App(props) {
  return (
    <div className="access-qa-bot">
      <MyChatBot embedded={props.embedded} welcome={props.welcome} prompt={props.prompt}/>
    </div>
  );
}

export default App;
