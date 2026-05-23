# Agent Kit — Core Install Workflow

Shared steps for **all** harness install docs. The installing agent MUST follow this order.

## Step 1 — Analyze existing project

Do **not** assume folder layout. Scan the project root:

1. Read `package.json` (or `pyproject.toml`) → stack, scripts, package manager
2. Walk `src/features/`, `src/services/`, `src/components/`, `src/app/` (or equivalents)
3. Sample route/page files → detect thin-route → feature pattern
4. Read existing `AGENTS.md` and `.agents/` if present
5. Infer naming from sample filenames (kebab-case vs PascalCase)
6. Read `tsconfig.json` paths for alias (`@/*`)

**Preferred:** run CLI if available:

```bash
bunx @fajaralhakim/agent-kit analyze . --json
```

**Fallback:** manual scan using checklist above.

Output: **ProjectProfile** JSON (name, stack, paths, conventions, rules globs).

## Step 2 — Generate tailored docs + rules

From ProjectProfile, **write** (do not copy static templates):

### Docs

| File | Content |
|------|---------|
| `AGENTS.md` | Stack, dev command, **actual folder table**, links to guides |
| `.agents/feature-structure.md` | Feature folders found (or note flat structure) |
| `.agents/service-structure.md` | Service domains if present |
| `.agents/component-structure.md` | Component subfolders detected |
| `.agents/naming-conventions.md` | Inferred naming |
| `.agents/atlassian.md` | Jira / Confluence placeholders |
| `.agents/mcp-guide.md` | MCP config per harness |

### Rules — GENERATED, not copied

Rules **must reflect the analyzed project**. Set `globs` frontmatter from detected paths.

| Rule | When |
|------|------|
| `core-standards` | Always — dev command, path alias, typing |
| `project-architecture` | Always — actual feature/service paths or flat-structure note |
| `stack-rules` | Only if Next.js / Vite / etc. detected |
| `verification` | lint/typecheck scripts from package.json |

Example architecture rule body for a project with `src/features/`:

```markdown
- Features live in: src/features/{kebab-case}/
- Services live in: src/services/{domain}/
- Routes in src/app/ stay thin — delegate to @/features/*
- Do not create parallel folder structures outside detected paths.
```

If no `features/` folder exists → document flat/custom structure instead of inventing one.

Generator reference: `packages/analyzer/src/generate-rules.ts` in Agent Kit repo.

## Step 3 — Merge non-destructive

If `AGENTS.md` already exists:

- Append or update only the `<!-- agent-kit:begin -->` … `<!-- agent-kit:end -->` block
- Do **not** overwrite user content outside markers

## Step 4 — Harness-specific artifacts

Follow the harness supplement doc (cursor.md, opencode.md, etc.):

1. **Generate rules** → harness rules path (`.mdc` for Cursor, `.md` for others)
2. **Copy skills templates** from repo `skills/` → harness skills path (workflow only)
3. **Copy MCP example** → harness MCP config; merge Atlassian Rovo placeholder
4. Add `.cursor/mcp.json` (or equivalent) to `.gitignore` if secrets file

**Do NOT copy rules from `harness/`** — that folder has no rule templates.

## Step 5 — Verify

- [ ] `AGENTS.md` exists and folder table matches scan
- [ ] `.agents/*` guides reflect actual directories
- [ ] Generated rules use correct globs for this project
- [ ] Workflow skills copied (read-jira-ticket, create-pull-request, etc.)
- [ ] MCP example present; user reminded to complete OAuth

## Skill templates to copy

From Agent Kit repo `skills/`:

- `read-jira-ticket`
- `create-pull-request`
- `read-confluence-prd`
- `using-project-context`

Skills reference generated `.agents/*` docs — they do not duplicate structure content.

## MCP — Atlassian Rovo

Official endpoint: `https://mcp.atlassian.com/v1/mcp` (OAuth 2.1 on first connect)

See harness `mcp.json.example` for format.
