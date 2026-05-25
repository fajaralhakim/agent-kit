# Agent Kit

Standalone CLI toolkit (`@agent-kit/cli`) for installing **stack-agnostic** AI agent context into any codebase — frontend, backend, mobile, or polyglot.

## Cursor Cloud specific instructions

### Prerequisites

- **Bun** is the package manager and runtime. Install via `curl -fsSL https://bun.sh/install | bash` if not present, then ensure `~/.bun/bin` is on `PATH`.
- **Node.js >= 20** is required (used as the CLI build target).

### Common commands

All commands run from the workspace root (`/workspace`):

| Task | Command |
|---|---|
| Install deps | `bun install` |
| Typecheck | `bun run typecheck` |
| Build CLI | `bun run build` |
| Run CLI (dev) | `bun run dev -- <command> [args]` |

There is no lint command configured at the workspace level. Typecheck (`tsc --noEmit`) is the primary static analysis.

### Testing the CLI end-to-end

The project has no automated test suite. To verify the CLI works against any project:

```bash
bun run dev -- analyze /path/to/any/project --json
bun run dev -- analyze /path/to/any/project --write --harness cursor
bun run dev -- doctor /path/to/any/project
```

`analyze` is the primary command. `init` only installs the generic `_core` context (no scaffolding).

### Gotchas

- `bun run dev` is a pass-through to `bun run packages/cli/src/index.ts`. Use `--` before CLI arguments (e.g., `bun run dev -- analyze ./foo`).
- The CLI resolves `profiles/` relative to its own source location. Running via `bun run dev` from the workspace root works correctly; running the built `dist/index.js` directly requires the `profiles/` directory to be a sibling of the CLI package.
- The `.cursor/mcp.json` example contains `YOUR_*` placeholder API keys (Atlassian OAuth, `FIGMA_API_TOKEN`) that must be replaced manually.
