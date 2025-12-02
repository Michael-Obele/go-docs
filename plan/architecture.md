# Architecture

[← Back to Index](./index.md)

## Overview

This document explains the system architecture of the Go Documentation MCP Server and why a pure JavaScript/TypeScript approach is the optimal solution for Mastra Cloud deployment.

## Why Pure JS/TS?

### The Problem with Go Binary Approach

| Approach          | Mastra Cloud Compatible | Complexity | Maintenance |
| ----------------- | ----------------------- | ---------- | ----------- |
| Go CLI subprocess | ❌ No (no filesystem)   | High       | Hard        |
| Go WASM           | ⚠️ Maybe                | Very High  | Hard        |
| **Pure JS/TS**    | ✅ Yes                  | Low        | Easy        |

Mastra Cloud is a **pure Node.js/TS environment** running in the cloud:

- No local filesystem access
- No subprocess execution (`child_process`)
- No Go runtime or WASM support
- Only npm packages work

### The Solution: HTTP Scraping

Since Go documentation is publicly available at `pkg.go.dev`, we can:

1. Fetch HTML via HTTP (axios)
2. Parse HTML with cheerio (jQuery for Node.js)
3. Extract structured documentation
4. Return clean data to LLMs

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        MCP Clients                               │
│  (Cursor, Claude Desktop, VS Code Copilot, Windsurf, etc.)      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ MCP Protocol (SSE/HTTP)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Mastra Cloud                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    MCPServer                               │  │
│  │  ┌─────────────────┐    ┌─────────────────────────────┐   │  │
│  │  │   Tools         │    │   Resources                  │   │  │
│  │  │  • fetch_go_doc │    │  • docs://go/effective-go   │   │  │
│  │  └────────┬────────┘    └─────────────────────────────┘   │  │
│  └───────────┼───────────────────────────────────────────────┘  │
│              │                                                   │
│              ▼                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │               Scraping Layer                               │  │
│  │  • axios (HTTP client)                                     │  │
│  │  • cheerio (HTML parser)                                   │  │
│  └───────────┬───────────────────────────────────────────────┘  │
└──────────────┼──────────────────────────────────────────────────┘
               │
               │ HTTPS
               ▼
┌─────────────────────────────────────────────────────────────────┐
│                   External Sources                               │
│  • pkg.go.dev (Go package documentation)                        │
│  • golang.org (Effective Go, tutorials)                         │
│  • go.dev (Go homepage, blog)                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Component Overview

### 1. MCPServer (`@mastra/mcp`)

The main server that exposes tools and resources via the Model Context Protocol.

```typescript
import { MCPServer } from "@mastra/mcp";

const server = new MCPServer({
  name: "Go Docs MCP",
  version: "1.0.0",
  tools: { fetchGoDoc },
  resources: { effectiveGo },
});
```

### 2. Tools (MCP Capabilities)

Tools are functions that LLMs can call to get information.

| Tool           | Purpose               | Input                               | Output               |
| -------------- | --------------------- | ----------------------------------- | -------------------- |
| `fetch_go_doc` | Fetch Go package docs | `{ pkg: string, section?: string }` | Documentation object |

### 3. Resources (Static Content)

Resources are static or semi-static content exposed via URIs.

| Resource URI             | Description                          |
| ------------------------ | ------------------------------------ |
| `docs://go/effective-go` | Effective Go tips and best practices |

### 4. Scraping Layer

The layer responsible for fetching and parsing external documentation.

- **axios**: HTTP client with timeout support
- **cheerio**: jQuery-like HTML parser for Node.js
- **zod**: Input validation schemas

## Data Flow

### Tool Execution Flow

```
1. LLM calls tool: fetch_go_doc({ pkg: "net/http" })
                    │
2. Tool validates input with Zod schema
                    │
3. axios.get("https://pkg.go.dev/net/http")
                    │
4. cheerio.load(html) parses response
                    │
5. Extract: title, synopsis, functions, types
                    │
6. Return structured data to LLM
                    │
7. LLM uses data to answer user's question
```

### Resource Access Flow

```
1. Client requests: docs://go/effective-go
                    │
2. MCPServer routes to resource handler
                    │
3. Return static markdown content
                    │
4. Client displays to user
```

## Error Handling Strategy

```typescript
try {
  const { data } = await axios.get(url, { timeout: 8000 });
  // Parse and return
} catch (err: any) {
  return {
    error: `Failed to fetch ${pkg}: ${err.message}`,
    suggestion: "Try 'fmt', 'net/http', 'context', 'sync', etc.",
  };
}
```

Key principles:

- Always return useful error messages
- Suggest alternatives when possible
- Use timeouts to prevent hanging
- Graceful degradation over hard failures

## Security Considerations

1. **Input Validation**: All inputs validated with Zod
2. **Timeout Protection**: 8-second timeout on all HTTP requests
3. **No Secrets in Code**: Environment variables for sensitive data
4. **Rate Limiting**: Consider adding rate limiting for production

## Scalability

The architecture scales well because:

- Stateless design (no local storage)
- Each request is independent
- Mastra Cloud handles horizontal scaling
- External docs are always up-to-date

## Future Extensions

Potential additions:

- **Caching**: Add in-memory or Redis cache for frequent requests
- **More Sources**: Go blog, release notes, proposals
- **Search**: Full-text search across Go documentation
- **Examples**: Code examples from Go playground

---

[← Back to Index](./index.md) | [Next: Tools →](./tools.md)
