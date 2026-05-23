import type { GeneratedFile, Harness, ProjectProfile } from "./types.js";

type RuleFormat = "mdc" | "md";

function ruleExt(harness: Harness): RuleFormat {
  return harness === "cursor" ? "mdc" : "md";
}

function rulesDir(harness: Harness): string {
  switch (harness) {
    case "cursor":
      return ".cursor/rules";
    case "claude-code":
      return ".claude/rules";
    case "antigravity":
      return ".agent/rules";
    case "opencode":
      return ".opencode/rules";
    case "copilot":
      return ".github/instructions";
    default:
      return ".cursor/rules";
  }
}

function formatRule(
  harness: Harness,
  description: string,
  globs: string[] | undefined,
  alwaysApply: boolean,
  body: string,
): string {
  const ext = ruleExt(harness);
  const frontmatter: string[] = [`description: ${description}`];
  if (globs && globs.length > 0) {
    frontmatter.push(`globs: ${globs.join(",")}`);
  }
  frontmatter.push(`alwaysApply: ${alwaysApply}`);

  if (ext === "mdc") {
    return `---\n${frontmatter.join("\n")}\n---\n\n${body.trim()}\n`;
  }

  return `# ${description}\n\n${body.trim()}\n`;
}

function coreStandardsRule(profile: ProjectProfile, harness: Harness): GeneratedFile {
  const alias = profile.conventions.pathAlias ?? "@/*";
  const body = `# Core Standards

- Use strict TypeScript. Avoid \`any\`.
- Path alias: \`${alias}\`
- Package manager: **${profile.packageManager}**
- Dev server: \`${profile.devCommand}\`
- Match existing naming and folder conventions (see \`.agents/naming-conventions.md\`).
- Keep changes minimal — one concern per change.
- Do not commit secrets (API keys, tokens, \`.env\`).
- Do not add dependencies without explicit approval.
`;

  return {
    path: `${rulesDir(harness)}/core-standards.${ruleExt(harness)}`,
    content: formatRule(harness, "Core coding standards for this project", undefined, true, body),
  };
}

function projectArchitectureRule(profile: ProjectProfile, harness: Harness): GeneratedFile | null {
  const { features, services, appDir, srcRoot } = profile.paths;
  const hasStructure = features.length > 0 || services.length > 0;

  const globs = [
    profile.rules.featureGlob,
    profile.rules.serviceGlob,
    profile.rules.componentGlob,
    profile.rules.appGlob,
  ].filter((g): g is string => Boolean(g));

  if (!hasStructure && globs.length === 0) {
    const body = `# Project Architecture (generated)

No \`features/\` or \`services/\` layout detected. This project uses a flat or custom structure.

- Inspect existing modules before adding new folders.
- Do not invent \`src/features/\` or parallel layouts unless the team adopts them explicitly.
- Follow patterns in neighboring files.
`;
    return {
      path: `${rulesDir(harness)}/project-architecture.${ruleExt(harness)}`,
      content: formatRule(
        harness,
        "Project structure conventions (detected from codebase)",
        undefined,
        false,
        body,
      ),
    };
  }

  const lines: string[] = ["# Project Architecture (generated)", ""];

  if (features.length > 0) {
    const base = srcRoot ? `${srcRoot}/features` : "features";
    lines.push(`- **Features** live in \`${base}/{${profile.conventions.featureNaming}}/\``);
    lines.push(`  Detected: ${features.map((f) => "`" + f + "/`").join(", ")}`);
  }
  if (services.length > 0) {
    const base = srcRoot ? `${srcRoot}/services` : "services";
    lines.push(`- **Services** live in \`${base}/{domain}/\``);
    lines.push(`  Detected: ${services.map((s) => "`" + s + "/`").join(", ")}`);
  }
  const compSubs = Object.keys(profile.paths.components);
  if (compSubs.length > 0) {
    const base = srcRoot ? `${srcRoot}/components` : "components";
    lines.push(`- **Components** → \`${base}/\` subfolders: ${compSubs.join(", ")}`);
  }
  if (appDir && profile.conventions.hasThinRoutes) {
    lines.push(`- **Routes** in \`${appDir}/\` stay thin — delegate to features via path alias`);
  } else if (appDir) {
    lines.push(`- **Routes** in \`${appDir}/\` — keep route files focused; avoid heavy business logic inline`);
  }

  lines.push("- Do not create parallel folder structures outside paths above.");
  lines.push("- See \`.agents/feature-structure.md\` and related guides for details.");

  return {
    path: `${rulesDir(harness)}/project-architecture.${ruleExt(harness)}`,
    content: formatRule(
      harness,
      "Enforce this project's feature/service architecture",
      globs.length > 0 ? globs : undefined,
      false,
      lines.join("\n"),
    ),
  };
}

function stackRulesRule(profile: ProjectProfile, harness: Harness): GeneratedFile | null {
  if (profile.stack === "nextjs" && profile.paths.appDir) {
    const body = `# Next.js / App Router

- App Router root: \`${profile.paths.appDir}/\`
- Route files: \`page.tsx\`, \`layout.tsx\`, \`loading.tsx\` — keep thin when features exist
- Use Server Components by default; \`"use client"\` only when needed
- Data fetching in features or services, not duplicated in every route
`;
    return {
      path: `${rulesDir(harness)}/stack-rules.${ruleExt(harness)}`,
      content: formatRule(
        harness,
        "Stack-specific rules (Next.js detected)",
        [profile.rules.appGlob ?? `${profile.paths.appDir}/**/*`],
        false,
        body,
      ),
    };
  }

  if (profile.stack === "vite-react") {
    const src = profile.paths.srcRoot ?? "src";
    const body = `# Vite + React

- Entry and routes under \`${src}/\`
- Prefer feature folders under \`${src}/features/\` when present
- Environment variables: \`import.meta.env\`
`;
    return {
      path: `${rulesDir(harness)}/stack-rules.${ruleExt(harness)}`,
      content: formatRule(
        harness,
        "Stack-specific rules (Vite + React detected)",
        [`${src}/**/*`],
        false,
        body,
      ),
    };
  }

  return null;
}

function verificationRule(profile: ProjectProfile, harness: Harness): GeneratedFile {
  const checks: string[] = [`- Run \`${profile.devCommand}\` to verify the app starts`];
  if (profile.rules.lintCommand) {
    checks.push(`- Run \`${profile.rules.lintCommand}\` before finishing`);
  }
  if (profile.rules.typecheckCommand) {
    checks.push(`- Run \`${profile.rules.typecheckCommand}\` when types may be affected`);
  }
  checks.push("- Do not claim work is complete without running applicable checks.");

  const body = `# Verification

Before marking a task done:

${checks.join("\n")}
`;

  return {
    path: `${rulesDir(harness)}/verification.${ruleExt(harness)}`,
    content: formatRule(harness, "Verify changes before completion", undefined, false, body),
  };
}

export function generateRules(profile: ProjectProfile, harness: Harness = "cursor"): GeneratedFile[] {
  const files: GeneratedFile[] = [
    coreStandardsRule(profile, harness),
    verificationRule(profile, harness),
  ];

  const arch = projectArchitectureRule(profile, harness);
  if (arch) files.push(arch);

  const stack = stackRulesRule(profile, harness);
  if (stack) files.push(stack);

  return files;
}

export function generateCopilotInstructions(profile: ProjectProfile): GeneratedFile {
  const rules = generateRules(profile, "copilot");
  const body = rules
    .map((r) => r.content)
    .join("\n---\n\n");

  return {
    path: ".github/copilot-instructions.md",
    content: `# Copilot Instructions (Agent Kit generated)\n\n${body}`,
  };
}
