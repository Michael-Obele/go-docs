#!/usr/bin/env node

/**
 * Version Sync Script
 *
 * Synchronizes the version from package.json to the MCP server configuration.
 * The package.json version is treated as the source of truth.
 *
 * Usage: node scripts/sync-versions.js
 */

import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");

// Read package.json
const packageJsonPath = join(rootDir, "package.json");
const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
const packageVersion = packageJson.version;

// Read MCP server file
const mcpServerPath = join(rootDir, "src/mastra/mcp/go-docs-server.ts");
let mcpServerContent = readFileSync(mcpServerPath, "utf8");

// Extract current version from MCPServer configuration
const versionMatch = mcpServerContent.match(/version:\s*["']([^"']+)["']/);
const currentMcpVersion = versionMatch ? versionMatch[1] : null;

console.log("🔄 Version Sync");
console.log("===============");
console.log(`Source (package.json):   ${packageVersion}`);
console.log(`Target (MCP server):     ${currentMcpVersion || "Not found"}`);

if (currentMcpVersion === packageVersion) {
  console.log("\n✅ Versions are already synchronized!");
  process.exit(0);
}

// Update the version in MCP server file
mcpServerContent = mcpServerContent.replace(
  /version:\s*["'][^"']+["']/,
  `version: "${packageVersion}"`
);

writeFileSync(mcpServerPath, mcpServerContent, "utf8");

console.log(
  `\n✅ Updated MCP server version: ${currentMcpVersion} → ${packageVersion}`
);
console.log("   File: src/mastra/mcp/go-docs-server.ts");
