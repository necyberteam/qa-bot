# @snf/access-qa-bot Publishing Guide

This document outlines the simplified process for publishing the ACCESS Q&A Bot package to npm.

## Version Management

In our project, version management is critical because of our CDN delivery system:

- **Version numbers must be incremented**: Never reuse a version that's been tagged
- **CDN links depend on version tags**: Our jsdelivr CDN links reference specific git tags
- **Always check existing tags before versioning**: To avoid conflicts with existing CDN links

Our CDN links follow this pattern:
```
https://cdn.jsdelivr.net/gh/necyberteam/qa-bot@${version}/build/static/js/main.js
https://cdn.jsdelivr.net/gh/necyberteam/qa-bot@v${version}/build/static/js/453.chunk.js
```

### Checking Existing Versions

Before updating a version, always check existing tags to avoid conflicts:

```bash
# List all version tags
git tag -l "v*"

# Or check a specific version
git tag -l "v0.3.0"
```

## Setup

1. Ensure you have npm account credentials for the `snf` organization
   - Username: `yournpmusername`
   - Organization: `snf`

2. Log in to npm:
   ```bash
   npm login
   ```

## Standard Release Process

This is the main workflow for releasing new versions of the package.

### 1. Feature Development

```bash
# Create feature branch from main
git checkout -b feature/my-feature main

# Make your changes, commit them
# ...

# Check existing versions before updating
git tag -l "v*"

# Update version in package.json (manually edit)
# Example: "1.1.0"
# IMPORTANT: Choose a NEW version that doesn't have an existing git tag
# This is necessary for our CDN links to work correctly

# Sync package-lock.json with new version
npm install

# Build the library and app for both npm and CDN delivery
npm run build:lib
npm run build

# Commit the version change and builds
git add .
git commit -am "Bump version to X.Y.Z"
```

### 2. Test the Package (Optional)

```bash
# Test the package locally
npm pack
tar -tf @snf-access-qa-bot-*.tgz

# Clean up the test file
rm @snf-access-qa-bot-*.tgz
```

### 3. Open Pull Request

- Create PR from `feature/my-feature` to `main`
- Include description of changes
- Get code review and approval

### 4. Merge to Main

Once PR is approved and merged to main, proceed with the release.

### 5. Create Release

```bash
# Switch to main and pull latest
git checkout main
git pull upstream main

# Create git tag and push it
git tag -a vX.Y.Z -m "Release version X.Y.Z"  # Match your actual version
git push upstream vX.Y.Z

# Create GitHub release
```

#### GitHub Release Steps:
- Go to: https://github.com/necyberteam/qa-bot/releases/new
- Select the tag you just created (vX.Y.Z)
- Add a title and description
- Click "Publish release"

### 6. Publish to npm

```bash
# Update npm-release branch with latest main
git checkout npm-release
git merge main
# Resolve any conflicts if needed

# Publish to npm
npm publish --access public

# Push npm-release branch
git push upstream npm-release
```

## Debug Release Workflow

For quick debug releases during development (publishes to npm only, no git tags or GitHub releases):

```bash
# From any local branch
# Update version (e.g., 2.6.0-debug.0 to 2.6.0-debug.1)
npm version 2.6.0-debug.1

# Build the library
npm run build:lib

# Publish with debug tag
npm publish --tag debug --access public
```

This workflow is useful for:
- Quick iterations during development
- Testing specific versions in integration environments
- Publishing debug versions without affecting the main release process

## Maintaining the Release Branch

The `npm-release` branch should be periodically synced with main:

```bash
git checkout npm-release
git merge main
# Resolve any conflicts
git push upstream npm-release
```

## CDN Usage

Our project uses two CDN systems:

### 1. jsdelivr CDN (Primary CDN)

This CDN pulls directly from our GitHub repository based on git tags:

```
https://cdn.jsdelivr.net/gh/necyberteam/qa-bot@v0.3.0/build/static/js/main.js
```

The version number in these URLs must match git tags in our repository. Never reuse a version number that already has a tag to avoid breaking existing CDN links.

A complete jsDelivr implementation typically requires three files:
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/necyberteam/qa-bot@v0.3.0/build/static/css/main.css">
<div id="qa-bot"></div>
<script src="https://cdn.jsdelivr.net/gh/necyberteam/qa-bot@v0.3.0/build/static/js/main.js"></script>
<script src="https://cdn.jsdelivr.net/gh/necyberteam/qa-bot@v0.3.0/build/static/js/453.chunk.js"></script>
```

**Important:** When updating the package:
1. Make sure these file paths remain consistent
2. Test all jsDelivr URLs after updating
3. Remember that the chunk filename (like 453.chunk.js) may change in future builds

### 2. unpkg CDN (npm-based, Secondary)

After publishing to npm, the package will also be available via unpkg:

```
https://unpkg.com/@snf/access-qa-bot@0.3.0/dist/access-qa-bot.standalone.js
```

### 3. Using the Published Package

After the package is published to npm, users can install and use it in their projects.

```bash
# Install the package
npm install @snf/access-qa-bot
```

For more detailed usage instructions and examples, refer to the README.md file.

## AI Assistant Notes

This workflow is designed to be clear and actionable for AI assistants. Key points:

- Always check existing git tags before choosing a version number
- Build commands are: `npm run build:lib && npm run build`
- The process maintains both npm packages and CDN links
- Debug releases use the `--tag debug` flag and don't create git tags
- Clean up temporary files (like .tgz from npm pack) after testing