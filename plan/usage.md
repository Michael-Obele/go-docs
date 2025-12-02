# Usage Guide

[← Back to Index](./index.md) | [← Deployment](./deployment.md)

## Overview

This guide explains how to use the Go Documentation MCP Server from various MCP-compatible clients and LLM tools.

## Quick Start

### Public Server URL

Once deployed, your server will be available at:

```
https://your-project.mastra.cloud/mcp
```

## Client Configuration

### Cursor

Create or edit `.cursor/mcp.json` in your project root:

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

### VS Code Copilot

Edit VS Code settings or create `.vscode/mcp.json`:

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

### Claude Desktop

Edit `~/.claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "go-docs": {
      "type": "sse",
      "url": "https://your-project.mastra.cloud/mcp"
    }
  }
}
```

### Windsurf

Add to your Windsurf MCP configuration:

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

### Mastra MCPClient

```typescript
import { MCPClient } from "@mastra/mcp";

const client = new MCPClient({
  servers: {
    goDocs: {
      url: new URL("https://your-project.mastra.cloud/mcp"),
    },
  },
});

// Get tools
const tools = await client.getTools();

// Use with an agent
const agent = new Agent({
  name: "Go Assistant",
  tools,
  // ...
});
```

## Using the Tools

### fetch_go_doc

The main tool for fetching Go package documentation.

#### Basic Usage

```
User: "What functions does the fmt package provide?"

LLM uses: fetch_go_doc({ pkg: "fmt" })

Response: Returns package overview with exported functions like Printf, Println, Sprintf, etc.
```

#### With Section Parameter

```
User: "Show me the types in the net/http package"

LLM uses: fetch_go_doc({ pkg: "net/http", section: "types" })

Response: Returns type definitions like Handler, Request, Response, etc.
```

#### Effective Go

```
User: "What are Go's best practices for error handling?"

LLM uses: fetch_go_doc({ pkg: "", section: "effective-go" })

Response: Returns Effective Go tips including error handling best practices
```

### Available Sections

| Section        | Description                                           |
| -------------- | ----------------------------------------------------- |
| `auto`         | **Recommended** - Comprehensive overview (default)    |
| `overview`     | Package synopsis and description only                 |
| `functions`    | Detailed list of exported functions with signatures   |
| `types`        | Detailed list of exported types with definitions      |
| `examples`     | Code examples from documentation                      |
| `effective-go` | Effective Go best practices (not package-specific)    |

> **Note**: The `auto` section is the default and recommended for most queries. It provides comprehensive documentation that covers synopsis, key functions, types, and examples - eliminating the need to guess which section contains the information you need.

## Example Conversations

### Learning a Package

```
User: "I need to work with JSON in Go. What should I know?"

LLM: *calls fetch_go_doc({ pkg: "encoding/json" })*

"The encoding/json package provides functions for JSON encoding and decoding:

- Marshal/Unmarshal for converting between Go values and JSON
- Encoder/Decoder for streaming JSON
- Use struct tags like `json:"fieldName"` to customize field names
- Use `omitempty` to skip empty fields: `json:"field,omitempty"`

Key functions:
- json.Marshal(v any) ([]byte, error)
- json.Unmarshal(data []byte, v any) error
- json.NewEncoder(w io.Writer) *Encoder
- json.NewDecoder(r io.Reader) *Decoder"
```

### HTTP Server Setup

```
User: "How do I create a basic HTTP server in Go?"

LLM: *calls fetch_go_doc({ pkg: "net/http", section: "functions" })*

"Here's how to create a basic HTTP server:

\`\`\`go
package main

import (
    "fmt"
    "net/http"
)

func handler(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintf(w, "Hello, %s!", r.URL.Path[1:])
}

func main() {
    http.HandleFunc("/", handler)
    http.ListenAndServe(":8080", nil)
}
\`\`\`

Key types from net/http:
- http.Handler interface
- http.HandlerFunc adapter
- http.Request struct
- http.ResponseWriter interface"
```

### Best Practices Query

```
User: "What are Go's concurrency best practices?"

LLM: *calls fetch_go_doc({ section: "effective-go" })*

"From Effective Go, key concurrency principles:

1. Don't communicate by sharing memory; share memory by communicating
2. Use channels for synchronization
3. Goroutines are cheap - use them
4. Use context.Context for cancellation and timeouts
5. Always handle the done channel to prevent goroutine leaks

Example:
\`\`\`go
done := make(chan bool)
go func() {
    // work
    done <- true
}()
<-done // wait for completion
\`\`\`"
```

## Resources Access

### Effective Go Resource

Clients can directly access static resources:

```typescript
// List resources
const resources = await client.resources.list();
// Returns: ["docs://go/effective-go", "docs://go/proverbs"]

// Read resource
const content = await client.resources.read("goDocs", "docs://go/effective-go");
// Returns full Effective Go markdown
```

### Go Proverbs Resource

```typescript
const proverbs = await client.resources.read("goDocs", "docs://go/proverbs");
// Returns Rob Pike's Go Proverbs
```

## Common Use Cases

### 1. API Reference Lookup

```
"What's the signature of strings.Split?"
→ fetch_go_doc({ pkg: "strings", section: "functions" })
```

### 2. Package Discovery

```
"What packages are available for HTTP testing?"
→ fetch_go_doc({ pkg: "net/http/httptest" })
```

### 3. Interface Understanding

```
"What methods does io.Reader require?"
→ fetch_go_doc({ pkg: "io", section: "types" })
```

### 4. Best Practices

```
"How should I handle errors in Go?"
→ fetch_go_doc({ section: "effective-go" })
```

### 5. Code Examples

```
"Show me an example of using sync.WaitGroup"
→ fetch_go_doc({ pkg: "sync", section: "examples" })
```

## Tips for LLM Users

### Be Specific

```
✅ "What functions does the path/filepath package have?"
❌ "Tell me about paths in Go"
```

### Ask for Sections

```
✅ "Show me the types in database/sql"
❌ "What is database/sql?"
```

### Combine with Context

```
"I'm building a web server. First fetch the net/http docs,
then help me implement a REST API."
```

## Troubleshooting

### "Package not found"

Check the package path:

- ✅ `net/http` (correct)
- ❌ `http` (incomplete)
- ❌ `net.http` (wrong separator)

### "No synopsis available"

Some internal packages have limited documentation. Try:

- Using a more common package
- Checking the full package path

### "Connection timeout"

The server couldn't reach pkg.go.dev:

- Wait and try again
- Check if pkg.go.dev is accessible
- The server has 8-second timeout

## Rate Limiting

The server doesn't implement rate limiting by default, but pkg.go.dev may rate limit excessive requests. For production use:

- Cache responses when possible
- Avoid rapid repeated requests
- Consider implementing server-side caching

## Extending Usage

### Adding to Your Own Agent

```typescript
import { Agent } from "@mastra/core/agent";
import { MCPClient } from "@mastra/mcp";

const mcpClient = new MCPClient({
  servers: {
    goDocs: {
      url: new URL("https://your-project.mastra.cloud/mcp"),
    },
  },
});

const goExpert = new Agent({
  name: "Go Expert",
  instructions: `You are a Go programming expert. Use the go-docs tools 
to fetch accurate, up-to-date documentation when answering questions 
about Go packages, functions, and best practices.`,
  tools: await mcpClient.getTools(),
});
```

### Combining with Other Tools

```typescript
const agent = new Agent({
  name: "Full-Stack Go Developer",
  tools: {
    ...(await goDocsMcp.getTools()),
    ...(await githubMcp.getTools()),
    ...(await terminalTools),
  },
});
```

---

[← Back to Index](./index.md) | [← Deployment](./deployment.md)
