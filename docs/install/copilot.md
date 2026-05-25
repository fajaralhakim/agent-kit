# Install Agent Kit — GitHub Copilot

Follow [`_core-workflow.md`](https://raw.githubusercontent.com/fajaralhakim/agent-kit/refs/heads/main/docs/install/_core-workflow.md) first.

## Copilot paths

| Artifact | Path |
|----------|------|
| Rules (generated) | `.github/copilot-instructions.md` (merged sections) |
| Skills (copy templates) | `.github/skills/{skill-name}/SKILL.md` |
| MCP | `~/.copilot/mcp-config.json` or repo MCP settings |
| Entry | `AGENTS.md` |

## Steps

1. Analyze: `bunx github:fajaralhakim/agent-kit analyze . --json --harness copilot`
2. Generate `AGENTS.md`, `.agents/*`, merge rules into `.github/copilot-instructions.md`
3. Copy workflow skills → `.github/skills/`
4. Add MCP servers (Atlassian Rovo, Figma, Context7) via `/mcp add` or MCP JSON — see `.agents/mcp-registry.md`
5. Verify core workflow checklist

Rules content is **generated from project structure** — not copied from templates.
