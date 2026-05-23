# Install Agent Kit — OpenCode

Follow [`_core-workflow.md`](https://raw.githubusercontent.com/fajaralhakim/untitled-projects/refs/heads/main/docs/install/_core-workflow.md) first.

## OpenCode-specific paths

| Artifact | Path |
|----------|------|
| Rules (generated) | `.opencode/rules/*.md` or sections in `AGENTS.md` |
| Skills (copy templates) | `.opencode/skills/{skill-name}/SKILL.md` |
| MCP | `opencode.json` → `mcp` |
| Entry | `AGENTS.md` |

## Step-by-step

### 1. Analyze

```bash
bunx @agent-kit/cli analyze . --json --harness opencode
```

### 2. Generate docs + rules

Same as core workflow. Write rules to `.opencode/rules/` as `.md` files.

### 3. Copy workflow skills

Copy from repo `skills/` → `.opencode/skills/`:

- `read-jira-ticket`
- `create-pull-request`
- `read-confluence-prd`
- `using-project-context`

### 4. MCP — merge into `opencode.json`

```json
{
  "mcp": {
    "atlassian-rovo": {
      "type": "remote",
      "url": "https://mcp.atlassian.com/v1/mcp"
    }
  }
}
```

Merge with existing `opencode.json` if present.

### 5. Verify

Core workflow checklist.

## Optional — global plugin

For skill discovery without copying to each project, add to OpenCode config:

```json
{
  "plugin": ["agent-kit@git+https://github.com/fajaralhakim/untitled-projects.git"]
}
```

Primary install remains: fetch this doc from project root → analyze → bootstrap files.

See [`.opencode/plugins/agent-kit.js`](https://github.com/fajaralhakim/untitled-projects/blob/main/.opencode/plugins/agent-kit.js) in repo.
