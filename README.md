# Agent Kit

Standalone toolkit for bootstrapping **AI agent context** (rules, skills, AGENTS.md, MCP) and **slim Next.js app architecture** for new projects.

## Install

```bash
bun install
bun run build
```

Run locally:

```bash
bun run dev -- init ./my-app --profile nextjs
```

Or after publishing:

```bash
bunx @agent-kit/cli init ./my-app --profile nextjs
```

## Commands

| Command                           | Description                                                         |
| --------------------------------- | ------------------------------------------------------------------- |
| `agent-kit init [path]`           | New project: scaffold + agent context. Existing: agent context only |
| `agent-kit init --profile nextjs` | Next.js slim starter + agent context                                |
| `agent-kit add shadcn`            | Add shadcn skill + MCP entry                                        |
| `agent-kit add context7`          | Add Context7 MCP entry                                              |
| `agent-kit doctor`                | Validate installation                                               |

## After init

1. `cd my-app && npm install`
2. Edit `.cursor/mcp.json` — replace `YOUR_*` with API keys
3. `npm run dev`

## Structure

```
agent-kit/
├── packages/cli/       # @agent-kit/cli
├── profiles/           # _core, nextjs, vite-react, addons/
├── templates/nextjs/   # Slim Next.js starter
└── docs/
```

## License

MIT
