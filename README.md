# go-docs

![version](https://img.shields.io/github/v/tag/Michael-Obele/go-docs?label=version)

A Mastra-based agent project that powers an expert Go programming assistant. This project demonstrates how to build a Mastra agent that fetches Go documentation from pkg.go.dev and returns concise, well-formatted answers with examples.

---

## 🚀 Quick Start

These instructions assume you have Bun (or Node 20+) installed and an API key for your chosen model provider (OpenAI, Google Gemini, etc.). You can use Bun to run this project directly.

1. Install dependencies:

```bash
bun install
```

2. Copy the example environment and add your API key(s):

```bash
cp .env.example .env
# Edit .env and add your API key(s)
```

3. Run in development mode (uses Mastra CLI):

```bash
bun run dev
# OR
npm run dev
```

If you prefer to run the TypeScript entry directly:

```bash
bun run index.ts
```

4. Build and run production:

```bash
bun run build
bun run start
```

> Notes:

- Studio (Mastra local UI) is available during dev, usually at http://localhost:4111.
- The project uses Mastra's `mastra dev`, `mastra build`, and `mastra start` scripts configured in `package.json`.

---

## 🧭 Project Overview

This repository contains a Mastra agent that provides Go documentation via the `fetch_go_doc` tool.

- Entry point: `src/mastra/index.ts`
- Agent: `src/mastra/agents/go-docs-agent.ts`
- Tool that fetches pkg.go.dev: `src/mastra/tools/go-docs-tool.ts`
- mcp server definition: `src/mastra/mcp/go-docs-server.ts`

If you want to modify the agent's behavior, edit the `instructions` and `tools` passed to the `Agent` in `src/mastra/agents/go-docs-agent.ts`.

---

## 📦 Scripts

Available scripts defined in `package.json`:

```json
{
  "dev": "mastra dev",
  "build": "mastra build",
  "start": "mastra start"
}
```

You can use Bun or npm/yarn/pnpm to run these scripts — Bun will run scripts directly using `bun run <script>` (e.g. `bun run dev`).

---

## ⚙️ Environment Variables

This project uses a `.env` file for private keys and configuration. The repository includes a `.env.example` which you can copy to `.env` and edit:

```bash
cp .env.example .env
# add your API keys
```

Common environment variables you may need:

- `OPENAI_API_KEY` — API key for OpenAI
- (or) `GOOGLE_GENERATIVE_AI_API_KEY` — for Google Gemini, etc.

---

## 🗂️ Folder Structure

High-level layout:

```
src/
├─ mastra/
│  ├─ agents/
│  ├─ tools/
│  ├─ mcp/
│  └─ index.ts
```

---

## 🔖 Version and Tags

This README includes a version/badge that shows the latest Git tag—this requires creating and pushing a Git tag in the repository. If you want to set or update the version, either edit `package.json` or create a Git tag:

To add a version in `package.json` (recommended):

```bash
# using npm
npm pkg set version 0.1.0
```

To create and push a Git tag (recommended for releases):

```bash
git tag v0.1.0
git push origin v0.1.0
```

To get the version locally from `package.json`:

```bash
node -e "console.log(require('./package.json').version || 'No version set')"
# or
node -p "require('./package.json').version"
```

If you want to show a dynamic version badge on GitHub, use this markdown badge at the top of README (already included):

```md
![version](https://img.shields.io/github/v/tag/Michael-Obele/go-docs?label=version)
```

Note: Shields.io reads GitHub tags and releases. If there are no tags or releases in your repository, the badge will show ‘unknown’. Setting `package.json` version or tagging a release keeps users informed of the current version.

---

## 🧑‍💻 Development Notes

- The project uses `@mastra/core` and related packages; see Mastra docs for advanced configuration: https://mastra.ai/docs
- If you add or modify tools or agents, ensure they are registered in `src/mastra/index.ts`.
- Plugins such as `@mastra/libsql` are used for storage. Adjust `index.ts` storage URL to persist data on disk (for example `file:../mastra.db`).

---

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repo and create a feature branch
2. Add tests or a demo if you change behavior
3. Submit a PR describing your change

---

## License

This repository is currently configured as `private: true` in `package.json`. If you want to publish or make this repo public, add a `LICENSE` file and update `package.json` as needed.

---

## References

- Mastra docs: https://mastra.ai/docs
- Bun docs: https://bun.sh/docs
- pkg.go.dev: https://pkg.go.dev

---

If you'd like, I can also add a `version` field to `package.json` and a GitHub Actions workflow to automatically bump the tag on releases — tell me which workflow (semantic-release, standard-version, or manual tagging) you'd prefer and I’ll add it.

# go-docs

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.3.2. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
