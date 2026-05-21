# Agent Kit

Standalone CLI toolkit (`@agent-kit/cli`) for bootstrapping AI agent context and slim Next.js app architecture.

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

The project has no automated test suite. To verify the CLI works:

```bash
bun run dev -- init /tmp/test-app --profile nextjs
bun run dev -- doctor /tmp/test-app
bun run dev -- add shadcn /tmp/test-app
```

To verify the scaffolded Next.js template runs:

```bash
cd /tmp/test-app && npm install && npm run dev
```

### Gotchas

- `bun run dev` is a pass-through to `bun run packages/cli/src/index.ts`. Use `--` before CLI arguments (e.g., `bun run dev -- init ./foo`).
- The CLI resolves profile/template paths relative to its own source location. Running via `bun run dev` from the workspace root works correctly; running the built `dist/index.js` directly requires the `profiles/` and `templates/` directories to be siblings of the CLI package.
- The `.cursor/mcp.json` generated in scaffolded projects contains `YOUR_*` placeholder API keys that must be replaced manually.
