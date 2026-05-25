import type { GeneratedFile, Harness, Language, ProjectProfile } from "./types.js";

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

function languageStandards(language: Language): string {
  switch (language) {
    case "typescript":
      return "- Use strict TypeScript. Avoid `any` unless unavoidable.";
    case "javascript":
      return "- Prefer JSDoc types where the project uses them. Avoid leaving unused variables.";
    case "python":
      return "- Use type hints where existing code uses them. Match the project's typing strictness (mypy/pyright).";
    case "go":
      return "- Use `gofmt` and idiomatic Go. Handle every error explicitly.";
    case "rust":
      return "- Use `cargo fmt` and idiomatic Rust. Prefer `?` for error propagation.";
    case "dart":
      return "- Use `dart format`. Follow Effective Dart conventions.";
    default:
      return "- Follow the language conventions used by the existing codebase.";
  }
}

function coreStandardsRule(profile: ProjectProfile, harness: Harness): GeneratedFile {
  const alias = profile.conventions.pathAlias ? `\n- Path alias: \`${profile.conventions.pathAlias}\`` : "";
  const body = `# Core Standards

${languageStandards(profile.language)}${alias}
- Package manager: **${profile.packageManager}**
- Dev command: \`${profile.devCommand}\`
- Match existing naming and folder conventions (see \`.agents/code-conventions.md\`).
- Keep changes minimal — one concern per change.
- Do not commit secrets (API keys, tokens, \`.env\`).
- Do not add dependencies without explicit approval.
`;

  return {
    path: `${rulesDir(harness)}/core-standards.${ruleExt(harness)}`,
    content: formatRule(harness, "Core coding standards for this project", undefined, true, body),
  };
}

function projectArchitectureRule(profile: ProjectProfile, harness: Harness): GeneratedFile {
  const globs = profile.layers.map((l) => l.glob);

  if (profile.layers.length === 0) {
    const body = `# Project Architecture (generated)

No standard layered structure detected. This project uses a flat or custom layout.

- Inspect existing modules before adding new folders.
- Do not invent \`src/features/\`, \`src/services/\`, or parallel layouts unless the team adopts them explicitly.
- Follow patterns in neighboring files.
- See \`.agents/architecture.md\` for project-specific guidance.
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

  for (const layer of profile.layers) {
    const subpathList =
      layer.subpaths.length > 0
        ? layer.subpaths.map((s) => "`" + s + "/`").join(", ")
        : "_(empty)_";
    lines.push(`- **${layer.label}** → \`${layer.path}/\` — detected: ${subpathList}`);
  }

  lines.push("");
  lines.push("- Do not create parallel folder structures outside the layers above.");
  lines.push("- New work belongs in an existing layer.");
  lines.push("- See `.agents/architecture.md` for responsibilities per layer.");

  return {
    path: `${rulesDir(harness)}/project-architecture.${ruleExt(harness)}`,
    content: formatRule(
      harness,
      "Enforce this project's detected architecture",
      globs.length > 0 ? globs : undefined,
      false,
      lines.join("\n"),
    ),
  };
}

function stackRulesRule(profile: ProjectProfile, harness: Harness): GeneratedFile | null {
  const { stack, layers } = profile;
  const routes = layers.find((l) => l.role === "routes");
  const handlers = layers.find((l) => l.role === "handlers");
  const screens = layers.find((l) => l.role === "screens");

  if (stack === "nextjs" && routes) {
    const body = `# Next.js / App Router

- App Router root: \`${routes.path}/\`
- Route files: \`page.tsx\`, \`layout.tsx\`, \`loading.tsx\` — keep thin when modules exist
- Use Server Components by default; \`"use client"\` only when needed
- Data fetching in modules or data layer, not duplicated in every route
`;
    return {
      path: `${rulesDir(harness)}/stack-rules.${ruleExt(harness)}`,
      content: formatRule(
        harness,
        "Stack-specific rules (Next.js detected)",
        [routes.glob],
        false,
        body,
      ),
    };
  }

  if (stack === "vite-react") {
    const src = profile.srcRoot ?? "src";
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

  if (stack === "express" || stack === "fastify") {
    const globs = [routes?.glob, handlers?.glob].filter((g): g is string => Boolean(g));
    const body = `# ${stack === "express" ? "Express" : "Fastify"}

- Keep route declarations thin — delegate to handlers/services
- Validate input at the boundary (handlers); never trust request bodies directly
- Group related routes by domain under \`${routes?.path ?? "routes/"}\` (if present)
- Centralize error handling middleware
`;
    return {
      path: `${rulesDir(harness)}/stack-rules.${ruleExt(harness)}`,
      content: formatRule(
        harness,
        `Stack-specific rules (${stack} detected)`,
        globs.length > 0 ? globs : undefined,
        false,
        body,
      ),
    };
  }

  if (stack === "nest") {
    const body = `# NestJS

- Controllers handle routing and validation; services hold business logic; repositories own data access
- Use DTOs + class-validator for request payloads
- Inject dependencies via constructor; avoid manual instantiation in handlers
`;
    return {
      path: `${rulesDir(harness)}/stack-rules.${ruleExt(harness)}`,
      content: formatRule(harness, "Stack-specific rules (NestJS detected)", undefined, false, body),
    };
  }

  if (stack === "django") {
    const body = `# Django

- One concern per app under \`apps/\` or top-level (models, views, urls, serializers, admin)
- Use class-based or function-based views consistently — match what's already there
- Migrations are append-only; never edit a committed migration
- Settings split: \`settings/base.py\`, \`settings/dev.py\`, etc., if present
`;
    return {
      path: `${rulesDir(harness)}/stack-rules.${ruleExt(harness)}`,
      content: formatRule(harness, "Stack-specific rules (Django detected)", undefined, false, body),
    };
  }

  if (stack === "fastapi") {
    const body = `# FastAPI

- Define routers per domain; mount them in the main app
- Use Pydantic models for request/response validation
- Keep business logic out of route functions; delegate to services
- Async-first: use \`async def\` for routes that touch I/O
`;
    return {
      path: `${rulesDir(harness)}/stack-rules.${ruleExt(harness)}`,
      content: formatRule(harness, "Stack-specific rules (FastAPI detected)", undefined, false, body),
    };
  }

  if (stack === "expo" || stack === "react-native") {
    const globs = [screens?.glob, layers.find((l) => l.role === "navigation")?.glob].filter(
      (g): g is string => Boolean(g),
    );
    const body = `# ${stack === "expo" ? "Expo" : "React Native"}

- Screens under \`${screens?.path ?? "screens/"}\` — one folder per screen
- Navigation centralized (stack/tab navigators) — do not declare routes inline
- Keep platform-specific code behind \`.ios.tsx\` / \`.android.tsx\` suffixes
- Use Reanimated/Gesture Handler for animations rather than ad-hoc Animated API
`;
    return {
      path: `${rulesDir(harness)}/stack-rules.${ruleExt(harness)}`,
      content: formatRule(
        harness,
        `Stack-specific rules (${stack} detected)`,
        globs.length > 0 ? globs : undefined,
        false,
        body,
      ),
    };
  }

  if (stack === "flutter") {
    const body = `# Flutter

- Entry: \`lib/main.dart\`
- Group features under \`lib/features/\` or \`lib/modules/\`
- Use \`flutter format\` and run \`flutter analyze\` before finishing
- Prefer composition over deep widget inheritance
`;
    return {
      path: `${rulesDir(harness)}/stack-rules.${ruleExt(harness)}`,
      content: formatRule(harness, "Stack-specific rules (Flutter detected)", undefined, false, body),
    };
  }

  if (stack === "go") {
    const body = `# Go

- Layout: \`cmd/{name}/main.go\` for entrypoints; \`internal/\` for private packages; \`pkg/\` for reusable libs
- Run \`go vet\` and \`go test ./...\` before claiming completion
- Wrap errors with \`fmt.Errorf("...: %w", err)\` — never swallow
`;
    return {
      path: `${rulesDir(harness)}/stack-rules.${ruleExt(harness)}`,
      content: formatRule(harness, "Stack-specific rules (Go detected)", undefined, false, body),
    };
  }

  if (stack === "rust") {
    const body = `# Rust

- Run \`cargo fmt\`, \`cargo clippy\`, and \`cargo test\` before finishing
- Prefer \`Result<T, E>\` and \`?\` over panics
- Module structure mirrors directory layout under \`src/\`
`;
    return {
      path: `${rulesDir(harness)}/stack-rules.${ruleExt(harness)}`,
      content: formatRule(harness, "Stack-specific rules (Rust detected)", undefined, false, body),
    };
  }

  return null;
}

function verificationRule(profile: ProjectProfile, harness: Harness): GeneratedFile {
  const v = profile.verification;
  const checks: string[] = [];
  if (v.dev) checks.push(`- Start the app with \`${v.dev}\` to confirm it runs`);
  if (v.test) checks.push(`- Run \`${v.test}\` before claiming completion`);
  if (v.lint) checks.push(`- Run \`${v.lint}\` before finishing`);
  if (v.typecheck) checks.push(`- Run \`${v.typecheck}\` when types may be affected`);
  if (v.build) checks.push(`- Run \`${v.build}\` if shipping or before release`);
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
    projectArchitectureRule(profile, harness),
  ];

  const stack = stackRulesRule(profile, harness);
  if (stack) files.push(stack);

  return files;
}

export function generateCopilotInstructions(profile: ProjectProfile): GeneratedFile {
  const rules = generateRules(profile, "copilot");
  const body = rules.map((r) => r.content).join("\n---\n\n");

  return {
    path: ".github/copilot-instructions.md",
    content: `# Copilot Instructions (Agent Kit generated)\n\n${body}`,
  };
}
