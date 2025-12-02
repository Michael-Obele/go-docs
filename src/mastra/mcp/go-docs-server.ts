import { MCPServer } from "@mastra/mcp";
import { fetchGoDoc } from "../tools/go-docs-tool";
import { goDocsAgent } from "../agents/go-docs-agent";

/**
 * Go Documentation MCP Server
 *
 * This server exposes Go documentation tools via the Model Context Protocol (MCP),
 * allowing any MCP-compatible client (Cursor, Claude Desktop, VS Code Copilot, Windsurf, etc.)
 * to access real-time Go documentation from pkg.go.dev.
 *
 * Tools exposed:
 * - fetch_go_doc: Fetches documentation for any Go package
 *
 * Agents exposed as tools:
 * - ask_goDocsAgent: Ask the Go documentation expert questions
 *
 * Usage in MCP clients:
 * ```json
 * {
 *   "mcpServers": {
 *     "go-docs": {
 *       "type": "http/sse",
 *       "url": "https://your-domain.mastra.cloud/mcp"
 *     }
 *   }
 * }
 * ```
 */
export const goDocsMcpServer = new MCPServer({
  name: "Go Documentation MCP Server",
  version: "1.0.0",
  description:
    "Real-time Go documentation from pkg.go.dev - fetch package docs, function signatures, type definitions, and Effective Go best practices.",
  tools: {
    fetchGoDoc,
  },
  agents: {
    goDocsAgent,
  },
});

// Export for standalone MCP server usage (stdio mode)
export async function startStdio() {
  await goDocsMcpServer.startStdio();
}
