# Scraping Implementation

[← Back to Index](./index.md) | [← Resources](./resources.md)

## Overview

This document details how we scrape Go documentation from pkg.go.dev using cheerio and axios - a pure JavaScript approach that works perfectly in Mastra Cloud.

## Why Cheerio + Axios?

### Cheerio

- jQuery-like API for server-side HTML parsing
- Fast and lightweight (~85KB)
- No browser dependencies
- Works in pure Node.js

### Axios

- Promise-based HTTP client
- Timeout support
- Error handling
- Works with any HTTP endpoint

## pkg.go.dev Structure

### Verified HTML Structure (Dec 2025)

Based on live scraping of pkg.go.dev, here's the HTML structure:

```html
<!-- Page Title -->
<title>fmt package - fmt - Go Packages</title>

<!-- Documentation Overview -->
<section class="Documentation-overview">
  <h2>Overview</h2>
  <p class="Documentation-synopsis">Package fmt implements formatted I/O...</p>
  <div class="Documentation-description">
    <!-- Detailed description -->
  </div>
</section>

<!-- Index (Table of Contents) -->
<nav class="Documentation-index">
  <h2>Index</h2>
  <ul>
    <li><a href="#Append">func Append</a></li>
    <li><a href="#Printf">func Printf</a></li>
    <!-- ... more exports -->
  </ul>
</nav>

<!-- Functions Section -->
<section id="pkg-functions">
  <h3>Functions</h3>
  <div class="Documentation-function">
    <h4>func Printf</h4>
    <pre><code>func Printf(format string, a ...any) (n int, err error)</code></pre>
    <p>Printf formats according to a format specifier...</p>
  </div>
</section>

<!-- Types Section -->
<section id="pkg-types">
  <h3>Types</h3>
  <!-- Type definitions -->
</section>
```

## Scraping Implementation

### Main Scraping Function

```typescript
// src/tools/goDocs.ts
import axios from "axios";
import * as cheerio from "cheerio";

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

async function scrapeGoDoc(pkg: string, section: string): Promise<GoDocResult> {
  const url = `https://pkg.go.dev/${pkg}`;

  const { data } = await axios.get(url, {
    timeout: 8000,
    headers: {
      "User-Agent": "Go-Docs-MCP/1.0 (Mastra Cloud)",
      Accept: "text/html",
    },
  });

  const $ = cheerio.load(data);

  // Extract basic info
  const title = $("title").text().trim();
  const synopsis = $(".Documentation-synopsis").first().text().trim();
  const description = $(".Documentation-description").first().text().trim();

  // Extract exported identifiers from index
  const exported = $(".Documentation-index a")
    .map((_, el) => $(el).text().trim())
    .get()
    .filter((t) => t && !t.startsWith("package"));

  const result: GoDocResult = {
    title,
    url,
    synopsis: synopsis || "No synopsis available",
    description: description || "No description available",
    exported: exported.slice(0, 30),
    note: "Live data from pkg.go.dev",
  };

  // Add section-specific data
  if (section === "functions") {
    result.functions = extractFunctions($);
  } else if (section === "types") {
    result.types = extractTypes($);
  }

  return result;
}
```

### CSS Selectors Reference

| Data          | Selector                                 | Notes                 |
| ------------- | ---------------------------------------- | --------------------- |
| Page title    | `title`                                  | Contains package name |
| Synopsis      | `.Documentation-synopsis`                | First paragraph       |
| Description   | `.Documentation-description`             | Full overview         |
| Exported list | `.Documentation-index a`                 | Links to exports      |
| Functions     | `#pkg-functions .Documentation-function` | Function blocks       |
| Types         | `#pkg-types .Documentation-type`         | Type definitions      |
| Constants     | `#pkg-constants`                         | Constant definitions  |
| Variables     | `#pkg-variables`                         | Variable definitions  |
| Examples      | `#pkg-examples`                          | Code examples         |

### Extracting Functions

```typescript
function extractFunctions($: cheerio.CheerioAPI): FunctionInfo[] {
  const functions: FunctionInfo[] = [];

  $(".Documentation-function").each((_, el) => {
    const $el = $(el);
    const name = $el.find("h4").text().replace("func ", "").trim();
    const signature = $el.find("pre code").first().text().trim();
    const description = $el.find("p").first().text().trim();

    if (name) {
      functions.push({ name, signature, description });
    }
  });

  return functions.slice(0, 20); // Limit to prevent huge responses
}
```

### Extracting Types

```typescript
function extractTypes($: cheerio.CheerioAPI): TypeInfo[] {
  const types: TypeInfo[] = [];

  $(".Documentation-type").each((_, el) => {
    const $el = $(el);
    const name = $el.find("h4").text().replace("type ", "").trim();
    const definition = $el.find("pre code").first().text().trim();
    const description = $el.find("p").first().text().trim();

    if (name) {
      types.push({ name, definition, description });
    }
  });

  return types.slice(0, 20);
}
```

## Error Handling

### Network Errors

```typescript
try {
  const { data } = await axios.get(url, { timeout: 8000 });
  // ...
} catch (err: any) {
  if (err.code === "ECONNREFUSED") {
    return {
      error: "Cannot connect to pkg.go.dev",
      suggestion: "Check network",
    };
  }
  if (err.code === "ETIMEDOUT") {
    return { error: "Request timed out", suggestion: "Try again later" };
  }
  if (err.response?.status === 404) {
    return {
      error: `Package not found: ${pkg}`,
      suggestion: "Check package name",
    };
  }
  return { error: `Unexpected error: ${err.message}` };
}
```

### Invalid Package Names

```typescript
// Validate package path format
const VALID_PKG_REGEX = /^[a-z0-9]+([\-._/][a-z0-9]+)*$/i;

if (!VALID_PKG_REGEX.test(pkg)) {
  return {
    error: "Invalid package path format",
    suggestion: "Use format like 'fmt', 'net/http', 'golang.org/x/net'",
  };
}
```

## Performance Considerations

### Timeouts

```typescript
const { data } = await axios.get(url, {
  timeout: 8000, // 8 seconds max
});
```

### Response Size Limiting

```typescript
// Limit exported items
exported: exported.slice(0, 30);

// Limit function/type details
functions.slice(0, 20);
types.slice(0, 20);
```

### Parallel Requests (If Needed)

```typescript
// For multiple packages at once
async function fetchMultiplePackages(packages: string[]) {
  const results = await Promise.allSettled(
    packages.map((pkg) => scrapeGoDoc(pkg, "overview"))
  );

  return results.map((r, i) => ({
    pkg: packages[i],
    result: r.status === "fulfilled" ? r.value : { error: r.reason.message },
  }));
}
```

## Testing Scraping

### Manual Testing

```typescript
// Test script
import * as cheerio from "cheerio";
import axios from "axios";

async function test() {
  const url = "https://pkg.go.dev/fmt";
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);

  console.log("Title:", $("title").text());
  console.log("Synopsis:", $(".Documentation-synopsis").text());
  console.log("Exports:", $(".Documentation-index a").length);
}

test();
```

### Sample Output

```json
{
  "title": "fmt package - fmt - Go Packages",
  "url": "https://pkg.go.dev/fmt",
  "synopsis": "Package fmt implements formatted I/O with functions analogous to C's printf and scanf.",
  "description": "The format 'verbs' are derived from C's but are simpler...",
  "exported": [
    "Append",
    "Appendf",
    "Appendln",
    "Errorf",
    "FormatString",
    "Fprint",
    "Fprintf",
    "Fprintln",
    "Fscan",
    "Fscanf",
    "Fscanln",
    "Print",
    "Printf",
    "Println",
    "Scan",
    "Scanf",
    "Scanln",
    "Sprint",
    "Sprintf",
    "Sprintln",
    "Sscan",
    "Sscanf",
    "Sscanln",
    "Formatter",
    "GoStringer",
    "ScanState",
    "Scanner",
    "State",
    "Stringer"
  ],
  "note": "Live data from pkg.go.dev"
}
```

## Potential Improvements

### 1. Caching

```typescript
import NodeCache from "node-cache";

const cache = new NodeCache({ stdTTL: 3600 }); // 1 hour

async function scrapeWithCache(pkg: string) {
  const cached = cache.get(pkg);
  if (cached) return cached;

  const result = await scrapeGoDoc(pkg, "overview");
  cache.set(pkg, result);
  return result;
}
```

### 2. Rate Limiting

```typescript
import Bottleneck from "bottleneck";

const limiter = new Bottleneck({
  maxConcurrent: 2,
  minTime: 500, // 500ms between requests
});

const throttledScrape = limiter.wrap(scrapeGoDoc);
```

### 3. Retry Logic

```typescript
import axiosRetry from "axios-retry";

axiosRetry(axios, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return (
      axiosRetry.isNetworkOrIdempotentRequestError(error) ||
      error.response?.status === 429
    ); // Rate limited
  },
});
```

---

[← Back to Index](./index.md) | [Next: Deployment →](./deployment.md)
