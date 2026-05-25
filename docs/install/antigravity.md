# Install Agent Kit — Antigravity

Follow [`_core-workflow.md`](https://raw.githubusercontent.com/fajaralhakim/agent-kit/refs/heads/main/docs/install/_core-workflow.md) first.

## Antigravity paths

| Artifact | Path |
|----------|------|
| Rules (generated) | `.agent/rules/*.md` |
| Skills (copy templates) | `.agent/skills/{skill-name}/SKILL.md` |
| MCP | Per Antigravity MCP documentation |
| Entry | `.agent/rules/AGENT.md` → link `AGENTS.md` |

## Steps

1. Analyze project (CLI or manual)
2. Generate `AGENTS.md`, `.agents/*`, `.agent/rules/*.md` from scan
3. Copy workflow skills from repo `skills/` → `.agent/skills/`
4. Configure MCPs (Atlassian Rovo, Figma, Context7) — see `.agents/mcp-registry.md` for snippets
5. Verify core workflow checklist

Rules are **generated** — do not copy from `harness/`.
