# Changelog

## [Unreleased]

### Added
- HTML rendering support for clickable ticket links in success messages
- ProForma form field mapping for JSM integration
- Comprehensive email validation with user-friendly error messages for all forms
- Keyboard navigation hints for checkbox selections
- Email validation using InputValidator plugin with toast notifications and input highlighting

### Changed
- Update to react-chatbotify v2.1.0
- Cleaned up development flow, comments, and debug logging
- **Feedback Flow Reordering**: File upload question now appears before role question for better UX
- **Community Interest Targeting**: Community involvement question now only shown to users who provide contact information
- **Anonymous Feedback Improvements**: Community interest field hidden from summary for anonymous submissions
- **Focus Management**: Fixed keyboard focus jumping to previous questions; now properly targets current question only

### Fixed
- Resolved form state persistence issues where previous session data would interfere with new submissions
- Fixed multiple checkbox selection display in feedback summary (was showing only one selection)
- Corrected timing issues with form context updates using chatState.userInput pattern
- Fixed anonymous feedback showing previous contact information in summary
- Improved keyboard accessibility for checkboxes with proper focus management

## [2.0.0-rc.1] - 2025-05-28

### BREAKING CHANGES
- **JavaScript API**: Function name changed from `accessQABot()` to `qaBot()`
- **Web Component**: Element name changed from `<access-qa-bot>` to `<qa-bot>`
- **CSS Classes**:
  - `.access-qa-bot` → `.qa-bot`
  - `.access-login-button` → `.qa-bot-login-button`
- **TypeScript**: Interface renamed from `AccessQABotConfig` to `QABotConfig`
- **TypeScript**: Global function declaration changed from `accessQABot` to `qaBot`

### Added
- New streamlined API with shorter, cleaner naming conventions
- Refer to README for complete list of available props and methods

### Note
- Package name (`@snf/access-qa-bot`) and script filename (`access-qa-bot.standalone.js`) remain unchanged
- All API endpoints continue to use "access" in their paths

## [1.0.0-beta.1] - 2025-04-17

## [0.3.1] - 2024-04-25

### Fixed
- CSS fix - top bar

## [0.3.0] - 2024-04-23

### Changed
- Upgrade to react-chatbotify v2

## [0.2.0] - 2024-04-23

### Added
- Web component implementation
- npm packaging support
- Library setup

## [0.1.3] - 2024-02-25

### Changed
- Move authentication check outside of app

## [0.1.2] - 2024-02-25

### Changed
- Move authentication check out of app

## [0.1.1] - 2024-01-17

### Added
- Add build to repository
- Remove hashes from build artifacts

## [0.1.0] - 2023-10-09

### Added
- Initial release
- Add link to feedback form