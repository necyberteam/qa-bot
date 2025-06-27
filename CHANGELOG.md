# Changelog

## [Unreleased]

### Added
- HTML rendering support for clickable ticket links in success messages
- ProForma form field mapping for JSM integration
- Added some accessibility enhancements for ketyboard navigation and screenreaders

### Changed
- Update to react-chatbotify v2.1.0
- Cleaned up development flow, comments, and debug logging

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