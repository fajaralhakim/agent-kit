# Agent Kit — Install Prompts

Install Agent Kit into **any existing project** by pasting one prompt in your agent chat from the project root.

**Base URL:** `https://raw.githubusercontent.com/fajaralhakim/agent-kit/refs/heads/main`

## Copy-paste prompts

| Agent | Prompt |
|-------|--------|
| **Cursor** | `Fetch and follow instructions from https://raw.githubusercontent.com/fajaralhakim/agent-kit/refs/heads/main/docs/install/cursor.md` |
| **OpenCode** | `Fetch and follow instructions from https://raw.githubusercontent.com/fajaralhakim/agent-kit/refs/heads/main/docs/install/opencode.md` |
| **Claude Code** | `Fetch and follow instructions from https://raw.githubusercontent.com/fajaralhakim/agent-kit/refs/heads/main/docs/install/claude-code.md` |
| **Antigravity** | `Fetch and follow instructions from https://raw.githubusercontent.com/fajaralhakim/agent-kit/refs/heads/main/docs/install/antigravity.md` |
| **GitHub Copilot** | `Fetch and follow instructions from https://raw.githubusercontent.com/fajaralhakim/agent-kit/refs/heads/main/docs/install/copilot.md` |

## What gets installed

| Output | Method |
|--------|--------|
| `AGENTS.md`, `.agents/architecture.md`, `.agents/code-conventions.md`, `.agents/layers/*.md` | **Generated** from codebase scan |
| Rules (`.cursor/rules/`, `.claude/rules/`, etc.) | **Generated** — globs and paths match your project |
| Workflow skills (Jira, PR, Confluence, project context) | **Copied** from templates |
| MCP placeholders (Atlassian Rovo, Figma, Context7) | **Copied** placeholder |

Stack-agnostic: works for frontend (Next.js, Vite), backend (Express, Nest, FastAPI, Django, Go, Rust), and mobile (Expo, React Native, Flutter).

## CLI alternative

Package: [`@fajaralhakim/agent-kit`](https://www.npmjs.com/package/@fajaralhakim/agent-kit) (Node.js 20+)

```bash
npx @fajaralhakim/agent-kit analyze . --json
npx @fajaralhakim/agent-kit analyze . --write --harness cursor
npx @fajaralhakim/agent-kit add caveman .
```

Global install: `npm install -g @fajaralhakim/agent-kit` → run `agent-kit …`

### Optional addons

| Addon | Command |
|-------|---------|
| Context7 MCP | `npx @fajaralhakim/agent-kit add context7` |
| Caveman guide + conversation memory | `npx @fajaralhakim/agent-kit add caveman` |

The **caveman** addon installs `.agents/caveman.md` (opt-in Caveman installer instructions), `.agents/memory/` (compact index + plan/session files), and a `conversation-memory` skill/rule. It does not run Caveman's installer automatically.

## Shared workflow

All harness install docs reference [`_core-workflow.md`](./_core-workflow.md).
