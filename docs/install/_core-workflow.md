# Agent Kit — Core Install Workflow

Shared steps for **all** harness install docs. The installing agent MUST follow this order.

Agent Kit is **stack-agnostic**: it works for frontend apps (Next.js, Vite), backend services (Express, Nest, FastAPI, Django, Go, Rust), and mobile (Expo, React Native, Flutter). The scan adapts to whatever layout the project uses.

## Step 1 — Analyze existing project

Do **not** assume a specific folder layout. Scan the project root:

1. Read `package.json`, `pyproject.toml`, `go.mod`, `Cargo.toml`, or `pubspec.yaml` to identify stack and package manager.
2. Detect language(s) from manifest and file extensions.
3. Walk the **layer pattern registry** — probe each candidate under `src/`, `app/`, `internal/`, and the repo root:

| Role | Candidates |
|------|------------|
| Modules | `features/`, `modules/`, `domain/`, `domains/`, `apps/` |
| UI / Components | `components/`, `ui/`, `widgets/` |
| Data layer | `services/`, `repositories/`, `api/`, `clients/`, `data/` |
| Routes | `app/`, `routes/`, `pages/`, `router/` |
| Handlers | `controllers/`, `handlers/`, `resolvers/`, `views/` |
| Screens | `screens/` |
| Navigation | `navigation/` |
| Shared | `lib/`, `utils/`, `common/`, `shared/`, `helpers/` |
| Config | `config/`, `configs/`, `settings/` |

Only emit layers that actually exist. Do **not** invent layers.

4. Sample 20–30 source files (any of `.ts`, `.tsx`, `.js`, `.py`, `.go`, `.rs`, `.dart`) for naming inference (kebab-case / snake_case / PascalCase).
5. Read existing `AGENTS.md` and `.agents/` if present.

**Preferred:** run CLI if available:

```bash
npx @fajaralhakim/agent-kit analyze . --json
```

**Fallback:** manual scan using the checklist above.

Output: **ProjectProfile** with `stack`, `stackFamily`, `language`, `layers[]`, `conventions`, `verification`.

## Step 2 — Generate tailored docs + rules

From the ProjectProfile, **write** (do not copy static templates):

### Docs

| File | Content |
|------|---------|
| `AGENTS.md` | Stack, dev/test commands, **layer table** from scan, links to guides |
| `.agents/architecture.md` | Detected layers with responsibilities |
| `.agents/code-conventions.md` | Inferred naming, path alias, entry pattern |
| `.agents/mcp-guide.md` | MCP setup for this harness |
| `.agents/mcp-registry.md` | Available MCPs (Atlassian, Figma, Context7) |
| `.agents/atlassian.md` | Jira / Confluence placeholders |
| `.agents/figma.md` | Figma placeholders |
| `.agents/layers/{role}.md` | One file per detected layer |

### Rules — GENERATED, not copied

Rules **must reflect the analyzed project**. Set `globs` frontmatter from detected layer paths.

| Rule | When |
|------|------|
| `core-standards` | Always — language-aware, dev command, path alias |
| `project-architecture` | Always — actual detected layer paths or flat-structure note |
| `stack-rules` | When a known stack is detected (Next.js, Express, FastAPI, Expo, Flutter, Go, Rust, etc.) |
| `verification` | Uses detected `test`, `lint`, `typecheck`, `build` scripts |

Generator reference: `packages/analyzer/src/generate-rules.ts` in the Agent Kit repo.

## Step 3 — Merge non-destructive

If `AGENTS.md` already exists, append or update only the block between markers:

```markdown
<!-- agent-kit:begin -->
…
<!-- agent-kit:end -->
```

Do not overwrite user content outside the markers.

## Step 4 — Harness-specific artifacts

Follow the harness supplement doc:

1. **Generate rules** → harness rules path (`.mdc` for Cursor, `.md` for others).
2. **Copy skills templates** from repo `skills/` → harness skills path (workflow only).
3. **Copy MCP example** from `harness/` → harness MCP config; merge Atlassian + Figma placeholders.
4. Add `.cursor/mcp.json` (or equivalent) to `.gitignore` if it stores secrets.

**Do not copy rules from `harness/`** — that folder has no rule templates.

## Step 5 — Verify

- [ ] `AGENTS.md` exists and layer table matches scan
- [ ] `.agents/architecture.md` describes detected layers (or notes flat layout)
- [ ] Generated rules use correct globs for this project
- [ ] Workflow skills copied (read-jira-ticket, create-pull-request, etc.)
- [ ] MCP example present; user reminded to complete OAuth / replace placeholders

## Skill templates to copy

From Agent Kit repo `skills/`:

- `read-jira-ticket`
- `create-pull-request`
- `read-confluence-prd`
- `using-project-context`

Skills reference the generated `.agents/*` docs — they do not duplicate structure content.

## MCP — registry

| Server | Endpoint / package |
|--------|--------------------|
| Atlassian Rovo | `https://mcp.atlassian.com/v1/mcp` (OAuth) |
| Figma | `npx figma-developer-mcp` (requires `FIGMA_API_TOKEN`) |
| Context7 | `https://mcp.context7.com/mcp` |

See `harness/{name}/mcp.{json,example.json}` for ready-to-merge configs.
