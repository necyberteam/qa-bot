# ACCESS Q&A Tool Widget

This REACT app provides an interface to the ACCESS Q&A Tool API. More information about this tool is available at https://support.access-ci.org/tools/access-qa-tool.

Interacting with the Q&A Tool requires authentication with an ACCESS ID. Currently, the app checks for the class "user-logged-in" on the <body> HTML element to determine if a visitor is authenticated. 

The Q&A Tool API requires an API Key to be sent in the HTTP Headers. This should be set with the `REACT_APP_API_KEY` environment variable. Please contact ACCESS Support if you need an API Key.

Some messages in the app can be customized if desired:
- welcome message
- prompt

See the index.html file for examples of how to add the default widget floating in the bottom right of the page and as an "embedded" widget with the tool open on the page by default.

## Deployment
You can install the app in a website:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/necyberteam/qa-bot@v0.1.0/build/static/main.css">
<div style="display:none;" id="qa-bot">
    &nbsp;
</div>
<script src="https://cdn.jsdelivr.net/gh/necyberteam/qa-bot@v0.1.1/build/static/js/main.js"></script><script src="https://cdn.jsdelivr.net/gh/necyberteam/qa-bot@v0.1.1/build/static/js/453.chunk.js"></script>
```

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.
