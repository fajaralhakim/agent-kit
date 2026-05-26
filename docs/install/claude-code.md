# Install Agent Kit — Claude Code

Follow [`_core-workflow.md`](https://raw.githubusercontent.com/fajaralhakim/agent-kit/refs/heads/main/docs/install/_core-workflow.md) first.

## Claude Code paths

| Artifact | Path |
|----------|------|
| Rules (generated) | `.claude/rules/*.md` |
| Skills (copy templates) | `.claude/skills/{skill-name}/SKILL.md` |
| MCP | `.mcp.json` or Claude MCP settings |
| Entry | `CLAUDE.md` → reference `@AGENTS.md` |

## Step-by-step

### 1. Analyze

```bash
npx @fajaralhakim/agent-kit analyze . --json --harness claude-code
```

### 2. Generate docs + rules

- `AGENTS.md` + `.agents/*` (generated)
- `.claude/rules/*.md` — same content as Cursor rules, markdown format

### 3. CLAUDE.md

Create or update `CLAUDE.md`:

```markdown
# Claude Code

Read @AGENTS.md before making changes.

Workflow skills in `.claude/skills/`.
```

### 4. Copy workflow skills

Copy repo `skills/` → `.claude/skills/`:

- `read-jira-ticket`
- `create-pull-request`
- `read-confluence-prd`
- `using-project-context`

### 5. MCP — Atlassian + Figma + Context7

Add remote/local MCP servers per Claude Code docs:

```json
{
  "mcpServers": {
    "atlassian-rovo": {
      "url": "https://mcp.atlassian.com/v1/mcp"
    },
    "figma": {
      "command": "npx",
      "args": ["-y", "figma-developer-mcp", "--figma-api-key=YOUR_FIGMA_TOKEN"]
    },
    "context7": {
      "url": "https://mcp.context7.com/mcp"
    }
  }
}
```

### 6. Verify

Core workflow checklist.
