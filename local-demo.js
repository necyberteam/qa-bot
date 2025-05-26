/* global accessQABot */
window.mockUserLoggedIn = false;
let bot1Controller, bot2Controller;

function initializeQABot() {
    const qaBot = document.getElementById('qa-bot');
    if (qaBot && accessQABot && !qaBot.hasChildNodes()) {
        bot1Controller = accessQABot({
            target: qaBot,
            isLoggedIn: window.mockUserLoggedIn,
            defaultOpen: false
        });
    }
}

function initializeEmbeddedBot() {
    const customBot = document.getElementById('custom-qa-bot');
    if (accessQABot && customBot && !customBot.hasChildNodes()) {
        bot2Controller = accessQABot({
            target: customBot,
            embedded: true,
            welcome: "This is an embedded bot created programmatically!",
            prompt: "Ask me about ACCESS...",
            isLoggedIn: window.mockUserLoggedIn
        });
    } else if (!accessQABot) {
        console.error("accessQABot not found. Make sure the standalone JS file is loaded properly.");
    }
}

function updateBotLoginStatus(isLoggedIn) {
    if (bot1Controller) {
        bot1Controller.setBotIsLoggedIn(isLoggedIn);
    }
    if (bot2Controller) {
        bot2Controller.setBotIsLoggedIn(isLoggedIn);
    }
}

function setupLoginCheckbox() {
    const loginCheckbox = document.getElementById('user-logged-in');
    if (loginCheckbox) {
        loginCheckbox.addEventListener('change', (e) => {
            window.mockUserLoggedIn = e.target.checked;
            updateBotLoginStatus(window.mockUserLoggedIn);
            console.log('| user logged in:', window.mockUserLoggedIn);
        });
    }
}

function setupDemoButtons() {
    document.getElementById('bot1-send').addEventListener('click', () => {
        bot1Controller.addMessage("Hello World!");
    });

    document.getElementById('bot1-open').addEventListener('click', () => {
        bot1Controller.openChat();
    });

    document.getElementById('bot1-close').addEventListener('click', () => {
        bot1Controller.closeChat();
    });

    document.getElementById('bot1-toggle').addEventListener('click', () => {
        bot1Controller.toggleChat();
    });

    document.getElementById('bot2-send').addEventListener('click', () => {
        bot2Controller.addMessage("Hello World!");
    });
}

window.addEventListener('load', function() {
    initializeQABot();
    initializeEmbeddedBot();
    setupLoginCheckbox();
    setupDemoButtons();
});
