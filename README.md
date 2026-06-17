# Agent Kit

A **stack-agnostic** toolkit for setting up AI agent context in any codebase — frontend, backend, or mobile — so Cursor, Claude Code, OpenCode, and other agents understand your project's structure, conventions, and team workflows.

Agent Kit is not an app framework. It generates the guide files (`AGENTS.md`, layer docs, rules, MCP placeholders) that AI reads before it starts coding.

---

## What is Agent Kit?

When using AI coding assistants, agents often:

- Put files in the wrong places (inconsistent folder structure)
- Miss project conventions (naming, layering, language idioms)
- Repeat MCP and workflow setup from scratch on every project

Agent Kit fixes this by:

1. **Analyzing** your existing codebase — works for Next.js, Vite, Express, Nest, FastAPI, Django, Expo, React Native, Flutter, Go, Rust, and more
2. **Generating** documentation and rules tailored to your project (not generic templates)
3. **Copying** workflow skills (Jira, PRs, Confluence) and MCP placeholders (Atlassian Rovo, Figma, Context7)

The result: the agent has an accurate map of your project before it starts coding.

---

## What does it do?

| Feature | Description |
|---------|-------------|
| **Universal codebase scan** | Detects stack, language, and layered structure via a pattern registry (modules, UI, data-layer, routes, handlers, screens, navigation, shared, config) |
| **Generate AGENTS.md** | Agent entry point — stack, dev/test commands, the detected layer map |
| **Generate architecture guides** | `.agents/architecture.md`, `.agents/code-conventions.md`, one file per detected layer under `.agents/layers/` |
| **Generate rules** | Rules in `.cursor/rules/` (or other harness paths) with globs matching your project's actual layers |
| **Stack-family rules** | Tailored guidance for Next.js, Vite, Express, Fastify, Nest, FastAPI, Django, Expo, React Native, Flutter, Go, Rust |
| **Workflow skills** | Jira ticket, create PR, read Confluence PRD, using project context — copied from templates |
| **MCP registry** | Atlassian Rovo, Figma, Context7 — extensible via `mcp/registry.json` |

### Generated vs copied

| Output | Method |
|--------|--------|
| `AGENTS.md`, `.agents/*`, **rules** | **Generated** — adapts to your project structure |
| Workflow skills, MCP placeholders | **Copied** — universal templates |

---

## Supported stacks

| Family | Stack | Detection signal |
|--------|-------|------------------|
| frontend-web | Vite + React | `vite` and `react` deps |
| fullstack | Next.js | `next` dep |
| mobile | Expo, React Native, Flutter | `expo`/`react-native` deps; `pubspec.yaml` |
| backend | Express, Fastify, NestJS | matching deps |
| backend | FastAPI, Django | `pyproject.toml` / `manage.py` |
| backend | Go, Rust | `go.mod` / `Cargo.toml` |
| unknown | — | falls back to a flat-layout note in `architecture.md` |

---

## Installation

Package: [`@fajaralhakim/agent-kit` on npm](https://www.npmjs.com/package/@fajaralhakim/agent-kit) · Node.js 20+

There are two ways to install, depending on your situation.

### A. Existing project (recommended)

No CLI install required. Paste one prompt in your agent chat from the project root.

#### Cursor

```
Fetch and follow instructions from https://raw.githubusercontent.com/fajaralhakim/agent-kit/refs/heads/main/docs/install/cursor.md
```

#### OpenCode

```
Fetch and follow instructions from https://raw.githubusercontent.com/fajaralhakim/agent-kit/refs/heads/main/docs/install/opencode.md
```

#### Claude Code

```
Fetch and follow instructions from https://raw.githubusercontent.com/fajaralhakim/agent-kit/refs/heads/main/docs/install/claude-code.md
```

#### Other harnesses

| Agent | Prompt |
|-------|--------|
| Antigravity | `Fetch and follow instructions from …/docs/install/antigravity.md` |
| GitHub Copilot | `Fetch and follow instructions from …/docs/install/copilot.md` |

Base URL: `https://raw.githubusercontent.com/fajaralhakim/agent-kit/refs/heads/main`

Full list: [docs/install/README.md](docs/install/README.md)

What happens after you paste the prompt:

1. The agent fetches the install instructions.
2. The agent analyzes your codebase (stack, language, layers, naming).
3. The agent generates `AGENTS.md`, `.agents/architecture.md`, `.agents/code-conventions.md`, per-layer docs, and rules tailored to your project.
4. The agent copies workflow skills + MCP placeholders (Atlassian, Figma, Context7).
5. You fill in credentials (Atlassian OAuth, `FIGMA_API_TOKEN`, etc.).

Rules are not copied from templates — they are always generated from the project scan so globs and paths stay accurate.

### B. Via CLI (npm)

Published as [`@fajaralhakim/agent-kit`](https://www.npmjs.com/package/@fajaralhakim/agent-kit) on npm. Requires **Node.js 20+**.

Run without installing (recommended):

```bash
npx @fajaralhakim/agent-kit analyze . --json                  # view scan output
npx @fajaralhakim/agent-kit analyze . --write --harness cursor # write files to disk
```

Install the core context layer (`AGENTS.md.hbs`, generic rules, `using-project-context` skill) into an existing project:

```bash
npx @fajaralhakim/agent-kit init .
```

Or install globally:

```bash
npm install -g @fajaralhakim/agent-kit
agent-kit analyze . --write --harness cursor
```

After `init`, run `analyze --write` to overwrite the generic `AGENTS.md` with one tailored to your project's detected layers.

Also works with Bun: `bunx @fajaralhakim/agent-kit …`

---

## After installation

1. Review generated files
   - `AGENTS.md` — read first; confirm the layer map matches your project
   - `.agents/architecture.md` — layer responsibilities
   - `.agents/code-conventions.md` — naming, path alias, entry pattern
   - `.agents/layers/*.md` — one per detected layer
   - `.cursor/rules/` (or your harness path) — generated rules

2. Set up MCP
   - Copy `.cursor/mcp.json.example` → `.cursor/mcp.json` (Cursor) or equivalent for your harness
   - Complete Atlassian Rovo OAuth on first connect
   - Replace `YOUR_FIGMA_TOKEN` with a Figma personal access token (or remove if unused)
   - Fill placeholders in `.agents/atlassian.md` and `.agents/figma.md`

3. Verify

   ```bash
   npx @fajaralhakim/agent-kit doctor
   ```

4. Commit to repo
   - Commit: `AGENTS.md`, `.agents/`, harness rules folder, MCP example, skills
   - Do not commit: `.cursor/mcp.json` (secrets) — add it to `.gitignore`

---

## MCP Registry

Agent Kit ships with a registry of recommended MCP servers. The generated `.agents/mcp-registry.md` lists ready-to-merge snippets for your harness.

| Server | What it provides | Endpoint / package |
|--------|------------------|--------------------|
| Atlassian Rovo | Jira + Confluence | `https://mcp.atlassian.com/v1/mcp` (OAuth) |
| Figma | Design context, components, assets | `npx figma-developer-mcp` (`FIGMA_API_TOKEN`) |
| Context7 | Library + framework documentation | `https://mcp.context7.com/mcp` |

Source of truth: [`mcp/registry.json`](mcp/registry.json). Add your own MCPs there — the analyzer picks them up automatically.

> Workflow skills for Figma (component generation from designs) and Confluence (PRD → tasks) are on the roadmap — they layer on top of the MCP integrations above.

---

## CLI commands

| Command | Purpose |
|---------|---------|
| `agent-kit init [path]` | Install core context (generic `AGENTS.md`, rules, skills, MCP placeholders) |
| `agent-kit analyze . --json` | Scan project → JSON output (`ProjectProfile`) |
| `agent-kit analyze . --write --harness cursor` | Generate and write project-tailored `AGENTS.md`, `.agents/`, rules |
| `agent-kit add context7` | Add Context7 MCP entry |
| `agent-kit add caveman` | Optional: Caveman guide + lean conversation memory (`.agents/memory/`) |
| `agent-kit init . --addon caveman` | Core + context7 + caveman addon together |
| `agent-kit doctor` | Validate installation |

---

## Optional addons

| Addon | Command | What it adds |
|-------|---------|--------------|
| **context7** | `agent-kit add context7` | Context7 MCP entry in `.cursor/mcp.json` |
| **caveman** | `agent-kit add caveman` | Caveman install guide (`.agents/caveman.md`), lean plan/session memory under `.agents/memory/`, `conversation-memory` skill and rule |

Caveman itself is **not** installed automatically — the addon adds repo-local guidance and memory conventions. Run Caveman's installer from `.agents/caveman.md` when you want token compression.

Memory flow: agents read compact `.agents/memory/index.md` first, then only the linked active plan or handoff file — not full chat history.

```bash
npx @fajaralhakim/agent-kit init . --addon caveman
npx @fajaralhakim/agent-kit add caveman .
```

---

## Development (contributors)

Clone this repo to work on Agent Kit itself:

```bash
git clone https://github.com/fajaralhakim/agent-kit.git
cd agent-kit
bun install
bun run build
```

Run the CLI locally:

```bash
bun run dev -- analyze /path/to/any/project --json
bun run dev -- analyze /path/to/any/project --write --harness cursor
bun run dev -- doctor /path/to/any/project
```

---

## Repository structure

```
agent-kit/
├── docs/install/       # Install prompts per harness (Cursor, OpenCode, etc.)
├── mcp/
│   └── registry.json   # MCP server registry (source of truth)
├── packages/
│   ├── cli/            # @agent-kit/cli
│   └── analyzer/       # Scan codebase + generate docs/rules
├── harness/            # MCP examples per harness (no rule templates)
├── skills/             # Workflow skill templates (Jira, PR, Confluence, project context)
└── profiles/
    ├── _core/          # Generic AGENTS.md + core rules + skills
    └── addons/         # Optional addons (context7, caveman, ...)
```

---

## License

MIT — free for personal and commercial use. See [docs/commercial-use.md](docs/commercial-use.md).
