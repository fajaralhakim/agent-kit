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
| `AGENTS.md`, `.agents/*` | **Generated** from codebase scan |
| Rules (`.cursor/rules/`, etc.) | **Generated** — globs and paths match your project |
| Workflow skills (Jira, PR, Confluence) | **Copied** from templates |
| MCP Atlassian Rovo | **Copied** placeholder |

## CLI alternative

If `bunx @fajaralhakim/agent-kit` is available:

```bash
bunx bunx @fajaralhakim/agent-kit analyze . --json
bunx bunx @fajaralhakim/agent-kit analyze . --write --harness cursor
```

## Shared workflow

All harness install docs reference [`_core-workflow.md`](./_core-workflow.md).
