import type { GeneratedFile, ProjectProfile } from "./types.js";

function featureStructureDoc(profile: ProjectProfile): string {
  const { featuresRel } = getPathLabels(profile);

  if (profile.paths.features.length === 0) {
    return `# Feature Structure

No dedicated \`${featuresRel}/\` folder detected in this project.

When adding page-level UI + logic, follow existing patterns in the codebase. Inspect similar modules before creating new folders. Do not invent parallel structures without matching what already exists.
`;
  }

  const featureList = profile.paths.features.map((f) => `- \`${f}/\``).join("\n");
  const thinRouteNote = profile.conventions.hasThinRoutes
    ? `\nRoute files in \`${profile.paths.appDir}/\` stay **thin** — import and render from \`${featuresRel}/\`.`
    : "";

  return `# Feature Structure

## Detected features

${featureList}

## Layout

\`\`\`
${featuresRel}/{feature-name}/
├── index.tsx           # Main export (page or section)
├── components/         # Feature-scoped UI (optional)
├── hooks/              # Feature-scoped hooks (optional)
└── sections/           # Page sections (optional)
\`\`\`

## Rules

- Feature folder names: **${profile.conventions.featureNaming}**
- Default export from \`index.tsx\`: PascalCase component name
- Do not put business logic in route files${thinRouteNote}
`;
}

function serviceStructureDoc(profile: ProjectProfile): string {
  const servicesRel = profile.paths.srcRoot ? `${profile.paths.srcRoot}/services` : "services";

  if (profile.paths.services.length === 0) {
    return `# Service Structure

No dedicated \`${servicesRel}/\` folder detected.

For API or data layer work, follow existing patterns (fetch calls, hooks, or lib folders) before introducing a new service layout.
`;
  }

  const serviceList = profile.paths.services.map((s) => `- \`${s}/\``).join("\n");

  return `# Service Structure

## Detected service domains

${serviceList}

## Layout

\`\`\`
${servicesRel}/{domain}/
├── keys.ts             # Query keys (if using TanStack Query)
├── types/              # Domain types
└── query/              # Query/mutation functions
\`\`\`

## Rules

- One domain per folder under \`${servicesRel}/\`
- Keep HTTP client config shared (e.g. \`axios-config.ts\` at services root)
- Features import from \`@${profile.paths.srcRoot ? "/" : ""}services/{domain}\` — do not duplicate API calls in components
`;
}

function componentStructureDoc(profile: ProjectProfile): string {
  const componentsRel = profile.paths.srcRoot
    ? `${profile.paths.srcRoot}/components`
    : "components";
  const subs = Object.keys(profile.paths.components);

  if (subs.length === 0 && profile.paths.features.length === 0) {
    return `# Component Structure

No \`${componentsRel}/\` subfolders detected. Inspect existing component locations before adding new ones.
`;
  }

  const subList =
    subs.length > 0
      ? subs.map((s) => `- \`${componentsRel}/${s}/\``).join("\n")
      : `- \`${componentsRel}/\` (no subfolders yet)`;

  return `# Component Structure

## Detected layout

${subList}

## Rules

- **ui/** — design system / shadcn primitives (if present)
- **shared/** — cross-feature reusable components
- **Feature-scoped** — \`${profile.paths.srcRoot ?? "src"}/features/{name}/components/\`
- Component file naming: **${profile.conventions.componentNaming}**
- Do not duplicate components that already exist in \`shared/\` or \`ui/\`
`;
}

function namingConventionsDoc(profile: ProjectProfile): string {
  const alias = profile.conventions.pathAlias ?? "@/*";

  return `# Naming Conventions

Detected from existing codebase:

| Area | Convention |
|------|------------|
| Feature folders | ${profile.conventions.featureNaming} |
| Component files | ${profile.conventions.componentNaming} |
| Path alias | \`${alias}\` |

Follow patterns in neighboring files. Do not mix naming styles within the same folder.
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

See \`.agents/mcp-guide.md\` for harness-specific MCP config paths.
`;
}

function mcpGuideDoc(harness?: string): string {
  const harnessNote = harness
    ? `\nThis project was bootstrapped for **${harness}**. See harness install doc for MCP file location.\n`
    : "";

  return `# MCP Guide
${harnessNote}
Agent Kit installs **MCP placeholders** — edit credentials after install.

## Atlassian Rovo (recommended)

Official endpoint: \`https://mcp.atlassian.com/v1/mcp\`

OAuth 2.1 on first connect. See \`.agents/atlassian.md\` for project keys.

## Config locations by harness

| Harness | MCP config file |
|---------|-----------------|
| Cursor | \`.cursor/mcp.json\` (gitignore secrets; commit \`.cursor/mcp.json.example\`) |
| OpenCode | \`opencode.json\` → \`mcp\` |
| Claude Code | \`.mcp.json\` or Claude MCP settings |
| Copilot | \`~/.copilot/mcp-config.json\` or repo MCP settings |

## Setup

1. Copy from \`mcp.json.example\` if present
2. Complete OAuth / replace placeholders
3. Restart agent or reload MCP servers
`;
}

function getPathLabels(profile: ProjectProfile) {
  const featuresRel = profile.paths.srcRoot
    ? `${profile.paths.srcRoot}/features`
    : "features";
  return { featuresRel };
}

function folderTable(profile: ProjectProfile): string {
  const rows: string[] = [];
  if (profile.paths.features.length > 0) {
    rows.push(`| Features | \`${profile.paths.features[0].split("/")[0]}/features/\` | ${profile.paths.features.length} modules |`);
  }
  if (profile.paths.services.length > 0) {
    rows.push(`| Services | \`${profile.paths.services[0].split("/").slice(0, -1).join("/")}/\` | ${profile.paths.services.length} domains |`);
  }
  const compSubs = Object.keys(profile.paths.components);
  if (compSubs.length > 0) {
    const base = profile.paths.srcRoot ? `${profile.paths.srcRoot}/components` : "components";
    rows.push(`| Components | \`${base}/\` | ${compSubs.join(", ")} |`);
  }
  if (profile.paths.appDir) {
    rows.push(`| App routes | \`${profile.paths.appDir}/\` | ${profile.stack === "nextjs" ? "Next.js App Router" : "routes"} |`);
  }
  if (rows.length === 0) {
    rows.push("| (flat) | Inspect codebase | No standard feature/service layout detected |");
  }
  return rows.join("\n");
}

function agentsMdContent(profile: ProjectProfile): string {
  return `# AGENTS.md

> Agent entry point for **${profile.name}**. Read \`.agents/\` guides before scaffolding or large changes.

**Stack:** ${profile.stack}  
**Dev command:** \`${profile.devCommand}\`

## Project layout (detected)

| Area | Path | Notes |
|------|------|-------|
${folderTable(profile)}

## Core rules

- Use strict TypeScript. Avoid \`any\` unless unavoidable.
- Follow **existing** structure — paths above were scanned from this repo.
- Prefer minimal, focused diffs.
- Never commit secrets or API keys.
- Verify changes before claiming work is complete (\`${profile.devCommand}\`${profile.rules.lintCommand ? `, \`${profile.rules.lintCommand}\`` : ""}).

## Guides (read when relevant)

| Guide | When |
|-------|------|
| [feature-structure.md](.agents/feature-structure.md) | Feature modules |
| [component-structure.md](.agents/component-structure.md) | Shared / UI components |
| [service-structure.md](.agents/service-structure.md) | API / data layer |
| [naming-conventions.md](.agents/naming-conventions.md) | Naming questions |
| [atlassian.md](.agents/atlassian.md) | Jira / Confluence via MCP |
| [mcp-guide.md](.agents/mcp-guide.md) | MCP setup |

<!-- agent-kit:begin -->
## Agent Kit

Installed via Agent Kit analyze → generate workflow. Rules in harness folder reflect **this project's** detected paths and conventions.
<!-- agent-kit:end -->
`;
}

export function generateDocs(profile: ProjectProfile, harness?: string): GeneratedFile[] {
  return [
    { path: "AGENTS.md", content: agentsMdContent(profile) },
    { path: ".agents/feature-structure.md", content: featureStructureDoc(profile) },
    { path: ".agents/service-structure.md", content: serviceStructureDoc(profile) },
    { path: ".agents/component-structure.md", content: componentStructureDoc(profile) },
    { path: ".agents/naming-conventions.md", content: namingConventionsDoc(profile) },
    { path: ".agents/atlassian.md", content: atlassianDoc() },
    { path: ".agents/mcp-guide.md", content: mcpGuideDoc(harness) },
  ];
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
