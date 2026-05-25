import { MCP_REGISTRY, type McpServerDefinition } from "./mcp-registry.js";
import type { DetectedLayer, GeneratedFile, Harness, ProjectProfile } from "./types.js";

const HARNESS_MCP_PATHS: Record<Harness, string> = {
  cursor: ".cursor/mcp.json",
  opencode: "opencode.json",
  "claude-code": ".mcp.json",
  antigravity: ".agent/mcp.json",
  copilot: "~/.copilot/mcp-config.json",
};

function verificationChecklist(profile: ProjectProfile): string {
  const lines: string[] = [];
  const v = profile.verification;
  if (v.dev) lines.push(`- Dev: \`${v.dev}\``);
  if (v.test) lines.push(`- Test: \`${v.test}\``);
  if (v.lint) lines.push(`- Lint: \`${v.lint}\``);
  if (v.typecheck) lines.push(`- Type check: \`${v.typecheck}\``);
  if (v.build) lines.push(`- Build: \`${v.build}\``);
  return lines.length > 0 ? lines.join("\n") : "- No standard scripts detected — inspect codebase before claiming completion.";
}

function layerTable(layers: DetectedLayer[]): string {
  if (layers.length === 0) {
    return "| (flat) | — | No standard layered structure detected — inspect existing files before adding new ones. |";
  }
  return layers
    .map((l) => {
      const detected =
        l.subpaths.length > 0 ? l.subpaths.map((s) => `\`${s.split("/").pop()}\``).join(", ") : "—";
      return `| ${l.label} | \`${l.path}/\` | ${detected} |`;
    })
    .join("\n");
}

function agentsMdContent(profile: ProjectProfile): string {
  const lintRef = profile.verification.lint ? `, \`${profile.verification.lint}\`` : "";
  return `# AGENTS.md

> Agent entry point for **${profile.name}**. Read \`.agents/\` guides before scaffolding or large changes.

**Stack:** ${profile.stack} (${profile.stackFamily})  
**Language:** ${profile.language}  
**Package manager:** ${profile.packageManager}  
**Dev command:** \`${profile.devCommand}\`

## Project layout (detected)

| Layer | Path | Detected children |
|-------|------|-------------------|
${layerTable(profile.layers)}

## Verification

${verificationChecklist(profile)}

## Core rules

- Match existing structure — paths above were scanned from this repo.
- Prefer minimal, focused diffs.
- Never commit secrets or API keys.
- Verify changes before claiming work is complete (\`${profile.devCommand}\`${lintRef}).

## Guides (read when relevant)

| Guide | When |
|-------|------|
| [architecture.md](.agents/architecture.md) | Anything that touches layout or layers |
| [code-conventions.md](.agents/code-conventions.md) | Naming, file organization |
| [mcp-guide.md](.agents/mcp-guide.md) | MCP setup |
| [mcp-registry.md](.agents/mcp-registry.md) | Available MCP integrations |
| [atlassian.md](.agents/atlassian.md) | Jira / Confluence placeholders |
| [figma.md](.agents/figma.md) | Figma placeholders |

<!-- agent-kit:begin -->
## Agent Kit

Installed via Agent Kit analyze → generate workflow. Layers, conventions, and rules reflect this project's detected structure.
<!-- agent-kit:end -->
`;
}

function architectureDoc(profile: ProjectProfile): string {
  if (profile.layers.length === 0) {
    return `# Architecture

No standard layered structure detected. This project uses a flat or custom layout.

## Guidance

- Inspect existing modules before adding new folders.
- Do not invent \`src/features/\`, \`src/services/\`, or other layouts unless the team adopts them explicitly.
- Follow patterns in neighboring files.

**Entry pattern:** ${profile.conventions.entryPattern ?? "—"}
`;
  }

  const layerSections = profile.layers
    .map((l) => {
      const children =
        l.subpaths.length > 0
          ? `\n\nDetected children:\n${l.subpaths.map((s) => `- \`${s}/\``).join("\n")}`
          : "";
      return `### ${l.label} — \`${l.path}/\`

${layerGuidance(l, profile)}${children}`;
    })
    .join("\n\n");

  return `# Architecture

Stack: **${profile.stack}** (${profile.stackFamily}).  
Entry pattern: ${profile.conventions.entryPattern ?? "—"}

## Layers

${layerSections}

## Rules

- Do not create parallel folder structures outside the layers above.
- New work belongs in an existing layer — extend it rather than introducing a new top-level folder.
- Follow naming conventions in [code-conventions.md](./code-conventions.md).
`;
}

function layerGuidance(layer: DetectedLayer, profile: ProjectProfile): string {
  switch (layer.role) {
    case "modules":
      return `Domain or feature modules. Each subfolder represents a self-contained unit. ${
        profile.stackFamily === "frontend-web" || profile.stackFamily === "fullstack"
          ? "Routes/pages should stay thin and delegate to a module."
          : "Group related logic and types together within each module."
      }`;
    case "ui":
      return `Reusable UI primitives and shared components. Avoid duplicating components across modules.`;
    case "data-layer":
      return `API clients, repositories, or service objects. Keep transport details (HTTP, DB) isolated here; consumers depend on this layer's exported types.`;
    case "routes":
      return profile.stack === "nextjs"
        ? `Next.js App Router. Route files (\`page.tsx\`, \`layout.tsx\`) stay thin; data and rendering logic live in modules or data-layer.`
        : `HTTP route declarations or app entry points. Delegate to handlers or modules.`;
    case "handlers":
      return `Controllers, request handlers, or resolvers. Validate input, call the data layer, return responses. Avoid business logic here.`;
    case "screens":
      return `Mobile screens. One folder per screen; navigation wiring lives in the navigation layer.`;
    case "navigation":
      return `Navigation/router configuration. Centralize route definitions here.`;
    case "shared":
      return `Cross-cutting utilities, helpers, and primitives. Do not put domain logic here.`;
    case "config":
      return `Environment and configuration. Read values via a single typed entry point; do not scatter \`process.env\` reads.`;
    default:
      return `Detected layer.`;
  }
}

function codeConventionsDoc(profile: ProjectProfile): string {
  return `# Code Conventions

Inferred from existing codebase. Follow these unless local context dictates otherwise.

| Area | Convention |
|------|------------|
| Language | ${profile.language} |
| Folder names | ${profile.conventions.folderNaming} |
| File names | ${profile.conventions.fileNaming} |
| Path alias | \`${profile.conventions.pathAlias ?? "—"}\` |
| Entry pattern | ${profile.conventions.entryPattern ?? "—"} |

## Rules

- Match neighboring files for naming, imports, and structure.
- Do not mix naming styles within the same folder.
- When unsure, sample 2–3 similar files in the same layer before writing new code.
`;
}

function mcpGuideDoc(harness: Harness): string {
  const configPath = HARNESS_MCP_PATHS[harness];
  return `# MCP Guide

This project was bootstrapped for **${harness}**.  
MCP config file: \`${configPath}\`

Agent Kit installs MCP placeholders — edit credentials after install.

## Setup

1. Open \`${configPath}\` (copy from \`${configPath}.example\` if present)
2. Replace placeholders / complete OAuth on first connect
3. Restart the agent or reload MCP servers

## Available MCPs

See [mcp-registry.md](./mcp-registry.md) for the full list of integrations available via Agent Kit.

## Config locations by harness

| Harness | MCP config file |
|---------|-----------------|
| Cursor | \`.cursor/mcp.json\` |
| OpenCode | \`opencode.json\` |
| Claude Code | \`.mcp.json\` |
| Antigravity | \`.agent/mcp.json\` |
| Copilot | \`~/.copilot/mcp-config.json\` or repo MCP settings |
`;
}

function mcpRegistryDoc(harness: Harness): string {
  const sections = MCP_REGISTRY.map((server: McpServerDefinition) => {
    const cfg = server.harness[harness];
    const block = cfg
      ? `\n\`\`\`json
${JSON.stringify({ [cfg.key.split(".")[0]]: { [cfg.key.split(".").slice(1).join(".")]: cfg.config } }, null, 2)}
\`\`\``
      : "\n_(No preset for this harness — see docs URL.)_";
    const envNote = server.envVars?.length
      ? `\n**Env vars:** ${server.envVars.map((v) => `\`${v}\``).join(", ")}`
      : "";
    const docsNote = server.docsUrl ? `\n**Docs:** ${server.docsUrl}` : "";
    const placeholdersNote = server.placeholdersDoc
      ? `\n**Placeholders:** [${server.placeholdersDoc}](${server.placeholdersDoc})`
      : "";
    return `## ${server.name} (\`${server.id}\`)

${server.description}${docsNote}${envNote}${placeholdersNote}

### ${harness} config${block}`;
  }).join("\n\n---\n\n");

  return `# MCP Registry

Available MCP integrations for this project. Merge the snippet below into \`${HARNESS_MCP_PATHS[harness]}\` and replace any placeholder tokens.

${sections}
`;
}

function atlassianDoc(): string {
  return `# Atlassian Integration

Configure after install. Requires Atlassian Rovo MCP (OAuth on first connect).

## Placeholders — fill in for your team

- **Jira project key:** \`YOURPROJ\`
- **Confluence spaceId:** \`"123456"\`
- **cloudId:** \`https://yoursite.atlassian.net\`
- **maxResults:** \`10\` for all JQL/CQL searches

## MCP endpoint

\`https://mcp.atlassian.com/v1/mcp\`

See \`.agents/mcp-guide.md\` for harness-specific config paths.
`;
}

function figmaDoc(): string {
  return `# Figma Integration

Configure after install. Requires the Figma Developer MCP and a personal access token.

## Placeholders — fill in for your team

- **Default file key:** \`YOUR_FILE_KEY\` (from any Figma file URL: \`figma.com/file/<KEY>/...\`)
- **Team ID:** \`YOUR_TEAM_ID\` (optional, for team-wide queries)
- **API token:** set as env var \`FIGMA_API_TOKEN\` or replace \`YOUR_FIGMA_TOKEN\` in MCP config

## Docs

https://developers.figma.com/docs/figma-mcp-server/

See \`.agents/mcp-guide.md\` for harness-specific config paths.
`;
}

export function generateDocs(profile: ProjectProfile, harness: Harness = "cursor"): GeneratedFile[] {
  const files: GeneratedFile[] = [
    { path: "AGENTS.md", content: agentsMdContent(profile) },
    { path: ".agents/architecture.md", content: architectureDoc(profile) },
    { path: ".agents/code-conventions.md", content: codeConventionsDoc(profile) },
    { path: ".agents/mcp-guide.md", content: mcpGuideDoc(harness) },
    { path: ".agents/mcp-registry.md", content: mcpRegistryDoc(harness) },
    { path: ".agents/atlassian.md", content: atlassianDoc() },
    { path: ".agents/figma.md", content: figmaDoc() },
  ];

  for (const layer of profile.layers) {
    files.push({
      path: `.agents/layers/${layer.role}.md`,
      content: layerDoc(layer, profile),
    });
  }

  return files;
}

function layerDoc(layer: DetectedLayer, profile: ProjectProfile): string {
  const childrenList =
    layer.subpaths.length > 0
      ? layer.subpaths.map((s) => `- \`${s}/\``).join("\n")
      : "_(none detected — folder exists but is empty)_";

  return `# ${layer.label}

Path: \`${layer.path}/\`

${layerGuidance(layer, profile)}

## Detected children

${childrenList}

## Rules

- Naming: **${profile.conventions.folderNaming}** for folders, **${profile.conventions.fileNaming}** for files
- Glob: \`${layer.glob}\`
- See [architecture.md](../architecture.md) for how this layer interacts with the rest of the project.
`;
}

export function mergeAgentsMd(existing: string, generated: string): string {
  const begin = "<!-- agent-kit:begin -->";
  const end = "<!-- agent-kit:end -->";
  const blockMatch = generated.match(new RegExp(`${begin}[\\s\\S]*${end}`));
  const block = blockMatch?.[0] ?? "";

  if (existing.includes(begin) && existing.includes(end)) {
    return existing.replace(new RegExp(`${begin}[\\s\\S]*${end}`), block);
  }

  if (existing.trim().length === 0) {
    return generated;
  }

  return `${existing.trim()}\n\n${block}\n`;
}
