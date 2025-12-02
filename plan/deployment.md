# Deployment

[← Back to Index](./index.md) | [← Scraping](./scraping.md)

## Overview

This guide covers deploying the Go Documentation MCP Server to Mastra Cloud, making it publicly accessible to any MCP-compatible client.

## Prerequisites

- GitHub account
- Mastra Cloud account (sign up at mastra.ai)
- Node.js 22+ installed locally

## Project Setup

### 1. Package.json Configuration

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
    "@semantic-release/git": "^10.0.1",
    "@semantic-release/github": "^10.0.0",
    "@types/node": "^22.0.0",
    "husky": "^9.0.0",
    "semantic-release": "^24.0.0",
    "typescript": "^5.6.0"
  },
  "engines": {
    "node": ">=22.13.0"
  }
}
```

### 2. TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "dist",
    "rootDir": "src",
    "declaration": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## Server Implementation

### HTTP Entry Point

```typescript
// src/http.ts
import { createServer } from "http";
import { server } from "./mastra/index.js";

const PORT = process.env.PORT || 3000;

const httpServer = createServer(async (req, res) => {
  const url = new URL(req.url || "", `http://localhost:${PORT}`);

  // Health check endpoint
  if (url.pathname === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", version: "1.0.0" }));
    return;
  }

  // MCP endpoints
  try {
    await server.startHTTP({
      url,
      httpPath: "/mcp",
      req,
      res,
    });
  } catch (err) {
    console.error("MCP Error:", err);
    res.writeHead(500);
    res.end("Internal Server Error");
  }
});

httpServer.listen(PORT, () => {
  console.log(`🚀 Go Docs MCP Server running on port ${PORT}`);
  console.log(`📚 MCP endpoint: http://localhost:${PORT}/mcp`);
  console.log(`❤️  Health check: http://localhost:${PORT}/health`);
});
```

### MCP Server Setup

```typescript
// src/mastra/index.ts
import { MCPServer } from "@mastra/mcp";
import { fetchGoDoc } from "../tools/goDocs.js";
import { effectiveGoResources } from "../resources/effectiveGo.js";

export const server = new MCPServer({
  name: "Go Docs MCP",
  version: "1.0.0",
  description: "Real-time Go documentation server - stdlib + Effective Go",
  tools: { fetchGoDoc },
  resources: effectiveGoResources,
});
```

## Local Development

### Running Locally

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Or build and run
bun run build
bun run start
```

### Testing Locally

```bash
# Health check
curl http://localhost:3000/health

# Test MCP endpoint (requires MCP client)
# Or use the Mastra playground
```

## Mastra Cloud Deployment

### Step 1: Push to GitHub

```bash
# Initialize git if needed
git init

# Add all files
git add .

# Commit
git commit -m "Initial Go Docs MCP Server"

# Add remote and push
git remote add origin https://github.com/YOUR_USERNAME/go-docs-mcp.git
git push -u origin main
```

### Step 2: Connect to Mastra Cloud

1. Go to [console.mastra.ai](https://console.mastra.ai)
2. Sign in with GitHub
3. Click "New Project"
4. Select your `go-docs-mcp` repository
5. Click "Deploy"

### Step 3: Configure Environment

In Mastra Cloud dashboard:

1. Go to Project Settings
2. Add any environment variables (none required for basic setup)
3. Verify build settings:
   - Build Command: `bun run build`
   - Start Command: `bun run start`
   - Node Version: 22

### Step 4: Deploy

1. Click "Deploy" button
2. Wait for build to complete (~1-2 minutes)
3. Get your public URL: `https://your-project.mastra.cloud`

## Post-Deployment

### Verify Deployment

```bash
# Health check
curl https://your-project.mastra.cloud/health

# Should return:
# {"status":"ok","version":"1.0.0"}
```

### Configure MCP Clients

Add to your MCP client configuration:

```json
{
  "mcpServers": {
    "go-docs": {
      "type": "http/sse",
      "url": "https://your-project.mastra.cloud/mcp"
    }
  }
}
```

## Deployment Checklist

- [ ] Package.json has correct `main` entry
- [ ] TypeScript compiles without errors
- [ ] Local server starts successfully
- [ ] Health endpoint responds
- [ ] Code pushed to GitHub
- [ ] Repository connected to Mastra Cloud
- [ ] Build completes successfully
- [ ] Deployment URL accessible
- [ ] MCP client can connect

## Troubleshooting

### Build Fails

```
Error: Cannot find module '@mastra/mcp'
```

**Solution**: Ensure dependencies are in `dependencies`, not `devDependencies`

### Server Doesn't Start

```
Error: Port already in use
```

**Solution**: Mastra Cloud sets `PORT` env var - don't hardcode ports

### MCP Connection Fails

```
Error: Connection refused
```

**Solution**: Check that httpPath matches your endpoint configuration

### Timeout Errors

```
Error: ETIMEDOUT
```

**Solution**: pkg.go.dev might be slow - increase timeout or add retry logic

## Monitoring

### Logs

View logs in Mastra Cloud dashboard:

1. Go to your project
2. Click "Logs" tab
3. Filter by time range or search

### Metrics

Monitor in dashboard:

- Request count
- Response times
- Error rates
- Memory usage

## Updating

### Automatic Updates

Mastra Cloud can auto-deploy on push:

1. Go to Project Settings
2. Enable "Auto Deploy"
3. Select branch (usually `main`)

### Manual Updates

```bash
# Make changes
git add .
git commit -m "feat: add new feature X"  # Use conventional commits!
git push

# GitHub Actions will automatically:
# - Run tests
# - Create a new release (if feat/fix commit)
# - Update CHANGELOG.md

# Go to Mastra Cloud dashboard
# Auto-deploy will trigger, or click "Deploy" manually
```

> **Note**: See [CI/CD Guide](./ci-cd.md) for details on semantic versioning and automated releases.

---

[← Back to Index](./index.md) | [Next: CI/CD →](./ci-cd.md) | [Usage →](./usage.md)
