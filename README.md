# go-docs

![version](https://img.shields.io/github/v/tag/Michael-Obele/go-docs?label=version)

A Mastra-based MCP server that provides expert Go programming assistance. This project demonstrates how to build an MCP server that fetches Go documentation from pkg.go.dev and delivers concise, well-formatted answers with examples through the Model Context Protocol.

## 🚀 Features

- **Go Documentation Access**: Fetches real-time documentation from pkg.go.dev
- **MCP Protocol Support**: HTTP SSE transport for seamless integration with MCP clients
- **Intelligent Responses**: Provides well-formatted answers with code examples
- **Mastra Framework**: Built on Mastra for scalable tool development
- **TypeScript Support**: Fully typed with TypeScript
- **Multi-Client Support**: Works with Cursor, VSCode, Claude Desktop, and other MCP-compatible tools

---

## 🚀 Quick Start

These instructions assume you have Bun (or Node 20+) installed and an API key for your chosen model provider (OpenAI, Google Gemini, etc.). You can use Bun to run this project directly.

1. Install dependencies:

```bash
bun install
```

2. Copy the example environment and add your API key(s):

```bash
cp .env.example .env
# Edit .env and add your API key(s)
```

3. Run in development mode (uses Mastra CLI):

```bash
bun run dev
# OR
npm run dev
```

If you prefer to run the TypeScript entry directly:

```bash
bun run index.ts
```

4. Build and run production:

```bash
bun run build
bun run start
```

> Notes:

- Studio (Mastra local UI) is available during dev, usually at http://localhost:4111.
- The project uses Mastra's `mastra dev`, `mastra build`, and `mastra start` scripts configured in `package.json`.

## 📖 Usage

Once the MCP server is running, connect your MCP-compatible client (Cursor, VSCode, Claude Desktop, etc.) using the configuration below. The server exposes Go documentation tools that can be used to ask questions about Go programming.

### Example Queries

Once connected, you can ask questions like:

- "How do I use the fmt package in Go?"
- "Show me examples of Go slices and arrays"
- "What are Go best practices for error handling?"
- "Explain Go interfaces with code examples"

### MCP Client Configuration

Connect to the running MCP server using various clients:

#### Cursor/VSCode Configuration

Add to your `.vscode/settings.json` or Cursor settings:

**For Development (localhost):**
```json
{
  "mcpServers": {
    "go-docs-dev": {
      "url": "http://localhost:4111/api/mcp/goDocsMcpServer/sse",
      "type": "sse"
    }
  }
}
```

**For Production (SSE transport):**
```json
{
  "mcpServers": {
    "go-docs": {
      "url": "https://go-docs.mastra.cloud/api/mcp/goDocsMcpServer/sse",
      "type": "sse"
    }
  }
}
```

**For Production (HTTP transport):**
```json
{
  "mcpServers": {
    "go-docs": {
      "url": "https://go-docs.mastra.cloud/api/mcp/goDocsMcpServer/mcp",
      "type": "http"
    }
  }
}
```

#### Claude Desktop Configuration

Add to your `claude_desktop_config.json`:

**For Development (localhost):**
```json
{
  "mcpServers": {
    "go-docs-dev": {
      "url": "http://localhost:4111/api/mcp/goDocsMcpServer/sse"
    }
  }
}
```

**For Production (SSE transport):**
```json
{
  "mcpServers": {
    "go-docs": {
      "url": "https://go-docs.mastra.cloud/api/mcp/goDocsMcpServer/sse"
    }
  }
}
```

**For Production (HTTP transport):**
```json
{
  "mcpServers": {
    "go-docs": {
      "url": "https://go-docs.mastra.cloud/api/mcp/goDocsMcpServer/mcp"
    }
  }
}
```

#### Programmatic Usage

```typescript
import { MCPClient } from "@mastra/mcp";

// Use environment variable for URL (supports both dev and prod)
const mcpUrl = process.env.MCP_SERVER_URL || "http://localhost:4111/api/mcp/goDocsMcpServer/sse";

const mcp = new MCPClient({
  servers: {
    goDocs: {
      url: mcpUrl,
    },
  },
});

// Get available tools
const tools = await mcp.getTools();

// Call a tool directly
const result = await mcp.callTool("go-docs", "fetchGoDocs", {
  query: "How do I use Go slices?",
});
```

### MCP Server

The project includes an MCP server for integration with external tools. 

- **Development**: Exposes an HTTP SSE endpoint at `http://localhost:4111/api/mcp/goDocsMcpServer/sse`
- **Production**: Available at both:
  - SSE transport: `https://go-docs.mastra.cloud/api/mcp/goDocsMcpServer/sse`
  - HTTP transport: `https://go-docs.mastra.cloud/api/mcp/goDocsMcpServer/mcp`

### Testing Configuration

For testing purposes, you can configure your MCP client as follows:

**Development Testing:**
```json
{
  "mcpServers": {
    "go-docs-test-dev": {
      "url": "http://localhost:4111/api/mcp/goDocsMcpServer/sse",
      "type": "sse"
    }
  }
}
```

**Production Testing (SSE transport):**
```json
{
  "mcpServers": {
    "go-docs-test-prod-sse": {
      "url": "https://go-docs.mastra.cloud/api/mcp/goDocsMcpServer/sse",
      "type": "sse"
    }
  }
}
```

**Production Testing (HTTP transport):**
```json
{
  "mcpServers": {
    "go-docs-test-prod-http": {
      "url": "https://go-docs.mastra.cloud/api/mcp/goDocsMcpServer/mcp",
      "type": "http"
    }
  }
}
```

---

## 🧭 Project Overview

This repository provides a Mastra-based MCP server that delivers Go programming documentation and assistance through the Model Context Protocol.

- Entry point: `src/mastra/index.ts`
- Tool that fetches pkg.go.dev: `src/mastra/tools/go-docs-tool.ts`
- MCP server definition: `src/mastra/mcp/go-docs-server.ts`

The primary interface is through the MCP server, which exposes Go documentation tools to MCP-compatible clients like Cursor, VSCode, and Claude Desktop.

## 🔧 How it Works

The Go docs MCP server provides intelligent Go programming assistance:

1. **MCP Protocol**: Communicates via HTTP SSE transport at `/api/mcp/goDocsMcpServer/sse` or HTTP transport at `/api/mcp/goDocsMcpServer/mcp`
2. **Documentation Fetching**: The `go-docs-tool` fetches relevant documentation from pkg.go.dev
3. **Tool Exposure**: Makes Go documentation tools available to connected MCP clients
4. **Code Examples**: Provides practical Go code examples and best practices

The MCP server uses the official Go documentation API to ensure accuracy and up-to-date information.

---

## 📦 Scripts

Available scripts defined in `package.json`:

```json
{
  "dev": "mastra dev",
  "build": "mastra build",
  "start": "mastra start"
}
```

You can use Bun or npm/yarn/pnpm to run these scripts — Bun will run scripts directly using `bun run <script>` (e.g. `bun run dev`).

---

## ⚙️ Environment Variables

This project uses a `.env` file for private keys and configuration. The repository includes a `.env.example` which you can copy to `.env` and edit:

```bash
cp .env.example .env
# add your API keys
```

Common environment variables you may need:

- `OPENAI_API_KEY` — API key for OpenAI
- (or) `GOOGLE_GENERATIVE_AI_API_KEY` — for Google Gemini, etc.
- `MCP_SERVER_URL` — MCP server URL (defaults to `http://localhost:4111/api/mcp/goDocsMcpServer/sse` for development, use `https://go-docs.mastra.cloud/api/mcp/goDocsMcpServer/sse` for SSE or `https://go-docs.mastra.cloud/api/mcp/goDocsMcpServer/mcp` for HTTP transport in production)

---

## 🗂️ Folder Structure

High-level layout:

```
src/
├─ mastra/
│  ├─ agents/
│  ├─ tools/
│  ├─ mcp/
│  └─ index.ts
```

---

## 🛠️ Development

### Extending the MCP Server

To add new capabilities to the Go documentation MCP server:

1. **Add Tools**: Create new tools in `src/mastra/tools/` for additional Go documentation features
2. **Modify MCP Server**: Update `src/mastra/mcp/go-docs-server.ts` to expose new tools
3. **Test with MCP Clients**: Use the testing configuration to verify tool functionality

### Building Custom Tools

Tools are created using Mastra's `createTool` function:

```typescript
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const customTool = createTool({
  id: "custom-tool",
  description: "Description of what the tool does",
  inputSchema: z.object({
    param: z.string(),
  }),
  execute: async ({ context }) => {
    // Tool logic here
    return { result: "output" };
  },
});
```

### MCP Server Configuration

The MCP server is configured in `src/mastra/index.ts`. To add new tools to the MCP server:

```typescript
import { MCPServer } from "@mastra/mcp";

const server = new MCPServer({
  name: "Go Docs Server",
  version: "1.0.0",
  tools: { customTool }, // Add your custom tools here
});
```

### MCP Integration

The MCP server allows external tools to access Go documentation capabilities. Configure it in your IDE or use the provided client examples.

---

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repo and create a feature branch
2. Add tests or a demo if you change behavior
3. Submit a PR describing your change

---

## License

This repository is currently configured as `private: true` in `package.json`. If you want to publish or make this repo public, add a `LICENSE` file and update `package.json` as needed.

---

## References

- [Mastra Documentation](https://mastra.ai/docs)
- [Go Official Documentation](https://go.dev/doc/)
- [pkg.go.dev](https://pkg.go.dev)
- [Go Best Practices](https://google.github.io/styleguide/go/best-practices.html)
- [Bun Runtime](https://bun.sh/docs)
