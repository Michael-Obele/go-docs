import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import axios from "axios";
import * as cheerio from "cheerio";

// Type definitions
interface FunctionInfo {
  name: string;
  signature: string;
  description: string;
}

interface TypeInfo {
  name: string;
  definition: string;
  description: string;
}

interface GoDocResult {
  title: string;
  url: string;
  synopsis: string;
  description: string;
  exported: string[];
  functions?: FunctionInfo[];
  types?: TypeInfo[];
  note: string;
}

interface GoDocError {
  error: string;
  suggestion: string;
}

// Effective Go static content
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
- Use \`context.Context\` for cancellation and deadlines
- First parameter in functions: \`func DoSomething(ctx context.Context, ...)\`
- Don't store contexts in structs

## Testing
- Test files end with \`_test.go\`
- Test functions start with \`Test\`: \`func TestMyFunction(t *testing.T)\`
- Use \`t.Run\` for subtests
- Benchmarks start with \`Benchmark\`

## Documentation
- Package comments appear at top of any file
- Use \`//\` comments, not \`/* */\` for most cases
- Run \`go doc\` to view documentation
`;

// Schema for the tool input
const GoDocSchema = z.object({
  pkg: z
    .string()
    .describe("Go package path, e.g. 'fmt', 'net/http', 'context', 'encoding/json'"),
  section: z
    .enum(["auto", "overview", "functions", "types", "examples", "effective-go"])
    .optional()
    .default("auto")
    .describe(
      "Section of documentation to fetch. Use 'auto' (default) to intelligently detect based on the query context"
    ),
});

// Helper function to extract functions from the page
function extractFunctions($: cheerio.CheerioAPI): FunctionInfo[] {
  const functions: FunctionInfo[] = [];
  
  // Try different selectors for function documentation
  $(".Documentation-function, [data-kind='function'], .Documentation h4").each((_, el) => {
    const $el = $(el);
    const name = $el.find("h4, .Documentation-functionHeader").first().text().trim() ||
                 $el.text().trim();
    
    if (name.startsWith("func ")) {
      const signature = name;
      const description = $el.next("p").text().trim() || 
                         $el.find(".Documentation-functionBody p").first().text().trim() ||
                         "";
      
      if (signature) {
        functions.push({
          name: signature.replace(/^func\s+/, "").split("(")[0],
          signature,
          description: description.slice(0, 200) + (description.length > 200 ? "..." : ""),
        });
      }
    }
  });

  // Also try to get functions from the index
  if (functions.length === 0) {
    $('a[href^="#"][href*="func"]').each((_, el) => {
      const text = $(el).text().trim();
      if (text.startsWith("func ")) {
        functions.push({
          name: text.replace(/^func\s+/, "").split("(")[0],
          signature: text,
          description: "",
        });
      }
    });
  }

  return functions;
}

// Helper function to extract types from the page
function extractTypes($: cheerio.CheerioAPI): TypeInfo[] {
  const types: TypeInfo[] = [];
  
  $(".Documentation-type, [data-kind='type']").each((_, el) => {
    const $el = $(el);
    const name = $el.find("h4, .Documentation-typeHeader").first().text().trim();
    const definition = $el.find("pre, code").first().text().trim().slice(0, 300);
    const description = $el.find("p").first().text().trim().slice(0, 200);
    
    if (name) {
      types.push({
        name: name.replace(/^type\s+/, "").split(" ")[0],
        definition: definition || name,
        description,
      });
    }
  });

  // Also try to get types from the index
  if (types.length === 0) {
    $('a[href^="#"][href*="type"]').each((_, el) => {
      const text = $(el).text().trim();
      if (text.startsWith("type ")) {
        types.push({
          name: text.replace(/^type\s+/, "").split(" ")[0],
          definition: text,
          description: "",
        });
      }
    });
  }

  return types;
}

// Main parsing function
function parseGoDoc(
  $: cheerio.CheerioAPI,
  pkg: string,
  url: string,
  section: string
): GoDocResult {
  // Extract basic info
  const title = $("title").text().trim() || `Package ${pkg}`;
  
  // Try multiple selectors for synopsis
  const synopsis =
    $(".Documentation-overview .Documentation-synopsis").first().text().trim() ||
    $(".Documentation-synopsis").first().text().trim() ||
    $('[data-kind="doc"] p').first().text().trim() ||
    $(".go-Main-content p").first().text().trim() ||
    "No synopsis available";

  // Try multiple selectors for description
  const description =
    $(".Documentation-description").first().text().trim() ||
    $(".Documentation-overview").first().text().trim().slice(0, 500) ||
    synopsis;

  // Extract exported identifiers from index
  const exported: string[] = [];
  $(".Documentation-index a, nav.Documentation-index a, [class*='Index'] a").each((_, el) => {
    const text = $(el).text().trim();
    if (text && !text.startsWith("package") && !text.includes("...")) {
      exported.push(text);
    }
  });

  // Build result
  const result: GoDocResult = {
    title,
    url,
    synopsis: synopsis || "No synopsis available",
    description: description.slice(0, 800) || "No description available",
    exported: exported.slice(0, 50),
    note: "Live data from pkg.go.dev",
  };

  // Add section-specific data
  if (section === "auto" || section === "overview") {
    result.functions = extractFunctions($).slice(0, 15);
    result.types = extractTypes($).slice(0, 15);
  } else if (section === "functions") {
    result.functions = extractFunctions($);
  } else if (section === "types") {
    result.types = extractTypes($);
  }

  return result;
}

// Fetch Effective Go content
async function fetchEffectiveGo(): Promise<GoDocResult> {
  return {
    title: "Effective Go",
    url: "https://go.dev/doc/effective_go",
    synopsis: "Tips for writing clear, idiomatic Go code",
    description: EFFECTIVE_GO_CONTENT,
    exported: [
      "Formatting",
      "Commentary",
      "Names",
      "Control Structures",
      "Functions",
      "Data",
      "Interfaces",
      "Errors",
      "Concurrency",
      "Context",
      "Testing",
    ],
    note: "Curated Effective Go best practices",
  };
}

// Main tool export
export const fetchGoDoc = createTool({
  id: "fetch_go_doc",
  description:
    "Fetches real-time official Go documentation from pkg.go.dev. Use this to get package docs, function signatures, type definitions, and examples. Supports standard library packages like 'fmt', 'net/http', 'context', 'encoding/json', and third-party packages.",
  inputSchema: GoDocSchema,
  execute: async ({ context }): Promise<GoDocResult | GoDocError> => {
    const { pkg, section = "auto" } = context;

    // Handle Effective Go separately (static content)
    if (section === "effective-go") {
      return await fetchEffectiveGo();
    }

    // Clean the package path
    const cleanPkg = pkg.trim().replace(/^\/+|\/+$/g, "");
    
    if (!cleanPkg) {
      return {
        error: "Package path is required",
        suggestion: "Try common packages: 'fmt', 'net/http', 'context', 'sync', 'io', 'os'",
      };
    }

    // Fetch from pkg.go.dev
    const url = `https://pkg.go.dev/${cleanPkg}`;
    
    try {
      const { data } = await axios.get(url, {
        timeout: 10000,
        headers: {
          "User-Agent": "Go-Docs-MCP/1.0 (Mastra Cloud)",
          Accept: "text/html",
        },
      });

      const $ = cheerio.load(data);

      // Check if package was found
      const notFound = $(".NotFound, .Error").length > 0 ||
                       $("title").text().toLowerCase().includes("not found");
      
      if (notFound) {
        return {
          error: `Package '${cleanPkg}' not found on pkg.go.dev`,
          suggestion: `Check the package path. Try 'fmt', 'net/http', 'encoding/json', or search at https://pkg.go.dev/search?q=${encodeURIComponent(cleanPkg)}`,
        };
      }

      return parseGoDoc($, cleanPkg, url, section);
    } catch (err: unknown) {
      const error = err as Error;
      
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        return {
          error: `Package '${cleanPkg}' not found`,
          suggestion: `Try common packages: 'fmt', 'net/http', 'context', 'sync', 'io', 'os', 'encoding/json'`,
        };
      }

      return {
        error: `Failed to fetch '${cleanPkg}': ${error.message}`,
        suggestion: "Check your internet connection or try again. Common packages: 'fmt', 'net/http', 'context'",
      };
    }
  },
});
