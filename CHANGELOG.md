# 1.0.0 (2025-12-03)


### Features

* add initial MCP server configuration in mcp.json ([3850edb](https://github.com/Michael-Obele/go-docs/commit/3850edb6278bd34b317d4d10e81245b136790784))
* add version synchronization scripts and update package.json ([e05cf22](https://github.com/Michael-Obele/go-docs/commit/e05cf224ffc84e9461ea240f2d990c27427d4b12))
* enhance README with detailed MCP server configuration for development and production ([c879a66](https://github.com/Michael-Obele/go-docs/commit/c879a66fdeb60be7a4c44ac44d1bec66230a5884))
* Implement Go Documentation MCP Server and Agent ([6a402fe](https://github.com/Michael-Obele/go-docs/commit/6a402fee0b629c816cad24e3e13b2e48f0c0f28a))
* initial project setup with semantic-release ([b4745e1](https://github.com/Michael-Obele/go-docs/commit/b4745e121b0e01086a301940270591c8de363b3e))
* update model to OpenAI GPT-5-nano for improved performance ([8c52705](https://github.com/Michael-Obele/go-docs/commit/8c52705786e3baa4c41111c0a2fce76b88b43566))

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
