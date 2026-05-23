# Install Agent Kit — Cursor

Follow [`_core-workflow.md`](https://raw.githubusercontent.com/fajaralhakim/agent-kit/refs/heads/main/docs/install/_core-workflow.md) first.

## Cursor-specific paths

| Artifact | Path |
|----------|------|
| Rules (generated) | `.cursor/rules/*.mdc` |
| Skills (copy templates) | `.cursor/skills/{skill-name}/SKILL.md` |
| MCP example | `.cursor/mcp.json.example` |
| MCP secrets (gitignore) | `.cursor/mcp.json` |
| Entry | `AGENTS.md` |

## Step-by-step

### 1. Analyze

```bash
bunx @fajaralhakim/agent-kit analyze . --json
```

Or manual scan per core workflow.

### 2. Generate docs + rules

Write to project root:

- `AGENTS.md` + `.agents/*.md` (generated from scan)
- `.cursor/rules/core-standards.mdc`
- `.cursor/rules/project-architecture.mdc` — globs from detected paths
- `.cursor/rules/stack-rules.mdc` — only if Next.js/Vite detected
- `.cursor/rules/verification.mdc`

Rule frontmatter example:

```yaml
---
description: Enforce this project's architecture
globs: src/features/**/*,src/services/**/*,src/app/**/*
alwaysApply: false
---
```

Globs MUST match this project's actual directories.

### 3. Copy workflow skills

Copy from Agent Kit repo [`skills/`](https://github.com/fajaralhakim/agent-kit/tree/main/skills):

| Skill | Dest |
|-------|------|
| `read-jira-ticket` | `.cursor/skills/read-jira-ticket/SKILL.md` |
| `create-pull-request` | `.cursor/skills/create-pull-request/SKILL.md` |
| `read-confluence-prd` | `.cursor/skills/read-confluence-prd/SKILL.md` |
| `using-project-context` | `.cursor/skills/using-project-context/SKILL.md` |

### 4. MCP — Atlassian Rovo

Create `.cursor/mcp.json.example`:

```json
{
  "mcpServers": {
    "atlassian-rovo": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://mcp.atlassian.com/v1/mcp"]
    }
  }
}
```

User copies to `.cursor/mcp.json` and completes OAuth on first connect.

Add to `.gitignore`:

```
.cursor/mcp.json
```

### 5. Verify

Run checklist from core workflow. Confirm rules globs differ from other projects if structure differs.

## Do not

- Copy static rules from `profiles/` or `harness/` — rules are always generated
- Overwrite existing `AGENTS.md` outside `<!-- agent-kit:begin/end -->` markers
