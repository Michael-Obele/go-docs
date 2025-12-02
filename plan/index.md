# Go Documentation MCP Server - Project Plan

> **Pure JS/TS Implementation for Mastra Cloud**  
> No Go binary, no local files, no subprocesses - 100% npm/TS

## 🎯 Final Goal

A public MCP server deployed to Mastra Cloud that any LLM (Cursor, Claude, Copilot, Windsurf, etc.) can connect to and get real-time Go stdlib docs, Effective Go tips, and more.

```json
{
  "mcpServers": {
    "go-docs": {
      "type": "http/sse",
      "url": "https://your-go-docs.mastra.cloud"
    }
  }
}
```

## 📚 Documentation Index

| Document                          | Description                                |
| --------------------------------- | ------------------------------------------ |
| [Architecture](./architecture.md) | System design and why pure JS/TS works     |
| [Tools](./tools.md)               | MCP tools documentation (`fetch_go_doc`)   |
| [Resources](./resources.md)       | Static resources (Effective Go)            |
| [Scraping](./scraping.md)         | How cheerio scrapes pkg.go.dev             |
| [Deployment](./deployment.md)     | Mastra Cloud deployment guide              |
| [CI/CD](./ci-cd.md)               | Semantic release & GitHub Actions          |
| [Usage](./usage.md)               | How to consume this MCP server             |

## 🏗️ Project Structure

```
go-docs/
├── plan/                       # This documentation folder
│   ├── index.md               # Main overview (this file)
│   ├── architecture.md        # System design
│   ├── tools.md               # Tool documentation
│   ├── resources.md           # Resources documentation
│   ├── scraping.md            # Scraping implementation
│   ├── deployment.md          # Deployment guide
│   ├── ci-cd.md               # Semantic release & CI/CD
│   └── usage.md               # Usage guide
├── src/
│   ├── mastra/
│   │   └── index.ts           # MCP Server setup
│   ├── tools/
│   │   └── goDocs.ts          # Go documentation fetch tool
│   ├── resources/
│   │   └── effectiveGo.ts     # Static Effective Go resource
│   └── http.ts                # HTTP server entrypoint
├── .github/
│   └── workflows/
│       └── release.yml        # Semantic release workflow
├── .releaserc.js              # Semantic release config
├── commitlint.config.js       # Commit message linting
├── package.json
├── tsconfig.json
└── README.md
```

## 🔑 Key Features

- **Real-time Documentation**: Live scraping from pkg.go.dev
- **No Go Required**: Pure JavaScript/TypeScript implementation
- **Cloud Native**: Designed for Mastra Cloud deployment
- **MCP Compatible**: Works with any MCP-compatible client
- **Extensible**: Easy to add new documentation sources

## 📦 Dependencies

```json
{
  "dependencies": {
    "@mastra/core": "latest",
    "@mastra/mcp": "latest",
    "cheerio": "^1.0.0",
    "axios": "^1.7.0",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "@commitlint/cli": "^19.0.0",
    "@commitlint/config-conventional": "^19.0.0",
    "semantic-release": "^24.0.0",
    "husky": "^9.0.0",
    "typescript": "^5.6.0"
  }
}
```

## ✅ Verified Approach

| Feature           | Status | Notes                           |
| ----------------- | ------ | ------------------------------- |
| Pure JS/TS        | ✅     | No Go binary needed             |
| Cheerio scraping  | ✅     | pkg.go.dev returns clean HTML   |
| Mastra createTool | ✅     | Uses `context` for input params |
| MCPServer         | ✅     | From `@mastra/mcp` package      |
| HTTP transport    | ✅     | SSE or Streamable HTTP          |

## 🚀 Quick Start

```bash
# Install dependencies
bun add @mastra/core @mastra/mcp cheerio axios zod

# Start development
bun run dev

# Build for production
bun run build

# Deploy to Mastra Cloud
# Push to GitHub → Connect in Mastra Cloud → Deploy
```

## 📖 Next Steps

1. Read [Architecture](./architecture.md) to understand the design
2. Review [Tools](./tools.md) for implementation details
3. Follow [Deployment](./deployment.md) to go live
4. Share [Usage](./usage.md) with your team

---

**Last Updated**: December 2025  
**Version**: 1.0.0
