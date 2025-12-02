# Resources

[← Back to Index](./index.md) | [← Tools](./tools.md)

## Overview

MCP Resources are static or semi-static content that servers expose via URIs. Unlike tools (which are functions LLMs call), resources are content that can be read directly.

## What Are MCP Resources?

Resources represent data that an MCP server wants to make available:

- File contents
- Static documentation
- Configuration data
- Curated knowledge

Resources are identified by URIs like:

- `docs://go/effective-go`
- `file:///docs/readme.md`
- `config://app/settings`

## Effective Go Resource

### Purpose

Provides curated Effective Go tips and best practices without needing to fetch from external sources.

### Resource Definition

```typescript
// src/resources/effectiveGo.ts
import type {
  MCPServerResources,
  Resource,
  MCPServerResourceContent,
} from "@mastra/mcp";

const EFFECTIVE_GO_CONTENT = `
# Effective Go - Best Practices

## Formatting
- Use \`gofmt\` - Go has a single, canonical style
- No tabs vs spaces debates - \`gofmt\` handles it

## Commentary
- Every exported name should have a doc comment
- Comments are complete sentences
- Begin with the name being declared: \`// Printf formats...\`

## Names
- Use MixedCaps or mixedCaps (not snake_case)
- Acronyms should be all caps: \`HTTPServer\`, \`XMLParser\`
- Short names are fine in limited scope: \`i\`, \`n\`, \`err\`

## Semicolons
- Lexer inserts semicolons automatically
- Opening brace must be on same line as control statement

## Control Structures
- No \`do\` or \`while\` - just \`for\`
- \`if\` can have init statement: \`if err := doThing(); err != nil {}\`
- \`switch\` doesn't need explicit \`break\`

## Functions
- Multiple return values: \`func (f *File) Write(b []byte) (n int, err error)\`
- Named return values document meaning
- \`defer\` for cleanup (LIFO order)

## Data
- \`new(T)\` allocates zeroed storage, returns \`*T\`
- \`make(T, args)\` for slices, maps, channels only
- Arrays are values; slices are references

## Initialization
- \`init()\` functions run after all variable declarations
- Multiple init functions per file allowed (run in order)

## Methods
- Pointer receivers can modify; value receivers cannot
- Consistency: if one method needs pointer receiver, all should use it

## Interfaces
- Implicit satisfaction - no \`implements\` keyword
- Accept interfaces, return concrete types
- Small interfaces: \`io.Reader\`, \`io.Writer\` are one method

## Errors
- Errors are values: \`if err != nil\`
- Custom error types implement \`error\` interface
- Wrap with context: \`fmt.Errorf("failed to X: %w", err)\`
- Use \`errors.Is\` and \`errors.As\` for checking

## Concurrency
- Don't communicate by sharing memory; share memory by communicating
- Goroutines are cheap - use them
- Channels for synchronization: \`done := make(chan bool)\`

## Context
- \`context.Context\` for cancellation and deadlines
- First parameter by convention: \`func DoWork(ctx context.Context, ...)\`
- Don't store contexts in structs

## Panic and Recover
- \`panic\` for unrecoverable errors
- Don't panic in libraries
- \`recover\` only works in deferred functions

## Full Guide
https://golang.org/doc/effective_go

## Other Resources
- Go Proverbs: https://go-proverbs.github.io/
- Code Review Comments: https://go.dev/wiki/CodeReviewComments
- Go Blog: https://go.dev/blog/
`.trim();

export const effectiveGoResources: MCPServerResources = {
  listResources: async (): Promise<Resource[]> => {
    return [
      {
        uri: "docs://go/effective-go",
        name: "Effective Go",
        description: "Official Go style guide and best practices",
        mimeType: "text/markdown",
      },
      {
        uri: "docs://go/proverbs",
        name: "Go Proverbs",
        description: "Rob Pike's Go Proverbs",
        mimeType: "text/markdown",
      },
    ];
  },

  getResourceContent: async ({ uri }): Promise<MCPServerResourceContent> => {
    if (uri === "docs://go/effective-go") {
      return { text: EFFECTIVE_GO_CONTENT };
    }
    if (uri === "docs://go/proverbs") {
      return { text: GO_PROVERBS };
    }
    throw new Error(`Resource not found: ${uri}`);
  },

  resourceTemplates: async () => [],
};
```

### Go Proverbs Resource

```typescript
const GO_PROVERBS = `
# Go Proverbs - Rob Pike

1. Don't communicate by sharing memory, share memory by communicating.
2. Concurrency is not parallelism.
3. Channels orchestrate; mutexes serialize.
4. The bigger the interface, the weaker the abstraction.
5. Make the zero value useful.
6. interface{} says nothing.
7. Gofmt's style is no one's favorite, yet gofmt is everyone's favorite.
8. A little copying is better than a little dependency.
9. Syscall must always be guarded with build tags.
10. Cgo must always be guarded with build tags.
11. Cgo is not Go.
12. With the unsafe package there are no guarantees.
13. Clear is better than clever.
14. Reflection is never clear.
15. Errors are values.
16. Don't just check errors, handle them gracefully.
17. Design the architecture, name the components, document the details.
18. Documentation is for users.
19. Don't panic.

Source: https://go-proverbs.github.io/
`.trim();
```

## Resource Registration

Resources are registered with the MCPServer:

```typescript
// src/mastra/index.ts
import { MCPServer } from "@mastra/mcp";
import { effectiveGoResources } from "../resources/effectiveGo";

export const server = new MCPServer({
  name: "Go Docs MCP",
  version: "1.0.0",
  tools: {
    /* ... */
  },
  resources: effectiveGoResources,
});
```

## Accessing Resources

### From MCP Client

```typescript
// List available resources
const resources = await client.resources.list();
// Returns: { "go-docs": [{ uri: "docs://go/effective-go", ... }] }

// Read specific resource
const content = await client.resources.read(
  "go-docs",
  "docs://go/effective-go"
);
// Returns: { contents: [{ text: "# Effective Go..." }] }
```

### Resource URIs

| URI                      | Description                 |
| ------------------------ | --------------------------- |
| `docs://go/effective-go` | Effective Go best practices |
| `docs://go/proverbs`     | Rob Pike's Go Proverbs      |

## Resource Templates (Future)

Resource templates allow dynamic URIs:

```typescript
resourceTemplates: async () => [
  {
    uriTemplate: "docs://go/pkg/{package}",
    name: "Package Documentation",
    description: "Documentation for a specific Go package",
    mimeType: "text/markdown",
  },
];
```

This would allow URIs like:

- `docs://go/pkg/fmt`
- `docs://go/pkg/net/http`

## Benefits of Resources vs Tools

| Aspect    | Resources           | Tools                    |
| --------- | ------------------- | ------------------------ |
| Purpose   | Static content      | Dynamic operations       |
| Caching   | Can be cached       | Each call is fresh       |
| LLM Usage | Context/reference   | Action execution         |
| Example   | "Effective Go tips" | "Fetch fmt package docs" |

## Best Practices

### 1. Use Clear URIs

```typescript
// Good
uri: "docs://go/effective-go";
uri: "docs://go/pkg/fmt";

// Avoid
uri: "resource-1";
uri: "data";
```

### 2. Include Metadata

```typescript
{
  uri: "docs://go/effective-go",
  name: "Effective Go",           // Human-readable name
  description: "...",             // What this resource contains
  mimeType: "text/markdown",      // Content type
}
```

### 3. Keep Resources Focused

Each resource should have a single, clear purpose:

- ✅ Effective Go tips
- ✅ Go Proverbs
- ❌ "All Go Documentation" (too broad)

### 4. Update Notifications

If resources change, notify clients:

```typescript
// When Effective Go content is updated
await server.resources.notifyUpdated({ uri: "docs://go/effective-go" });

// When new resources are added
await server.resources.notifyListChanged();
```

---

[← Back to Index](./index.md) | [Next: Scraping →](./scraping.md)
