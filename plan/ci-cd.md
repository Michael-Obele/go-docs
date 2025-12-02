# CI/CD & Semantic Release

[← Back to Index](./index.md) | [← Deployment](./deployment.md)

## Overview

This guide covers setting up automated releases using semantic-release with GitHub Actions. The setup enables:

- Automatic version bumping based on commit messages
- Automated changelog generation
- GitHub releases creation
- Conventional commits enforcement

## Semantic Release

### Why Semantic Release?

- **Automated versioning**: No manual version bumps
- **Changelog generation**: Auto-generated from commits
- **Consistent releases**: Every merge to main triggers a release
- **Conventional commits**: Enforced commit message format

### Configuration

Create `.releaserc.js` in the project root:

```javascript
// .releaserc.js
export default {
  branches: ["main"],
  plugins: [
    [
      "@semantic-release/commit-analyzer",
      {
        preset: "conventionalcommits",
        releaseRules: [
          { type: "feat", release: "minor" },
          { type: "fix", release: "patch" },
          { type: "perf", release: "patch" },
          { type: "docs", release: "patch" },
          { type: "refactor", release: "patch" },
          { breaking: true, release: "major" },
        ],
      },
    ],
    [
      "@semantic-release/release-notes-generator",
      {
        preset: "conventionalcommits",
        presetConfig: {
          types: [
            { type: "feat", section: "🚀 Features", hidden: false },
            { type: "fix", section: "🐛 Bug Fixes", hidden: false },
            { type: "perf", section: "⚡ Performance", hidden: false },
            { type: "docs", section: "📚 Documentation", hidden: false },
            { type: "refactor", section: "♻️ Refactoring", hidden: false },
            { type: "test", section: "🧪 Tests", hidden: true },
            { type: "chore", section: "🔧 Maintenance", hidden: true },
            { type: "ci", section: "👷 CI/CD", hidden: true },
          ],
        },
      },
    ],
    "@semantic-release/changelog",
    [
      "@semantic-release/git",
      {
        assets: ["CHANGELOG.md", "package.json"],
        message:
          "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}",
      },
    ],
    "@semantic-release/github",
  ],
};
```

### Dependencies

Add these to `devDependencies` in `package.json`:

```json
{
  "devDependencies": {
    "semantic-release": "^24.0.0",
    "@semantic-release/changelog": "^6.0.3",
    "@semantic-release/git": "^10.0.1",
    "@semantic-release/github": "^10.0.0",
    "@semantic-release/commit-analyzer": "^13.0.0",
    "@semantic-release/release-notes-generator": "^14.0.0",
    "conventional-changelog-conventionalcommits": "^8.0.0"
  }
}
```

## Commitlint

### Configuration

Create `commitlint.config.js`:

```javascript
// commitlint.config.js
export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "body-max-line-length": [0, "always"],
    "footer-max-line-length": [0, "always"],
    "type-enum": [
      2,
      "always",
      [
        "feat", // New feature
        "fix", // Bug fix
        "docs", // Documentation
        "style", // Formatting
        "refactor", // Code refactoring
        "perf", // Performance
        "test", // Tests
        "chore", // Maintenance
        "ci", // CI/CD
        "revert", // Revert commits
      ],
    ],
  },
};
```

### Dependencies

```json
{
  "devDependencies": {
    "@commitlint/cli": "^19.0.0",
    "@commitlint/config-conventional": "^19.0.0",
    "husky": "^9.0.0"
  }
}
```

### Husky Setup

```bash
# Initialize husky
bun add -D husky
bunx husky init

# Add commit-msg hook
echo 'bunx --no -- commitlint --edit "$1"' > .husky/commit-msg
```

## GitHub Actions Workflow

Create `.github/workflows/release.yml`:

```yaml
name: Release

on:
  push:
    branches:
      - main

permissions:
  contents: write
  issues: write
  pull-requests: write

jobs:
  release:
    name: Release
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
          persist-credentials: false

      - name: Setup Bun
        uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest

      - name: Install dependencies
        run: bun install --frozen-lockfile

      - name: Build
        run: bun run build

      - name: Run tests
        run: bun test

      - name: Release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: bunx semantic-release
```

## Testing with Act

[Act](https://github.com/nektos/act) allows you to run GitHub Actions locally.

### Running the Release Workflow

```bash
# Dry run (don't actually release)
act push -j release --secret GITHUB_TOKEN="your-token" --dryrun

# Full run with secrets file
act push -j release --secret-file .secrets

# Run specific workflow
act -W .github/workflows/release.yml push
```

### Secrets File

Create `.secrets` (add to .gitignore!):

```
GITHUB_TOKEN=ghp_your_token_here
```

### Common Act Commands

```bash
# List all workflows
act -l

# Run on push event
act push

# Run on pull_request event
act pull_request

# Use specific Docker image
act push -P ubuntu-latest=catthehacker/ubuntu:act-latest

# Verbose output
act push -v
```

### Troubleshooting Act

**Error: Docker not found**

```bash
# Ensure Docker is running
docker ps

# Install act via homebrew (macOS)
brew install act
```

**Error: Cannot find action**

```bash
# Pull required images
act push -P ubuntu-latest=catthehacker/ubuntu:act-latest
```

**Error: Secret not found**

```bash
# Pass secrets explicitly
act push --secret GITHUB_TOKEN="$GITHUB_TOKEN"
```

## Commit Message Format

### Structure

```
<type>(<scope>): <subject>

[optional body]

[optional footer(s)]
```

### Examples

```bash
# Feature
feat(tools): add auto-detection for package sections

# Bug fix
fix(scraping): handle timeout errors gracefully

# Documentation
docs(readme): update installation instructions

# Breaking change
feat(api)!: change tool input schema

BREAKING CHANGE: The `section` parameter now defaults to "auto"

# Multiple footers
fix(deps): update cheerio to v1.0.0

Fixes #123
Reviewed-by: @username
```

### Commit Types

| Type       | Description                 | Release |
| ---------- | --------------------------- | ------- |
| `feat`     | New feature                 | minor   |
| `fix`      | Bug fix                     | patch   |
| `docs`     | Documentation only          | patch   |
| `style`    | Formatting, no code change  | -       |
| `refactor` | Code refactoring            | patch   |
| `perf`     | Performance improvement     | patch   |
| `test`     | Adding tests                | -       |
| `chore`    | Maintenance                 | -       |
| `ci`       | CI/CD changes               | -       |
| `revert`   | Revert previous commit      | varies  |

## Package.json Scripts

Add these scripts to `package.json`:

```json
{
  "scripts": {
    "dev": "mastra dev",
    "build": "mastra build",
    "start": "mastra start",
    "test": "bun test",
    "lint": "eslint src/",
    "format": "prettier --write .",
    "prepare": "husky",
    "release": "semantic-release",
    "release:dry": "semantic-release --dry-run"
  }
}
```

## Full Package.json Example

```json
{
  "name": "go-docs-mcp",
  "version": "1.0.0",
  "type": "module",
  "main": "dist/http.js",
  "scripts": {
    "dev": "mastra dev",
    "build": "mastra build",
    "start": "mastra start",
    "test": "bun test",
    "lint": "eslint src/",
    "format": "prettier --write .",
    "prepare": "husky",
    "release": "semantic-release",
    "release:dry": "semantic-release --dry-run"
  },
  "dependencies": {
    "@mastra/core": "latest",
    "@mastra/mcp": "latest",
    "axios": "^1.7.0",
    "cheerio": "^1.0.0",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "@commitlint/cli": "^19.0.0",
    "@commitlint/config-conventional": "^19.0.0",
    "@semantic-release/changelog": "^6.0.3",
    "@semantic-release/commit-analyzer": "^13.0.0",
    "@semantic-release/git": "^10.0.1",
    "@semantic-release/github": "^10.0.0",
    "@semantic-release/release-notes-generator": "^14.0.0",
    "@types/node": "^22.0.0",
    "conventional-changelog-conventionalcommits": "^8.0.0",
    "husky": "^9.0.0",
    "semantic-release": "^24.0.0",
    "typescript": "^5.6.0"
  },
  "engines": {
    "node": ">=22.13.0"
  }
}
```

## GitHub Repository Setup

### Required Permissions

1. Go to repository **Settings** > **Actions** > **General**
2. Under "Workflow permissions", select:
   - ✅ Read and write permissions
   - ✅ Allow GitHub Actions to create and approve pull requests

### Branch Protection (Optional)

1. Go to **Settings** > **Branches**
2. Add rule for `main`:
   - ✅ Require pull request reviews
   - ✅ Require status checks to pass

## Workflow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    Developer Workflow                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Create branch         4. Merge to main                       │
│     git checkout -b           git merge feature-branch           │
│     feature/my-feature                                           │
│                           5. GitHub Actions triggers             │
│  2. Make changes             - Build                             │
│     git add .                - Test                              │
│                              - Semantic Release                  │
│  3. Commit (conventional)                                        │
│     git commit -m         6. Auto-generated                      │
│     "feat: add feature"      - Version bump                      │
│                              - Changelog update                  │
│                              - GitHub release                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

[← Back to Index](./index.md) | [← Deployment](./deployment.md)
