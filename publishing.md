# @snf/access-qa-bot Publishing Guide

This document outlines the process for publishing the ACCESS Q&A Bot package to npm.

## Version Management

In our project, version management is tied to our CDN delivery system:

- **Version changes happen in feature branches**: Version is updated in package.json during development
- **Tags are created to match version**: Git tags must match the version in package.json
- **CDN links depend on these versions**: Our CDN links (jsdelivr) reference specific git tags

Our CDN links follow this pattern:
```
https://cdn.jsdelivr.net/gh/necyberteam/qa-bot@${version}/build/static/js/main.js
https://cdn.jsdelivr.net/gh/necyberteam/qa-bot@v${version}/build/static/js/453.chunk.js
```

These links require consistent git tags that match our package versions.

## Setup

1. Ensure you have npm account credentials for the `snf` organization
   - Username: `yournpmusername`
   - Organization: `snf`

2. Log in to npm:
   ```bash
   npm login
   ```

## Standard Release Process

Our release process needs to work with our existing versioning and CDN strategy.

### 1. Feature Development (Including Version Update)

During feature development:

```bash
# Create feature branch from main
git checkout -b feature/my-feature main

# Make changes, commit them
# ...

# Update version in package.json (manually edit or use npm version)
# This is necessary for our CDN links to work

# Commit the version change
git commit -am "Bump version to X.Y.Z"
```

### 2. Merge to Main

Create a PR and merge your feature branch to main, including the version change.

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

## Pre-release Process

For beta versions that haven't been merged to main.

### 1. Development for Pre-release

Develop in a feature branch, including version update:

```bash
# Develop in a feature branch as usual
git checkout -b feature/experimental main

# Make changes, commit them
# ...

# Update version in package.json to include beta suffix
# Example: change "0.2.0" to "0.2.1-beta.0" manually
```

### 2. Create Tag for Beta

```bash
# Create a tag for the beta version
git tag -a v0.2.1-beta.0 -m "Beta release v0.2.1-beta.0"
git push origin v0.2.1-beta.0  # This will be used by jsdelivr
```

### 3. Prepare npm Release Branch

```bash
git checkout npm-release
git merge feature/experimental
```

### 4. Test the Package

```bash
# Create a tarball without publishing
npm pack

# Review the contents
tar -tf @snf-access-qa-bot-*.tgz
```

### 5. Publish Beta Version

```bash
npm publish --tag beta --access public
```

### 6. Push Changes

```bash
# Push the commit
git push origin npm-release
```

### 7. Installation for Users

Users can install the beta version with:

```bash
# Latest beta version
npm install @snf/access-qa-bot@beta
```

### 8. Later Integration with Main

After testing the beta version, when ready to merge to main:

```bash
git checkout main
git merge feature/experimental  # Merge the original feature branch
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

The version number in these URLs must match git tags in our repository.

### 2. unpkg CDN (npm-based, Secondary)

After publishing to npm, the package will also be available via unpkg:

```
https://unpkg.com/@snf/access-qa-bot@0.2.0/dist/access-qa-bot.standalone.js
```

For beta versions:
```
https://unpkg.com/@snf/access-qa-bot@0.2.1-beta.0/dist/access-qa-bot.standalone.js
```

## CI Integration

**TODO**: Add information about the CI process:
- Where the CI configuration is located
- How the CI process works with the npm-release branch
- How versioning is managed in CI