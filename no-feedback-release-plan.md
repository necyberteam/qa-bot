# Remove Main Feedback Flow Release Plan (Simplified)

## Overview
Create a `no-feedback` branch that removes the main feedback flow with minimal code changes while keeping thumbs up/down feedback after Q&A responses. Consumers keep the same API - the "Provide feedback to ACCESS" option simply doesn't appear. Use existing publishing workflow with beta tagging.

## Phase 1: Create Branch Without Main Feedback Flow

### Step 1.1: Create Branch from Current Main
```bash
git checkout main
git pull upstream main
git checkout -b no-feedback main
```

### Step 1.2: Minimal Code Changes to Remove Main Feedback Flow

**Simple approach: Comment out main feedback flow only (keep thumbs up/down)**

1. **Main Menu Flow** (`src/utils/flows/main-menu-flow.js`):
   ```javascript
   options: [
     "Ask a question about ACCESS",
     "Open a Help Ticket",
     // "Provide feedback to ACCESS",  // COMMENTED OUT
     "Report a security issue"
   ]
   ```

2. **Bot Flow Creation** (`src/utils/create-bot-flow.js`):
   ```javascript
   return {
     ...mainMenuFlow,
     ...qaFlow,
     // ...(feedbackFlow || {}),  // COMMENTED OUT
     ...supportFlow,
     ...securityFlow
   };
   ```

**Q&A Flow thumbs up/down stays unchanged** - Users can still provide quick feedback after each answer.

**Result**: Same API, main feedback flow doesn't appear, but thumbs up/down feedback remains active.

## Phase 2: Beta Release

Follow **Section 1: Feature Development** from `publishing.md` but use beta versioning:

```bash
# Update package.json to "version": "2.3.0-beta.1"
# Follow publishing.md: npm install, build:lib, build, commit
git commit -am "Release v2.3.0-beta.1: Remove main feedback flow (keep thumbs up/down)"

# Tag and publish
git tag -a v2.3.0-beta.1 -m "Remove main feedback flow (keep thumbs up/down)"
git push upstream no-feedback --tags

# Follow publishing.md Section 2: Publish with beta tag
npm publish --tag beta --access public
```

## Phase 4: Consumer Usage

**No code changes needed for consumers!**

### NPM Installation
```bash
# They just install the beta version
npm install @snf/access-qa-bot@beta
```

### Package.json Version
After installation, the version will appear in their `package.json` as:
```json
{
  "dependencies": {
    "@snf/access-qa-bot": "^2.3.0-beta.1"
  }
}
```

Or if they want to pin to the exact beta version:
```json
{
  "dependencies": {
    "@snf/access-qa-bot": "2.3.0-beta.1"
  }
}
```

### CDN Links
**CDN Links work automatically:**
```html
<script src="https://cdn.jsdelivr.net/gh/necyberteam/qa-bot@v2.3.0-beta.1/build/static/js/main.js"></script>
```

## Phase 5: Future Management

- **Promote to stable**: Follow `publishing.md` Section 6 if needed
- **Maintain branch**: Merge from main as needed, preserving commented-out feedback code
- **Switch back**: Consumers just change to `@latest` when ready

## Summary

- **Minimal changes**: Just comment out main feedback flow (keep thumbs up/down)
- **No API changes**: Consumers use exact same code
- **Existing workflow**: Follow `publishing.md` with beta tagging
- **Clean versioning**: 2.2.0 → 2.3.0-beta.1

This gives consumers exactly what they want: latest features without the main feedback flow, but retaining quick thumbs up/down feedback after Q&A responses. No code changes required.