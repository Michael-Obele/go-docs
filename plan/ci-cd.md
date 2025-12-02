# CI/CD & Semantic Release

[← Back to Index](./index.md) | [← Deployment](./deployment.md)

## Overview

This guide covers setting up automated releases using semantic-release with GitHub Actions, while CI/CD is handled by Mastra Cloud. The setup enables:

- Automatic version bumping based on commit messages
- Automated changelog generation with **all changes visible**
- GitHub releases creation with detailed release notes
- Conventional commits enforcement
- Mastra Cloud for testing and deployment

## Workflow Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    Mastra Cloud + GitHub Actions              │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Mastra Cloud (CI/CD)           release.yml (on main push)   │
│  ┌─────────────────────┐        ┌─────────────────────────┐  │
│  │ • Agent Testing     │        │ • Build                 │  │
│  │ • Auto Deployment   │        │ • Semantic Release      │  │
│  │ • Logs & Traces     │        │   - Analyze commits     │  │
│  │ • Custom Domains    │        │   - Generate changelog  │  │
│  └─────────────────────┘        │   - Create GitHub release│ │
│                                  │   - Update CHANGELOG.md │  │
│                                  └─────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

## Mastra Cloud CI/CD

### Why Mastra Cloud?

- **Integrated Testing**: Agent testing interface for comprehensive validation
- **Auto Deployment**: Automatic deployments on git push to connected repository
- **Monitoring**: Comprehensive logs and traces for debugging
- **Scalability**: Built-in scaling without infrastructure concerns
- **Custom Domains**: Support for custom domains per project

### Setup Steps

1. Connect your GitHub repository to Mastra Cloud
2. Configure project settings in the Mastra Cloud dashboard
3. Push code to trigger automatic deployments
4. Use the Agent testing interface for validation

## Semantic Release

### Why Semantic Release?

- **Automated versioning**: No manual version bumps
- **Complete changelog**: Shows ALL changes (features, fixes, docs, tests, etc.)
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
          { type: "style", release: "patch" },
          { type: "build", release: "patch" },
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
            // ALL types visible in changelog for complete transparency
            { type: "feat", section: "🚀 Features", hidden: false },
            { type: "fix", section: "🐛 Bug Fixes", hidden: false },
            {
              type: "perf",
              section: "⚡ Performance Improvements",
              hidden: false,
            },
            { type: "docs", section: "📚 Documentation", hidden: false },
            { type: "refactor", section: "♻️ Code Refactoring", hidden: false },
            { type: "style", section: "💄 Styling", hidden: false },
            { type: "test", section: "🧪 Tests", hidden: false },
            { type: "build", section: "📦 Build System", hidden: false },
            { type: "ci", section: "👷 CI/CD", hidden: false },
            { type: "chore", section: "🔧 Maintenance", hidden: false },
            { type: "revert", section: "⏪ Reverts", hidden: false },
          ],
        },
        writerOpts: {
          groupBy: "type",
          commitGroupsSort: ["feat", "fix", "perf", "refactor", "docs"],
          commitsSort: ["scope", "subject"],
        },
      },
    ],
    [
      "@semantic-release/changelog",
      {
        changelogFile: "CHANGELOG.md",
        changelogTitle:
          "# Changelog\\n\\nAll notable changes to Go Docs MCP Server will be documented in this file.\\n",
      },
    ],
    [
      "@semantic-release/git",
      {
        assets: ["CHANGELOG.md", "package.json"],
        message:
          "chore(release): ${nextRelease.version} [skip ci]\\n\\n${nextRelease.notes}",
      },
    ],
    [
      "@semantic-release/github",
      {
        successComment:
          "🎉 This ${issue.pull_request ? 'PR is included' : 'issue has been resolved'} in version ${nextRelease.version}",
        releasedLabels: ["released"],
      },
    ],
  ],
};
```

      },
    ],
    "@semantic-release/github",

],
};

````

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
````

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

## GitHub Actions Workflows

### Release Workflow (Changelog & Releases)

Create `.github/workflows/release.yml` for automated releases:

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

      - name: Release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: bunx semantic-release
```

> **Note**: CI/CD (testing, linting, building) is handled by Mastra Cloud. The Release workflow focuses solely on creating releases with comprehensive changelogs.

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

| Type       | Description                | Release |
| ---------- | -------------------------- | ------- |
| `feat`     | New feature                | minor   |
| `fix`      | Bug fix                    | patch   |
| `docs`     | Documentation only         | patch   |
| `style`    | Formatting, no code change | -       |
| `refactor` | Code refactoring           | patch   |
| `perf`     | Performance improvement    | patch   |
| `test`     | Adding tests               | -       |
| `chore`    | Maintenance                | -       |
| `ci`       | CI/CD changes              | -       |
| `revert`   | Revert previous commit     | varies  |

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
│  1. Create branch         4. Push to main                        │
│     git checkout -b           git push origin main               │
│     feature/my-feature                                           │
│                           5. Mastra Cloud triggers               │
│  2. Make changes             - Testing                           │
│     git add .                - Auto-deployment                   │
│                              - Monitoring                        │
│  3. Commit (conventional)                                        │
│     git commit -m         6. GitHub Actions triggers             │
│     "feat: add feature"      - Semantic Release                  │
│                              - Changelog generation              │
│                              - GitHub release                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

[← Back to Index](./index.md) | [← Deployment](./deployment.md)
