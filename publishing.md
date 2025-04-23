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
git tag -l "v0.2.0"
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

Our release process is designed to work with our existing CDN infrastructure.

### 1. Feature Development (Including Version Update)

During feature development:

```bash
# Create feature branch from main
git checkout -b feature/my-feature main

# Make changes, commit them
# ...

# Check existing versions before updating
git tag -l "v*"

# Update version in package.json (manually edit)
# IMPORTANT: Choose a NEW version that doesn't have an existing git tag
# This is necessary for our CDN links to work correctly

# Commit the version change
git commit -am "Bump version to X.Y.Z"
```

### 2. Merge to Main

Create a PR. Once approved, merge your feature branch to main, including the version change.

### 3. Create Tag

After merging to main, create a tag matching your version:

```bash
git checkout main
git pull
git tag -a v0.2.0 -m "Release version 0.2.0"  # Match your actual version
git push origin v0.2.0
```

This tag will be used by the jsdelivr CDN.

### 4. Prepare for npm Publishing

Now we need to publish to npm from the npm-release branch:

```bash
# Make sure npm-release branch has latest changes from main
git checkout npm-release
git merge main
# Resolve any conflicts if needed
```

### 5. Test the Package

```bash
# Create a tarball without publishing
npm pack

# Review the contents
tar -tf @snf-access-qa-bot-*.tgz
```

### 6. Publish the Package

```bash
npm publish --access public
```

### 7. Push Changes

Push the commit to the npm-release branch:

```bash
git push origin npm-release
```

## Maintaining the Release Branch

The `npm-release` branch should be periodically synced with main:

```bash
git checkout npm-release
git merge main
# Resolve any conflicts
git push origin npm-release
```

## CDN Usage

Our project uses two CDN systems:

### 1. jsdelivr CDN (Primary CDN)

This CDN pulls directly from our GitHub repository based on git tags:

```
https://cdn.jsdelivr.net/gh/necyberteam/qa-bot@v0.2.0/build/static/js/main.js
```

The version number in these URLs must match git tags in our repository. Never reuse a version number that already has a tag to avoid breaking existing CDN links.

### 2. unpkg CDN (npm-based, Secondary)

After publishing to npm, the package will also be available via unpkg:

```
https://unpkg.com/@snf/access-qa-bot@0.2.0/dist/access-qa-bot.standalone.js
```

## CI Integration

**TODO**: Add information about the CI process:
- Where the CI configuration is located
- How the CI process works with the npm-release branch
- How versioning is managed in CI

## Using the Published Package

After the package is published to npm, users can install and use it in their projects.

```bash
# Install the package
npm install @snf/access-qa-bot
```

For more detailed usage instructions and examples, refer to the README.md file.