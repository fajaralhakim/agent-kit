import fs from "node:fs";
import path from "node:path";
import { LAYER_PATTERNS, LAYER_ROOT_PREFIXES } from "./patterns.js";
import type {
  DetectedLayer,
  Language,
  LayerRole,
  ProjectProfile,
  Stack,
  StackFamily,
  VerificationCommands,
} from "./types.js";

const IGNORED = new Set([
  ".git",
  "node_modules",
  ".next",
  "dist",
  "build",
  ".turbo",
  ".venv",
  "venv",
  "__pycache__",
  "target",
  ".cache",
]);

const CODE_EXTENSIONS = /\.(tsx?|jsx?|mjs|cjs|py|go|rs|dart|kt|java|swift|rb|php)$/;

function readJsonFile<T>(filePath: string): T | null {
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
  } catch {
    return null;
  }
}

function readTextFile(filePath: string): string | null {
  if (!fs.existsSync(filePath)) return null;
  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch {
    return null;
  }
}

function detectPackageManager(dir: string): string {
  if (fs.existsSync(path.join(dir, "bun.lock")) || fs.existsSync(path.join(dir, "bun.lockb"))) {
    return "bun";
  }
  if (fs.existsSync(path.join(dir, "pnpm-lock.yaml"))) return "pnpm";
  if (fs.existsSync(path.join(dir, "yarn.lock"))) return "yarn";
  if (fs.existsSync(path.join(dir, "package-lock.json"))) return "npm";
  if (fs.existsSync(path.join(dir, "poetry.lock"))) return "poetry";
  if (fs.existsSync(path.join(dir, "uv.lock"))) return "uv";
  if (fs.existsSync(path.join(dir, "requirements.txt"))) return "pip";
  if (fs.existsSync(path.join(dir, "Cargo.lock"))) return "cargo";
  if (fs.existsSync(path.join(dir, "go.sum"))) return "go";
  if (fs.existsSync(path.join(dir, "pubspec.lock"))) return "flutter";
  return "npm";
}

function runScript(pm: string, scriptName: string): string {
  switch (pm) {
    case "bun":
      return `bun run ${scriptName}`;
    case "pnpm":
      return `pnpm ${scriptName}`;
    case "yarn":
      return `yarn ${scriptName}`;
    case "npm":
      return `npm run ${scriptName}`;
    default:
      return `${pm} ${scriptName}`;
  }
}

function defaultDevCommand(pm: string, stack: Stack): string {
  if (stack === "django") return "python manage.py runserver";
  if (stack === "fastapi") return "uvicorn main:app --reload";
  if (stack === "go") return "go run ./...";
  if (stack === "rust") return "cargo run";
  if (stack === "flutter") return "flutter run";
  return runScript(pm, "dev");
}

function hasDep(pkg: Record<string, unknown>, name: string): boolean {
  const deps = {
    ...(pkg.dependencies as Record<string, string> | undefined),
    ...(pkg.devDependencies as Record<string, string> | undefined),
  };
  return name in deps;
}

function detectStack(dir: string, pkg: Record<string, unknown> | null): Stack {
  if (pkg) {
    if (hasDep(pkg, "next")) return "nextjs";
    if (hasDep(pkg, "expo")) return "expo";
    if (hasDep(pkg, "react-native")) return "react-native";
    if (hasDep(pkg, "@nestjs/core")) return "nest";
    if (hasDep(pkg, "fastify")) return "fastify";
    if (hasDep(pkg, "express")) return "express";
    if (hasDep(pkg, "vite") && hasDep(pkg, "react")) return "vite-react";
  }

  if (fs.existsSync(path.join(dir, "pubspec.yaml"))) return "flutter";
  if (fs.existsSync(path.join(dir, "Cargo.toml"))) return "rust";
  if (fs.existsSync(path.join(dir, "go.mod"))) return "go";

  const pyproject = readTextFile(path.join(dir, "pyproject.toml")) ?? "";
  if (
    fs.existsSync(path.join(dir, "manage.py")) ||
    /django/i.test(pyproject)
  ) {
    return "django";
  }
  if (/fastapi/i.test(pyproject)) return "fastapi";
  if (fs.existsSync(path.join(dir, "pyproject.toml")) || fs.existsSync(path.join(dir, "requirements.txt"))) {
    return "fastapi";
  }

  return "unknown";
}

function stackFamily(stack: Stack, pkg: Record<string, unknown> | null): StackFamily {
  switch (stack) {
    case "nextjs":
      // Next.js can be fullstack when API routes are heavily used; keep frontend-web by default.
      return "fullstack";
    case "vite-react":
      return "frontend-web";
    case "expo":
    case "react-native":
    case "flutter":
      return "mobile";
    case "express":
    case "nest":
    case "fastify":
    case "fastapi":
    case "django":
    case "go":
    case "rust":
      return "backend";
    default:
      if (pkg && (hasDep(pkg, "react") || hasDep(pkg, "vue") || hasDep(pkg, "svelte"))) {
        return "frontend-web";
      }
      return "unknown";
  }
}

function detectLanguage(dir: string, pkg: Record<string, unknown> | null, stack: Stack): Language {
  if (stack === "go") return "go";
  if (stack === "rust") return "rust";
  if (stack === "flutter") return "dart";
  if (stack === "django" || stack === "fastapi") return "python";
  if (fs.existsSync(path.join(dir, "tsconfig.json"))) return "typescript";
  if (pkg) {
    if (hasDep(pkg, "typescript")) return "typescript";
    return "javascript";
  }
  return "unknown";
}

function listSubdirs(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith(".") && !IGNORED.has(e.name))
    .map((e) => e.name);
}

function detectPathAlias(dir: string): string | undefined {
  const tsconfig = readJsonFile<{ compilerOptions?: { paths?: Record<string, string[]> } }>(
    path.join(dir, "tsconfig.json"),
  );
  const paths = tsconfig?.compilerOptions?.paths;
  if (!paths) return undefined;
  for (const alias of Object.keys(paths)) {
    if (alias.startsWith("@")) {
      return alias;
    }
  }
  return undefined;
}

function isKebabCase(name: string): boolean {
  return /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(name);
}

function isSnakeCase(name: string): boolean {
  return /^[a-z][a-z0-9]*(_[a-z0-9]+)*$/.test(name);
}

function isPascalCase(name: string): boolean {
  return /^[A-Z][a-zA-Z0-9]*$/.test(name);
}

function inferNaming(names: string[]): string {
  if (names.length === 0) return "kebab-case (default)";
  const stripped = names.map((n) => n.replace(CODE_EXTENSIONS, ""));
  const kebab = stripped.filter(isKebabCase).length;
  const snake = stripped.filter(isSnakeCase).length;
  const pascal = stripped.filter(isPascalCase).length;
  const counts = [
    { name: "kebab-case", count: kebab },
    { name: "snake_case", count: snake },
    { name: "PascalCase", count: pascal },
  ];
  counts.sort((a, b) => b.count - a.count);
  return counts[0].count === 0 ? "mixed" : counts[0].name;
}

function sampleFilenames(dir: string, limit = 30): string[] {
  const results: string[] = [];
  function walk(d: string, depth: number) {
    if (results.length >= limit || !fs.existsSync(d) || depth > 4) return;
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      if (IGNORED.has(entry.name) || entry.name.startsWith(".")) continue;
      const full = path.join(d, entry.name);
      if (entry.isFile() && CODE_EXTENSIONS.test(entry.name)) {
        results.push(entry.name);
      } else if (entry.isDirectory()) {
        walk(full, depth + 1);
      }
      if (results.length >= limit) break;
    }
  }
  walk(dir, 0);
  return results;
}

function walkSubpaths(absDir: string, relDir: string): string[] {
  return listSubdirs(absDir).map((name) => `${relDir}/${name}`);
}

function detectLayers(dir: string, srcRoot: string | undefined): DetectedLayer[] {
  const layers: DetectedLayer[] = [];
  const seen = new Set<string>();
  const seenRoles = new Set<LayerRole>();

  const prefixes = LAYER_ROOT_PREFIXES.filter((p) => {
    if (p === "") return true;
    if (p === srcRoot) return true;
    return fs.existsSync(path.join(dir, p));
  });

  for (const pattern of LAYER_PATTERNS) {
    for (const prefix of prefixes) {
      for (const candidate of pattern.candidates) {
        const relPath = prefix ? `${prefix}/${candidate}` : candidate;
        const absPath = path.join(dir, relPath);
        if (seen.has(relPath)) continue;
        if (!fs.existsSync(absPath)) continue;
        if (!fs.statSync(absPath).isDirectory()) continue;

        // Skip duplicate role at lower precedence (first match wins per role per prefix).
        // We allow multiple layers with same role only when they live under different prefixes.
        const layerKey = `${pattern.role}:${prefix}`;
        if (seenRoles.has(pattern.role) && !seen.has(layerKey)) {
          // Only allow more layers of the same role if not already present at this prefix.
        }

        seen.add(relPath);
        seen.add(layerKey);
        seenRoles.add(pattern.role);

        layers.push({
          role: pattern.role,
          label: pattern.label,
          path: relPath,
          glob: `${relPath}/**/*`,
          subpaths: walkSubpaths(absPath, relPath),
        });
      }
    }
  }

  return layers;
}

function buildVerification(
  pm: string,
  stack: Stack,
  scripts: Record<string, string>,
): VerificationCommands {
  const v: VerificationCommands = {};

  if (scripts.dev) {
    v.dev = runScript(pm, "dev");
  } else if (scripts.start) {
    v.dev = runScript(pm, "start");
  } else {
    v.dev = defaultDevCommand(pm, stack);
  }

  if (scripts.lint) v.lint = runScript(pm, "lint");
  if (scripts.test) v.test = runScript(pm, "test");
  if (scripts.typecheck) v.typecheck = runScript(pm, "typecheck");
  else if (scripts["check-types"]) v.typecheck = runScript(pm, "check-types");
  if (scripts.build) v.build = runScript(pm, "build");

  // Non-JS defaults
  if (stack === "django") {
    v.test ??= "python manage.py test";
  } else if (stack === "fastapi") {
    v.test ??= "pytest";
  } else if (stack === "go") {
    v.test ??= "go test ./...";
    v.build ??= "go build ./...";
  } else if (stack === "rust") {
    v.test ??= "cargo test";
    v.build ??= "cargo build";
  } else if (stack === "flutter") {
    v.test ??= "flutter test";
    v.build ??= "flutter build";
  }

  return v;
}

function detectEntryPattern(stack: Stack): string | undefined {
  switch (stack) {
    case "nextjs":
      return "page.tsx / layout.tsx (App Router)";
    case "expo":
    case "react-native":
      return "App.tsx + screens/";
    case "flutter":
      return "lib/main.dart";
    case "express":
    case "fastify":
    case "nest":
      return "src/index.ts or src/main.ts";
    case "django":
      return "manage.py + {app}/views.py";
    case "fastapi":
      return "main.py";
    case "go":
      return "cmd/{name}/main.go";
    case "rust":
      return "src/main.rs";
    default:
      return undefined;
  }
}

export function analyzeProject(targetDir: string): ProjectProfile {
  const dir = path.resolve(targetDir);
  const pkg = readJsonFile<Record<string, unknown>>(path.join(dir, "package.json"));
  const pm = detectPackageManager(dir);
  const stack = detectStack(dir, pkg);
  const family = stackFamily(stack, pkg);
  const language = detectLanguage(dir, pkg, stack);
  const srcRoot = fs.existsSync(path.join(dir, "src")) ? "src" : undefined;

  const layers = detectLayers(dir, srcRoot);
  const pathAlias = detectPathAlias(dir);

  const scripts = (pkg?.scripts as Record<string, string> | undefined) ?? {};
  const verification = buildVerification(pm, stack, scripts);

  // Sample filenames from the largest layer (or src/) for naming inference.
  let sampleDir: string | undefined;
  if (layers.length > 0) {
    sampleDir = path.join(dir, layers[0].path);
  } else if (srcRoot) {
    sampleDir = path.join(dir, srcRoot);
  } else {
    sampleDir = dir;
  }

  const fileSamples = sampleFilenames(sampleDir);
  const folderSamples = layers.flatMap((l) => l.subpaths.map((s) => path.basename(s)));

  return {
    name: (pkg?.name as string) ?? path.basename(dir),
    stack,
    stackFamily: family,
    language,
    packageManager: pm,
    devCommand: verification.dev ?? defaultDevCommand(pm, stack),
    layers,
    conventions: {
      folderNaming: inferNaming(folderSamples),
      fileNaming: inferNaming(fileSamples),
      pathAlias,
      entryPattern: detectEntryPattern(stack),
    },
    verification,
    hasExistingAgentsMd: fs.existsSync(path.join(dir, "AGENTS.md")),
    scripts,
    srcRoot,
  };
}
