#!/usr/bin/env node

/**
 * Version Check Script
 *
 * Verifies that the version in package.json matches the version in the MCP server configuration.
 * This ensures consistency between the npm package version and the MCP server version.
 *
 * Usage: node scripts/check-versions.js
 * Exit codes:
 *   0 - Versions match
 *   1 - Versions mismatch
 */

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");

// Read package.json
const packageJsonPath = join(rootDir, "package.json");
const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
const packageVersion = packageJson.version;

// Read MCP server file and extract version
const mcpServerPath = join(rootDir, "src/mastra/mcp/go-docs-server.ts");
const mcpServerContent = readFileSync(mcpServerPath, "utf8");

// Extract version from MCPServer configuration
const versionMatch = mcpServerContent.match(/version:\s*["']([^"']+)["']/);
const mcpVersion = versionMatch ? versionMatch[1] : null;

console.log("📦 Version Check");
console.log("================");
console.log(`package.json version:    ${packageVersion}`);
console.log(`MCP server version:      ${mcpVersion || "Not found"}`);

if (!mcpVersion) {
  console.error("\n❌ Could not find version in MCP server file");
  process.exit(1);
}

if (packageVersion !== mcpVersion) {
  console.error(`\n❌ Version mismatch detected!`);
  console.error(`   package.json: ${packageVersion}`);
  console.error(`   MCP server:   ${mcpVersion}`);
  console.error('\nRun "npm run sync-versions" to synchronize versions.');
  process.exit(1);
}

console.log("\n✅ Versions are synchronized!");
process.exit(0);
