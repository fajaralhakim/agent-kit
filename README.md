# Agent Kit

A toolkit for setting up **AI agent context** in your project — so Cursor, Claude Code, OpenCode, and other agents understand your codebase structure, coding standards, and team workflows (Jira, PRs, Confluence).

Agent Kit is **not** an app framework. It **prepares guide files** (`AGENTS.md`, rules, skills, MCP) that AI reads while coding.

---

## What is Agent Kit?

When using AI coding assistants, agents often:

- Put files in the wrong places (inconsistent folder structure)
- Miss project conventions (naming, feature/service architecture)
- Repeat MCP and workflow setup from scratch on every project

**Agent Kit fixes this** by:

1. **Analyzing** your existing codebase structure
2. **Generating** documentation and rules **tailored to your project** (not generic templates)
3. **Copying** workflow skills (Jira, PRs, Confluence) and MCP placeholders

The result: the agent has an accurate map of your project before it starts coding.

---

## What does it do?

| Feature | Description |
|---------|-------------|
| **Analyze codebase** | Scan `features/`, `services/`, `components/`, routes, naming conventions, stack (Next.js, Vite, etc.) |
| **Generate AGENTS.md** | Agent entry point — stack, dev command, actual folder map |
| **Generate structure guides** | `.agents/feature-structure.md`, `service-structure.md`, etc. from structure **that actually exists** |
| **Generate rules** | Rules in `.cursor/rules/` (or other harness paths) with globs and paths **specific to your project** |
| **Workflow skills** | Jira ticket, create PR, read Confluence PRD — copied from templates, same across projects |
| **MCP Atlassian Rovo** | Placeholder for Jira & Confluence via MCP |
| **Scaffold new projects** | (Optional) Slim Next.js starter + agent context in one step |

### Generated vs copied

| Output | Method |
|--------|--------|
| `AGENTS.md`, `.agents/*`, **rules** | **Generated** — adapts to your project structure |
| Workflow skills, MCP placeholder | **Copied** — universal templates |

---

## Installation

There are **two ways** to install, depending on your situation:

### A. Existing project (recommended)

No CLI install required. Paste **one prompt** in your agent chat from the **project root**:

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

**What happens after you paste the prompt:**

1. The agent fetches the install instructions
2. The agent analyzes your codebase structure
3. The agent generates `AGENTS.md`, `.agents/*`, and rules
4. The agent copies workflow skills + MCP placeholder
5. You fill in MCP credentials (Atlassian OAuth, etc.)

> Rules are **not** copied from templates — they are always generated from the project scan so globs and paths stay accurate.

---

### B. Via CLI (GitHub or npm)

**From GitHub** (no npm publish needed — push latest `agent-kit` repo first):

```bash
# GitHub username is fajaralhakim (not fjaralhakim)
bunx github:fajaralhakim/agent-kit analyze . --json
bunx github:fajaralhakim/agent-kit analyze . --write --harness cursor
```

**After npm publish:**

```bash
bunx @fajaralhakim/agent-kit init ./my-app --profile nextjs
bunx @fajaralhakim/agent-kit analyze . --json
```

For an **empty** directory with Next.js starter + agent context:

```bash
bunx @fajaralhakim/agent-kit init ./my-app --profile nextjs

cd my-app
npm install
npm run dev
```

For an **existing** project, CLI installs agent context only (does not overwrite app code):

```bash
bunx @fajaralhakim/agent-kit init . --profile nextjs
```

Generate docs and rules directly:

```bash
bunx @fajaralhakim/agent-kit analyze . --json                          # view scan output
bunx @fajaralhakim/agent-kit analyze . --write --harness cursor        # write files to disk
```

---

## After installation

1. **Review generated files**
   - `AGENTS.md` — read first; confirm the folder map matches your project
   - `.agents/` — feature, service, and component structure guides
   - `.cursor/rules/` (or your harness path) — generated rules

2. **Set up MCP**
   - Copy `.cursor/mcp.json.example` → `.cursor/mcp.json` (Cursor)
   - Complete Atlassian Rovo OAuth on first connect
   - Fill placeholders in `.agents/atlassian.md` (Jira project key, Confluence spaceId)

3. **Verify**
   ```bash
   bunx @fajaralhakim/agent-kit doctor
   ```

4. **Commit to repo**
   - Commit: `AGENTS.md`, `.agents/`, `.cursor/rules/`, `.cursor/mcp.json.example`, skills
   - Do not commit: `.cursor/mcp.json` (secrets) — add it to `.gitignore`

---

## CLI commands

| Command | Purpose |
|---------|---------|
| `agent-kit init [path]` | New project: scaffold + context. Existing project: context only |
| `agent-kit init --profile nextjs` | Slim Next.js starter + agent context |
| `agent-kit analyze . --json` | Scan project → JSON output (ProjectProfile) |
| `agent-kit analyze . --write --harness cursor` | Generate and write AGENTS.md, `.agents/`, rules |
| `agent-kit add shadcn` | Add shadcn skill + MCP entry |
| `agent-kit add context7` | Add Context7 MCP entry |
| `agent-kit doctor` | Validate installation |

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
bun run dev -- init ./my-app --profile nextjs
bun run dev -- analyze templates/nextjs --json
```

---

## Repository structure

```
agent-kit/
├── docs/install/       # Install prompts per harness (Cursor, OpenCode, etc.)
├── packages/
│   ├── cli/            # @agent-kit/cli
│   └── analyzer/       # Scan codebase + generate docs/rules
├── harness/            # MCP examples per harness (no rules)
├── skills/             # Workflow skill templates (Jira, PR, Confluence)
├── profiles/           # CLI profiles (legacy init)
└── templates/nextjs/   # Slim Next.js starter
```

---

## License

MIT — free for personal and commercial use. See [docs/commercial-use.md](docs/commercial-use.md).
