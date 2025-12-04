# Changelog

All notable changes to Go Docs MCP Server will be documented in this file.


## [1.1.0](https://github.com/Michael-Obele/go-docs/compare/v1.0.0...v1.1.0) (2025-12-04)

### 🔧 Maintenance

* add conventional-changelog-cli (bun) and update manual-release workflow to use bun/bunx ([8f56350](https://github.com/Michael-Obele/go-docs/commit/8f56350bfa6d0f27b39ab26602c0f5b2959cc40d))
* **release:** add commit/push/tag flags to changelog script, add changelog verifier, and run verification in manual release workflow ([6a93021](https://github.com/Michael-Obele/go-docs/commit/6a93021c9a59eec413b826a643db78cc5eaf6934))
* **release:** add JS changelog tools and version compute scripts; add manual-release workflow; remove TS script ([3f00556](https://github.com/Michael-Obele/go-docs/commit/3f00556bb7eadf2586d8b0beda58168068556e1c))
* **release:** use semantic-release for version, enable JS changelog injection and SKIP_CHANGELOG flag ([ab0dc8a](https://github.com/Michael-Obele/go-docs/commit/ab0dc8ae1cb6c0fbabf6b3754b41389dcc5e45b6))
* remove .releaserc.json configuration file ([0fbf6b4](https://github.com/Michael-Obele/go-docs/commit/0fbf6b407efcdfa52b599d13db11d12cab448503))
* update manual release workflow to use bun for dependency installation and semantic-release execution ([d80480e](https://github.com/Michael-Obele/go-docs/commit/d80480ee29dd2ef6fa2f9a9943548bd3cc4da68b))

### 🚀 Features

* add conventional changelog support to package.json and bun.lock ([af1b040](https://github.com/Michael-Obele/go-docs/commit/af1b040cbf0bbb9cc20fbadeaccaa6079d051f6e))
* test changelog generation ([5acc3c2](https://github.com/Michael-Obele/go-docs/commit/5acc3c29bba17ca0b26288029f6b6153f7c8f73e))

# 1.0.0 (2025-12-03)

### Features

- add initial MCP server configuration in mcp.json ([3850edb](https://github.com/Michael-Obele/go-docs/commit/3850edb6278bd34b317d4d10e81245b136790784))
- add version synchronization scripts and update package.json ([e05cf22](https://github.com/Michael-Obele/go-docs/commit/e05cf224ffc84e9461ea240f2d990c27427d4b12))
- enhance README with detailed MCP server configuration for development and production ([c879a66](https://github.com/Michael-Obele/go-docs/commit/c879a66fdeb60be7a4c44ac44d1bec66230a5884))
- Implement Go Documentation MCP Server and Agent ([6a402fe](https://github.com/Michael-Obele/go-docs/commit/6a402fee0b629c816cad24e3e13b2e48f0c0f28a))
- initial project setup with semantic-release ([b4745e1](https://github.com/Michael-Obele/go-docs/commit/b4745e121b0e01086a301940270591c8de363b3e))
- update model to OpenAI GPT-5-nano for improved performance ([8c52705](https://github.com/Michael-Obele/go-docs/commit/8c52705786e3baa4c41111c0a2fce76b88b43566))

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-12-02

### Added

- **Go Documentation MCP Server**: Complete implementation of MCP server exposing Go documentation tools via Model Context Protocol
- **Go Documentation Agent**: AI-powered agent with expert knowledge of Go programming, idiomatic patterns, and best practices
- **Real-time Documentation Fetching**: Integration with pkg.go.dev for up-to-date Go package documentation
- **MCP Protocol Support**: HTTP SSE and HTTP transport support for seamless integration with MCP clients
- **Multi-Client Compatibility**: Works with Cursor, VSCode, Claude Desktop, Windsurf, and other MCP-compatible tools
- **Initial MCP Server Configuration**: Added mcp.json configuration file for local development
- **Development Environment**: Mastra CLI integration with dev, build, and start scripts
- **TypeScript Support**: Fully typed codebase with TypeScript

### Changed

- **Model Configuration**: Updated to use OpenAI GPT-5-nano for improved performance
- **Code Formatting**: Cleaned up imports and comments in index.ts

### Documentation

- **README**: Enhanced with detailed MCP server configuration for development and production
- **MCP Client Examples**: Added configuration examples for Cursor, VSCode, Claude Desktop

### Infrastructure

- **Semantic Release**: Initial project setup with semantic-release for automated versioning

---

## Pre-release Development

### Initial Commits (2025-12-02)

- `feat: enhance README with detailed MCP server configuration for development and production`
- `refactor: update README for clarity and enhance MCP server configuration details`
- `style: format imports and clean up comments in index.ts`
- `feat: add initial MCP server configuration in mcp.json`
- `feat: update model to OpenAI GPT-5-nano for improved performance`
- `feat: Implement Go Documentation MCP Server and Agent`
- `feat: initial project setup with semantic-release`

[1.0.0]: https://github.com/Michael-Obele/go-docs/releases/tag/v1.0.0
