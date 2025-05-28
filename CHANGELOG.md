# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.0.0-rc.1] - 2025-05-29

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