# Tools

[← Back to Index](./index.md) | [← Architecture](./architecture.md)

## Overview

Tools are the primary way LLMs interact with the Go Documentation MCP Server. This document covers the `fetch_go_doc` tool implementation.

## fetch_go_doc Tool

### Purpose

Fetches real-time official Go documentation from pkg.go.dev or golang.org.

### Tool Definition

```typescript
// src/tools/goDocs.ts
import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import axios from "axios";
import * as cheerio from "cheerio";

const GoDocSchema = z.object({
  pkg: z
    .string()
    .describe("Go package path, e.g. 'fmt', 'net/http', 'context'"),
  section: z
    .enum(["auto", "overview", "functions", "types", "examples", "effective-go"])
    .optional()
    .default("auto")
    .describe("Section of documentation to fetch. Use 'auto' (default) to intelligently detect based on the query context"),
});

export const fetchGoDoc = createTool({
  id: "fetch_go_doc",
  description:
    "Fetches real-time official Go documentation from pkg.go.dev. Use this to get package docs, function signatures, type definitions, and examples.",
  inputSchema: GoDocSchema,
  execute: async ({ context }) => {
    const { pkg, section } = context;

    // Handle Effective Go separately (static content)
    if (section === "effective-go") {
      return await fetchEffectiveGo();
    }

    // Fetch from pkg.go.dev
    const url = `https://pkg.go.dev/${pkg}`;
    try {
      const { data } = await axios.get(url, { timeout: 8000 });
      const $ = cheerio.load(data);

      return parseGoDoc($, pkg, url, section);
    } catch (err: any) {
      return {
        error: `Failed to fetch ${pkg}: ${err.message}`,
        suggestion:
          "Try common packages: 'fmt', 'net/http', 'context', 'sync', 'io', 'os'",
      };
    }
  },
});
```

### Input Schema

| Field     | Type   | Required | Default  | Description                                                                         |
| --------- | ------ | -------- | -------- | ----------------------------------------------------------------------------------- |
| `pkg`     | string | ✅       | -        | Go package path (e.g., `fmt`, `net/http`, `encoding/json`)                          |
| `section` | enum   | ❌       | `"auto"` | Section to fetch: `auto`, `overview`, `functions`, `types`, `examples`, `effective-go` |

### Auto Section Detection

When `section` is set to `"auto"` (the default), the tool intelligently returns comprehensive documentation including:

- Package synopsis and description
- Key exported functions (with signatures)
- Key exported types
- Quick examples if available

This eliminates the need for LLMs to guess which section contains the information they need. The auto mode provides a complete picture that covers most use cases.

**When to use specific sections:**
- `functions` - When you need detailed function signatures and descriptions
- `types` - When you need type definitions and method sets
- `examples` - When you need code examples specifically
- `effective-go` - When asking about Go best practices (not package-specific)

### Output Schema

#### Success Response

```typescript
{
  title: string;        // Package title
  url: string;          // Source URL
  synopsis: string;     // Brief description
  description: string;  // Full overview
  exported: string[];   // List of exported identifiers
  note: string;         // Additional info
}
```

#### Error Response

```typescript
{
  error: string; // Error message
  suggestion: string; // Helpful suggestion
}
```

### Usage Examples

#### Basic Package Lookup

```
User: "What functions does the fmt package provide?"
LLM calls: fetch_go_doc({ pkg: "fmt", section: "overview" })
```

#### HTTP Package

```
User: "Show me how to create an HTTP handler in Go"
LLM calls: fetch_go_doc({ pkg: "net/http", section: "functions" })
```

#### Standard Library Exploration

```
User: "What's in the context package?"
LLM calls: fetch_go_doc({ pkg: "context" })
```

### Implementation Details

#### Parsing Functions

```typescript
function parseGoDoc(
  $: cheerio.CheerioAPI,
  pkg: string,
  url: string,
  section: string
) {
  const title = $("title").text().trim();
  const synopsis = $(".Documentation-overview .Documentation-synopsis")
    .text()
    .trim();
  const description = $(".Documentation-overview .Documentation-description")
    .text()
    .trim();

  // Extract exported types/functions from the index
  const exported = $(".Documentation-index a")
    .map((_, el) => $(el).text().trim())
    .get()
    .filter((t) => t && !t.startsWith("package"));

  return {
    title,
    url,
    synopsis: synopsis || "No synopsis available",
    description: description || "No description available",
    exported: exported.slice(0, 30), // Limit to prevent huge responses
    note: "This is live data from pkg.go.dev",
  };
}
```

#### Effective Go Handler

```typescript
async function fetchEffectiveGo() {
  return {
    content: "https://golang.org/doc/effective_go",
    markdown: `
# Effective Go Tips (Selected)

## Error Handling
- Errors are values: \`err != nil\`
- Use \`errors.Is\`, \`errors.As\`, \`fmt.Errorf("%w")\`

## Interfaces
- Prefer \`io.Reader\`/\`io.Writer\` interfaces
- Accept interfaces, return concrete types

## Resource Management
- Close resources in same function with \`defer\`
- Use \`sync.Pool\` for frequently allocated objects

## Concurrency
- Use context for cancellation
- Don't communicate by sharing memory; share memory by communicating

## Style
- Don't panic in libraries
- Keep functions short and focused

Full guide: https://golang.org/doc/effective_go
    `.trim(),
  };
}
```

## Tool Registration

Tools are registered with the MCPServer:

```typescript
// src/mastra/index.ts
import { MCPServer } from "@mastra/mcp";
import { fetchGoDoc } from "../tools/goDocs";

export const server = new MCPServer({
  name: "Go Docs MCP",
  version: "1.0.0",
  tools: { fetchGoDoc },
});
```

## Best Practices

### 1. Descriptive Tool IDs

Use clear, action-oriented IDs:

- ✅ `fetch_go_doc`
- ❌ `goDoc` or `docs`

### 2. Rich Descriptions

Help LLMs understand when to use the tool:

```typescript
description: "Fetches real-time official Go documentation from pkg.go.dev. Use this to get package docs, function signatures, type definitions, and examples.";
```

### 3. Validated Input

Always use Zod schemas with descriptions:

```typescript
pkg: z.string().describe("Go package path, e.g. 'fmt', 'net/http'");
```

### 4. Graceful Errors

Return helpful error messages:

```typescript
return {
  error: `Failed to fetch ${pkg}: ${err.message}`,
  suggestion: "Try common packages: 'fmt', 'net/http', 'context'",
};
```

### 5. Reasonable Limits

Prevent overly large responses:

```typescript
exported: exported.slice(0, 30); // Limit list size
```

## Testing

### Manual Testing

```bash
# Start development server
bun run dev

# Test via MCP client or direct HTTP
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{"method":"tools/call","params":{"name":"fetch_go_doc","arguments":{"pkg":"fmt"}}}'
```

### Unit Testing

```typescript
import { RuntimeContext } from "@mastra/core/runtime-context";
import { fetchGoDoc } from "./goDocs";

describe("fetchGoDoc", () => {
  it("fetches fmt package with auto section", async () => {
    const runtimeContext = new RuntimeContext();
    const result = await fetchGoDoc.execute({
      context: { pkg: "fmt", section: "auto" },
      runtimeContext,
    });

    expect(result.title).toContain("fmt");
    expect(result.exported).toContain("Println");
    expect(result.functions).toBeDefined(); // auto includes functions
  });

  it("fetches effective-go tips", async () => {
    const runtimeContext = new RuntimeContext();
    const result = await fetchGoDoc.execute({
      context: { pkg: "", section: "effective-go" },
      runtimeContext,
    });

    expect(result.markdown).toContain("Error Handling");
  });
});
```

---

[← Back to Index](./index.md) | [Next: Resources →](./resources.md)
