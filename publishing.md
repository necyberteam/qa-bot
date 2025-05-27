# @snf/access-qa-bot Publishing Guide

This document outlines the process for publishing the ACCESS Q&A Bot package to npm.

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

## Release Process

Our release process is designed to work with our existing CDN infrastructure and includes release candidate testing for integration with dependent repositories (like access-ci-ui).

### 1. Feature Development (Including Release Candidate Version)

During feature development:

```bash
# Create feature branch from main
git checkout -b feature/my-feature main

# Make changes, commit them
# ...

# Check existing versions before updating
git tag -l "v*"

# Update version in package.json with rc suffix (manually edit)
# Example: "1.1.0-rc.1"
# IMPORTANT: Choose a NEW version that doesn't have an existing git tag
# This is necessary for our CDN links to work correctly

# Commit the version change
git commit -am "Bump version to X.Y.Z-rc.1"
```

### 2. Merge to Main

Create a PR. Once approved, merge your feature branch to main, including the release candidate version change.

### 3. Publish Release Candidate to npm (No GitHub Release Yet)

Publish the release candidate version for integration testing:

```bash
# Make sure npm-release branch has latest changes from main
git checkout npm-release
git merge main
# Resolve any conflicts if needed

# Test the package
npm pack
tar -tf @snf-access-qa-bot-*.tgz

# Publish release candidate to npm with rc tag
npm publish --tag rc --access public

# Push changes to npm-release branch
git push upstream npm-release
```

### 4. Integration Testing

Test the release candidate version with dependent repositories:

```bash
# In access-ci-ui or other consuming repos
npm install @snf/access-qa-bot@rc

# Test integration thoroughly
# ...
```

### 5. Promote to Stable Release

If integration testing passes, promote the release candidate to a stable release:

```bash
# Update version in package.json to remove rc suffix
# Example: "1.1.0-rc.1" becomes "1.1.0"

# Commit the stable version
git commit -am "Release version X.Y.Z"

# Merge to main
git checkout main
git merge npm-release

# Create git tag and GitHub release
git tag -a vX.Y.Z -m "Release version X.Y.Z"  # Match your actual version
git push upstream vX.Y.Z

# Create GitHub release
```
- Click on the "Releases" tab in the GitHub repository
- Click "Draft a new release"
- Select the tag you just created
- Add a title and description
- Click "Publish release"

```bash
# Publish stable version to npm
git checkout npm-release
npm publish --access public

# Push final changes
git push upstream npm-release
git push upstream main
```

### Alternative: Direct Release (Skip Release Candidate)

For smaller changes or when integration testing isn't needed:

1. Use stable version number (no rc suffix) from the start
2. Follow steps 1-2 above
3. Skip to step 5 (Create tag, GitHub release, and publish to npm)

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