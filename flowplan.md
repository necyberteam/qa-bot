# ACCESS Help Bot Flow Plan

## 🏠 Main Menu

**Chatbot**:
1. `start`
   "Welcome to ACCESS Help! What can I help you with?"

**Options**:
- [ Ask a question about ACCESS ] -> `go_ahead_and_ask`
- [ Open a Help Ticket ] -> `help_ticket`
- [ Provide feedback to ACCESS ] -> `feedback`
- [ Open Dev Ticket ] -> `dev_ticket`

**Input**:
   *Please choose an option above* (🚫 no input)

## 🤖 QA Bot

**Chatbot**:
1. `go_ahead_and_ask`
   "Great! Please type your question."

**Options**:
- [ Back to Main Menu ] -> `start`

**Input**: Type your question here. All questions are stand alone and do not reference previous questions.

## 🚏 Help Home

**Chatbot**:
1. `help_ticket_related_to`
   "What is your help ticket related to?"

**Options**:
- [ Logging into ACCESS website ] -> `access_login`
- [ Logging into affiliated infrastructure ] -> `resource_login`
- [ Another question ] -> `general_help`

**Input**:
   *Please choose an option above* (🚫 no input)

## 🎫 ACCESS Login Form

**Chatbot**:
1. `email` (validated)
   "What is your email?"
2. `name`
   "What is your name?"
3. `accessid`
   "What is your ACCESS ID?"
4. `description`
   "Please describe the issue you're having logging in."
5. `identityProvider`
   "Which identity provider were you using? (e.g., InCommon, Google, ORCID)"
6. `browser`
   "Which browser were you using?"
7. `screenshot` (optional)
   "Would you like to attach a screenshot?"
8. `summary`
   "Thank you for providing your ACCESS login issue details. Here's a summary..."
   "Would you like to submit this ticket?"

**Options**:
   - [ Submit ] -> Submit Ticket -> `confirmation` -> `start`
   - [ Back to Main Menu ] -> `start`

**Input**: Enter your email address

## 🎫 Resource Login Form

**Chatbot**:
1. `email` (validated)
   "What is your email?"
2. `name`
   "What is your name?"
3. `accessid`
   "What is your ACCESS ID?"
4. `resource`
   "Which ACCESS resource are you trying to access?"
5. `userIdResource`
   "What is your user ID at the resource?"
6. `description`
   "Please describe the issue you're having logging in."
7. `screenshot` (optional)
   "Would you like to attach a screenshot?"
8. `summary`
   "Thank you for providing your resource login issue details. Here's a summary..."
   "Would you like to submit this ticket?"

**Options**:
   - [ Submit ] -> Submit Ticket -> `confirmation` -> `start`
   - [ Back to Main Menu ] -> `start`

**Input**:
  *""*

## 🎫 General Help Form

**Chatbot**:
1. `email` (validated)
   "What is your email?"
2. `name`
   "What is your name?"
3. `accessid`
   "What is your ACCESS ID?"
4. `description`
   "Please describe your issue."
5. `screenshot` (optional)
   "Would you like to attach a screenshot?"
6. `summary`
   "Thank you for providing your issue details. Here's a summary..."
   "Would you like to submit this ticket?"

**Options**:
   - [ Submit ] -> Submit Ticket -> `confirmation` -> `start`
   - [ Back to Main Menu ] -> `start`

**Input**:
  *""*

## 🎫 Feedback Form

**Chatbot**:
1. `feedback`
   "We appreciate your feedback about ACCESS."
2. `feedback_please_tell_us_more`
   "Please provide your detailed feedback."
3. `feedback_upload`
   "Would you like to upload a screenshot or file to help us better understand your feedback?"
   **Options**:
   - [ Yes ] -> `feedback_upload_yes`
   - [ No ] -> `feedback_contact`
4. `feedback_upload_yes`
   "Please upload a screenshot or file to help us better understand your feedback."
   [File Upload Component]
   **Options**:
   - [ Continue ] -> `feedback_contact`
5. `feedback_contact`
   "Would you like to provide your contact information for follow up?"
   **Options**:
   - [ Yes ] -> `feedback_name`
   - [ No ] -> `feedback_summary`
6. `feedback_name`
   "What is your name?"
7. `feedback_email`
   "What is your email address?"
8. `feedback_accessid`
   "What is your ACCESS ID?"
9. `feedback_summary`
   "Thank you for sharing your feedback!{fileInfo}"

**Options**:
   - [ Submit Feedback ] -> `confirmation` -> `start`
   - [ Back to Main Menu ] -> `start`

**Input**:
   *Please provide your feedback*

## 🚏 Dev Home

**Chatbot**:
1. `dev_ticket_type`
   "What type of development ticket would you like to create?"

**Options**:
- [ Bug Report ] -> `dev_ticket`
- [ Feature Request ] -> `dev_ticket`
- [ Other Development Issue ] -> `dev_ticket`

**Input**:
   *Please choose an option above* (🚫 no input)

## 🎫 Dev Ticket Form

**Chatbot**:
1. `email` (validated)
   "What is your email?"
2. `accessId`
   "What is your ACCESS ID?"
3. `summary`
   "Please provide a summary of your issue."
4. `description`
   "Please describe your issue in detail."
5. `files` (optional)
   "Would you like to attach file(s)?"
6. `keywords` (up to 5)
   "Please select up to 5 keywords that describe your issue. Click the 'Continue' button when done."
7. `additional_keywords` (optional)
   "Please enter additional keywords, separated by commas:"
8. `summary`
   "Thank you for providing your issue details. Here's a summary..."
   "Would you like to submit this ticket?"

**Options**:
   - [ Submit ] -> Submit Ticket -> `confirmation` -> `start`
   - [ Back to Main Menu ] -> `start`

