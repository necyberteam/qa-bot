/* global qaBot */
let bot1Controller, bot2Controller;

function setAuthCookie(exists) {
    if (exists) {
        // Set cookie with inert value, expires in 1 day
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 1);
        document.cookie = `SESSaccesscisso=cookie123; expires=${expirationDate.toUTCString()}; path=/`;
    } else {
        // Delete cookie by setting expiration to past date
        document.cookie = 'SESSaccesscisso=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
    }
}

function isUserLoggedIn() {
    return document.cookie.split(';').some(cookie => {
        return cookie.trim().startsWith('SESSaccesscisso=');
    });
}

function getUserInfo() {
    return {
        email: document.getElementById('user-email').value || undefined,
        name: document.getElementById('user-name').value || undefined,
        accessId: document.getElementById('accessId').value || undefined
    };
}

function initializeQABot() {
    const qaBotElement = document.getElementById('qa-bot');
    if (qaBotElement && qaBot && !qaBotElement.hasChildNodes()) {
        const userInfo = getUserInfo();
        bot1Controller = qaBot({
            target: qaBotElement,
            isLoggedIn: isUserLoggedIn(),
            defaultOpen: false,
            userEmail: userInfo.email,
            userName: userInfo.name,
            accessId: userInfo.accessId
        });
    }
}

function initializeEmbeddedBot() {
    const customBot = document.getElementById('custom-qa-bot');
    if (qaBot && customBot && !customBot.hasChildNodes()) {
        const userInfo = getUserInfo();
        bot2Controller = qaBot({
            target: customBot,
            embedded: true,
            welcome: "This is an embedded bot created programmatically!",
            isLoggedIn: isUserLoggedIn(),
            userEmail: userInfo.email,
            userName: userInfo.name,
            accessId: userInfo.accessId
        });
    } else if (!qaBot) {
        console.error("qaBot not found. Make sure the standalone JS file is loaded properly.");
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
        loginCheckbox.checked = isUserLoggedIn();

        loginCheckbox.addEventListener('change', (e) => {
            setAuthCookie(e.target.checked);
            updateBotLoginStatus(e.target.checked);
        });
    }
}

function recreateBots() {
    // Destroy existing bots
    if (bot1Controller) {
        bot1Controller.destroy();
        bot1Controller = null;
    }
    if (bot2Controller) {
        bot2Controller.destroy();
        bot2Controller = null;
    }
    
    // Clear containers
    document.getElementById('qa-bot').innerHTML = '';
    document.getElementById('custom-qa-bot').innerHTML = '';
    
    // Recreate with new user info
    initializeQABot();
    initializeEmbeddedBot();
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

    document.getElementById('update-bot').addEventListener('click', () => {
        recreateBots();
    });
}

window.addEventListener('load', function() {
    initializeQABot();
    initializeEmbeddedBot();
    setupLoginCheckbox();
    setupDemoButtons();
});
