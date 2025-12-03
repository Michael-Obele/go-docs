# go-docs

[![latest release](https://img.shields.io/github/v/tag/Michael-Obele/go-docs?sort=semver)](https://github.com/Michael-Obele/go-docs/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

<!-- [![Install MCP Server](https://cursor.com/deeplink/mcp-install-light.svg)](https://cursor.com/en-US/install-mcp?name=go-docs&config=eyJ0eXBlIjoic3NlIiwidXJsIjoiaHR0cHM6Ly9nby1kb2NzLm1hc3RyYS5jbG91ZC9hcGkvbWNwL2dvRG9jc01jcFNlcnZlci9zc2UifQ%3D%3D) -->

A Mastra-based MCP server that provides expert Go programming assistance with real-time documentation from pkg.go.dev. Use it in your AI-powered code editor to get instant access to Go documentation, best practices, and code examples.

## Production Deployment

| Host         | Base URL                     | Highlights                                                                          |
| ------------ | ---------------------------- | ----------------------------------------------------------------------------------- |
| Mastra Cloud | https://go-docs.mastra.cloud | **Primary choice** - Zero cold start, maximum responsiveness, reliable performance. |

- Append `/api/mcp/goDocsMcpServer/sse` for the SSE transport (best for editors that keep long-lived connections).
- Append `/api/mcp/goDocsMcpServer/mcp` for the HTTP transport (handy for CLIs and quick one-off calls).

<details>
<summary>Endpoint reference</summary>

- **Mastra Cloud SSE**: https://go-docs.mastra.cloud/api/mcp/goDocsMcpServer/sse
- **Mastra Cloud HTTP**: https://go-docs.mastra.cloud/api/mcp/goDocsMcpServer/mcp
- **Development SSE**: http://localhost:4111/api/mcp/goDocsMcpServer/sse
- **Development HTTP**: http://localhost:4111/api/mcp/goDocsMcpServer/mcp

</details>

## 🎉 What's New

- ✅ Production deployment on Mastra Cloud
- ✅ Real-time Go documentation from pkg.go.dev
- ✅ Expert Go programming assistance with AI agent
- ✅ Support for all major AI code editors (Cursor, Windsurf, VS Code, Claude Desktop)
- ✅ HTTP and SSE transport protocols
- ✅ Automated versioning with semantic-release

## 🚀 Features

- **Go Documentation Access**: Fetches real-time documentation from pkg.go.dev
- **MCP Protocol Support**: HTTP SSE transport for seamless integration with MCP clients
- **Intelligent Responses**: Provides well-formatted answers with code examples
- **Mastra Framework**: Built on Mastra for scalable tool development
- **TypeScript Support**: Fully typed with TypeScript
- **Multi-Client Support**: Works with Cursor, VSCode, Claude Desktop, Windsurf, and other MCP-compatible tools

---

## Editor Setup

**Mastra Cloud is the recommended deployment** for all editors. It offers zero cold start and maximum responsiveness. SSE works best for editors that keep a persistent connection, while HTTP is handy for one-off requests and scripts.

<details>
<summary>Cursor</summary>

1. Open Cursor Settings (`Cmd/Ctrl` + `,`).
2. Navigate to "MCP" / "Model Context Protocol" and add a new server configuration.

Mastra Cloud — SSE example:

```json
{
  "go-docs": {
    "type": "sse",
    "url": "https://go-docs.mastra.cloud/api/mcp/goDocsMcpServer/sse"
  }
}
```

Mastra Cloud — HTTP example:

```json
{
  "go-docs": {
    "type": "http",
    "url": "https://go-docs.mastra.cloud/api/mcp/goDocsMcpServer/mcp"
  }
}
```

Development (localhost):

```json
{
  "go-docs-dev": {
    "type": "sse",
    "url": "http://localhost:4111/api/mcp/goDocsMcpServer/sse"
  }
}
```

</details>

<details>
<summary>VS Code</summary>

Add to your `.vscode/settings.json` or use the Command Palette (`Cmd/Ctrl+Shift+P`) and run `MCP: Add server`:

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

</details>

<details>
<summary>Windsurf</summary>

1. Edit `~/.codeium/windsurf/mcp_config.json`.
2. Add the SSE transport:

```json
{
  "mcpServers": {
    "go-docs": {
      "url": "https://go-docs.mastra.cloud/api/mcp/goDocsMcpServer/sse",
      "transport": "sse"
    }
  }
}
```

3. Save, restart Windsurf, then open `mcp.json` in Agent mode and click "start".

</details>

<details>
<summary>Claude Desktop</summary>

Add to your `claude_desktop_config.json`:

**For Production:**

```json
{
  "mcpServers": {
    "go-docs": {
      "url": "https://go-docs.mastra.cloud/api/mcp/goDocsMcpServer/sse"
    }
  }
}
```

**For Development:**

```json
{
  "mcpServers": {
    "go-docs-dev": {
      "url": "http://localhost:4111/api/mcp/goDocsMcpServer/sse"
    }
  }
}
```

</details>

<details>
<summary>Zed</summary>

1. Open Zed settings (`Cmd/Ctrl` + `,`).
2. Edit `~/.config/zed/settings.json`:

```json
{
  "context_servers": {
    "go-docs": {
      "source": "custom",
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://go-docs.mastra.cloud/api/mcp/goDocsMcpServer/sse"
      ],
      "env": {}
    }
  }
}
```

3. Save, restart Zed, and confirm the server shows a green indicator in the Agent panel.

</details>

## CLI & Agent Configuration

<details>
<summary>Claude Code CLI (Anthropic)</summary>

- **Global settings** (`~/.claude/settings.json`):

  ```json
  {
    "mcpServers": {
      "go-docs": {
        "command": "npx",
        "args": [
          "-y",
          "mcp-remote",
          "https://go-docs.mastra.cloud/api/mcp/goDocsMcpServer/mcp"
        ]
      }
    }
  }
  ```

- **Command palette alternative:**

  ```bash
  claude mcp add go-docs --url https://go-docs.mastra.cloud/api/mcp/goDocsMcpServer/mcp
  ```

</details>

<details>
<summary>OpenAI Codex CLI</summary>

```bash
codex mcp add go-docs --url https://go-docs.mastra.cloud/api/mcp/goDocsMcpServer/sse
codex mcp list
```

</details>

<details>
<summary>Gemini CLI (Google)</summary>

1. Create or edit `~/.gemini/settings.json`:

   ```bash
   mkdir -p ~/.gemini
   nano ~/.gemini/settings.json
   ```

2. Add the configuration:

   ```json
   {
     "mcpServers": {
       "go-docs": {
         "httpUrl": "https://go-docs.mastra.cloud/api/mcp/goDocsMcpServer/mcp"
       }
     }
   }
   ```

3. Or use the npx command variant:

   ```json
   {
     "mcpServers": {
       "go-docs": {
         "command": "npx",
         "args": [
           "mcp-remote",
           "https://go-docs.mastra.cloud/api/mcp/goDocsMcpServer/mcp"
         ]
       }
     }
   }
   ```

</details>

## Verification & Quick Tests

```bash
# Test MCP connection
npx mcp-remote https://go-docs.mastra.cloud/api/mcp/goDocsMcpServer/mcp

# Check HTTP endpoint
curl -I https://go-docs.mastra.cloud/api/mcp/goDocsMcpServer/mcp

# Test SSE endpoint
curl -N https://go-docs.mastra.cloud/api/mcp/goDocsMcpServer/sse
```

## Available Tools

Once installed, your AI assistant will have access to these tools:

1. **fetchGoDoc** - Fetches documentation for any Go package from pkg.go.dev
2. **ask_goDocsAgent** - Ask the Go documentation expert questions about Go programming

## Example Usage

After installing the MCP server in your editor, you can ask your AI assistant:

- "How do I use the fmt package in Go?"
- "Show me examples of Go slices and arrays"
- "What are Go best practices for error handling?"
- "Explain Go interfaces with code examples"
- "How do I handle concurrency with goroutines?"
- "What's the difference between make and new in Go?"

## 📖 Programmatic Usage

```typescript
import { MCPClient } from "@mastra/mcp";

// Use environment variable for URL (supports both dev and prod)
const mcpUrl =
  process.env.MCP_SERVER_URL ||
  "http://localhost:4111/api/mcp/goDocsMcpServer/sse";

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

---

## 🚀 Quick Start (Local Development)

These instructions assume you have Bun (or Node 20+) installed and an API key for your chosen model provider.

1. Install dependencies:

```bash
bun install
```

2. Copy the example environment and add your API key(s):

```bash
cp .env.example .env
# Edit .env and add your API key(s)
```

3. Run in development mode:

```bash
bun run dev
```

4. Build and run production:

```bash
bun run build
bun run start
```

> **Note:** Studio (Mastra local UI) is available during dev at http://localhost:4111.

---

## 📦 Scripts

| Script           | Description                                  |
| ---------------- | -------------------------------------------- |
| `dev`            | Start Mastra in development mode             |
| `build`          | Build the Mastra project for production      |
| `start`          | Start the built Mastra server                |
| `check-versions` | Verify package.json and MCP server match     |
| `sync-versions`  | Sync version from package.json to MCP server |

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

| Variable                       | Description                            |
| ------------------------------ | -------------------------------------- |
| `OPENAI_API_KEY`               | API key for OpenAI                     |
| `GOOGLE_GENERATIVE_AI_API_KEY` | API key for Google Gemini (optional)   |
| `MCP_SERVER_URL`               | MCP server URL for programmatic access |

---

## 🗂️ Project Structure

```
src/
├─ mastra/
│  ├─ agents/
│  │  └─ go-docs-agent.ts    # AI agent for Go documentation
│  ├─ mcp/
│  │  └─ go-docs-server.ts   # MCP server configuration
│  ├─ tools/
│  │  └─ go-docs-tool.ts     # Documentation fetching tool
│  └─ index.ts               # Mastra configuration
scripts/
├─ check-versions.js         # Version verification script
└─ sync-versions.js          # Version synchronization script
```

---

## 🔧 How it Works

1. **MCP Protocol**: Communicates via HTTP SSE or HTTP transport
2. **Documentation Fetching**: The `go-docs-tool` fetches documentation from pkg.go.dev
3. **AI Agent**: Expert Go agent provides contextual answers with code examples
4. **Tool Exposure**: Makes Go documentation tools available to connected MCP clients

---

## 🛠️ Development

### Extending the MCP Server

To add new capabilities:

1. **Add Tools**: Create new tools in `src/mastra/tools/`
2. **Modify MCP Server**: Update `src/mastra/mcp/go-docs-server.ts`
3. **Test**: Use the MCP client testing configuration

### Building Custom Tools

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
    return { result: "output" };
  },
});
```

### Version Management

Versions are synchronized between `package.json` and the MCP server:

```bash
# Check if versions match
bun run check-versions

# Sync versions (package.json is source of truth)
bun run sync-versions
```

---

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repo and create a feature branch
2. Follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages
3. Add tests or a demo if you change behavior
4. Submit a PR describing your change

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## References

- [Mastra Documentation](https://mastra.ai/docs)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Go Official Documentation](https://go.dev/doc/)
- [pkg.go.dev](https://pkg.go.dev)
- [Go Best Practices](https://google.github.io/styleguide/go/best-practices.html)
- [Bun Runtime](https://bun.sh/docs)
