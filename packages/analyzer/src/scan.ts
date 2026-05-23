import fs from "node:fs";
import path from "node:path";
import type { ProjectProfile, Stack } from "./types.js";

const IGNORED = new Set([".git", "node_modules", ".next", "dist", "build", ".turbo"]);

function readJsonFile<T>(filePath: string): T | null {
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
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
  return "npm";
}

function devCommand(pm: string): string {
  switch (pm) {
    case "bun":
      return "bun run dev";
    case "pnpm":
      return "pnpm dev";
    case "yarn":
      return "yarn dev";
    default:
      return "npm run dev";
  }
}

function hasDep(pkg: Record<string, unknown>, name: string): boolean {
  const deps = {
    ...(pkg.dependencies as Record<string, string> | undefined),
    ...(pkg.devDependencies as Record<string, string> | undefined),
  };
  return name in deps;
}

function detectStack(dir: string, pkg: Record<string, unknown> | null): Stack {
  if (!pkg) {
    if (fs.existsSync(path.join(dir, "manage.py")) || fs.existsSync(path.join(dir, "pyproject.toml"))) {
      return "django";
    }
    return "unknown";
  }
  if (hasDep(pkg, "next")) return "nextjs";
  if (hasDep(pkg, "vite") && hasDep(pkg, "react")) return "vite-react";
  if (fs.existsSync(path.join(dir, "manage.py")) || fs.existsSync(path.join(dir, "pyproject.toml"))) {
    return "django";
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

function walkFeatureDirs(base: string, relPrefix: string): string[] {
  return listSubdirs(base).map((name) => `${relPrefix}/${name}`);
}

function detectPathAlias(dir: string): string | undefined {
  const tsconfig = readJsonFile<{ compilerOptions?: { paths?: Record<string, string[]> } }>(
    path.join(dir, "tsconfig.json"),
  );
  const paths = tsconfig?.compilerOptions?.paths;
  if (!paths) return undefined;
  for (const alias of Object.keys(paths)) {
    if (alias.startsWith("@")) {
      return alias.replace(/\*$/, "*");
    }
  }
  return "@/*";
}

function isKebabCase(name: string): boolean {
  return /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(name);
}

function isPascalCase(name: string): boolean {
  return /^[A-Z][a-zA-Z0-9]*$/.test(name.replace(/\.(tsx?|jsx?)$/, ""));
}

function inferNaming(names: string[]): string {
  if (names.length === 0) return "kebab-case (default)";
  const kebab = names.filter(isKebabCase).length;
  const pascal = names.filter((n) => isPascalCase(n)).length;
  if (kebab >= pascal) return "kebab-case";
  if (pascal > kebab) return "PascalCase";
  return "kebab-case";
}

function sampleFilenames(dir: string, limit = 20): string[] {
  const results: string[] = [];
  function walk(d: string) {
    if (results.length >= limit || !fs.existsSync(d)) return;
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      if (IGNORED.has(entry.name)) continue;
      const full = path.join(d, entry.name);
      if (entry.isFile() && /\.(tsx?|jsx?)$/.test(entry.name)) {
        results.push(entry.name);
      } else if (entry.isDirectory()) {
        walk(full);
      }
      if (results.length >= limit) break;
    }
  }
  walk(dir);
  return results;
}

function detectThinRoutes(appDir: string, featuresBase: string): boolean {
  if (!fs.existsSync(appDir) || !fs.existsSync(featuresBase)) return false;

  function findRouteFiles(dir: string): string[] {
    const files: string[] = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...findRouteFiles(full));
      } else if (/^page\.(tsx?|jsx?)$/.test(entry.name)) {
        files.push(full);
      }
    }
    return files;
  }

  const routes = findRouteFiles(appDir).slice(0, 5);
  if (routes.length === 0) return false;

  let thinCount = 0;
  for (const route of routes) {
    const content = fs.readFileSync(route, "utf-8");
    const lines = content.split("\n").filter((l) => l.trim() && !l.trim().startsWith("//"));
    const importsFeature = /@\/features\/|from ['"].*features\//.test(content);
    const isShort = lines.length <= 15;
    if (importsFeature && isShort) thinCount++;
  }
  return thinCount >= Math.ceil(routes.length / 2);
}

export function analyzeProject(targetDir: string): ProjectProfile {
  const dir = path.resolve(targetDir);
  const pkg = readJsonFile<Record<string, unknown>>(path.join(dir, "package.json"));
  const pm = detectPackageManager(dir);
  const stack = detectStack(dir, pkg);
  const srcRoot = fs.existsSync(path.join(dir, "src")) ? "src" : undefined;
  const prefix = srcRoot ? `${srcRoot}/` : "";

  const featuresRel = `${prefix}features`.replace(/\/$/, "");
  const servicesRel = `${prefix}services`.replace(/\/$/, "");
  const componentsRel = `${prefix}components`.replace(/\/$/, "");

  const featuresDir = path.join(dir, featuresRel);
  const servicesDir = path.join(dir, servicesRel);
  const componentsDir = path.join(dir, componentsRel);

  const features = fs.existsSync(featuresDir) ? walkFeatureDirs(featuresDir, featuresRel) : [];
  const services = fs.existsSync(servicesDir) ? walkFeatureDirs(servicesDir, servicesRel) : [];

  const componentSubs: Record<string, boolean> = {};
  if (fs.existsSync(componentsDir)) {
    for (const sub of listSubdirs(componentsDir)) {
      componentSubs[sub] = true;
    }
  }

  let appDir: string | undefined;
  let appRouter = false;
  const appPath = path.join(dir, `${prefix}app`.replace(/\/$/, ""));
  if (fs.existsSync(appPath)) {
    appDir = `${prefix}app`.replace(/\/$/, "");
    appRouter = stack === "nextjs";
  } else if (fs.existsSync(path.join(dir, "app"))) {
    appDir = "app";
    appRouter = stack === "nextjs";
  }

  const featureFolderNames = features.map((f) => path.basename(f));
  const componentFiles = fs.existsSync(componentsDir) ? sampleFilenames(componentsDir) : [];
  const pathAlias = detectPathAlias(dir);

  const scripts = (pkg?.scripts as Record<string, string> | undefined) ?? {};
  const runPrefix = pm === "npm" ? "npm run" : pm;
  const lintCommand = scripts.lint ? `${runPrefix} lint` : undefined;
  const typecheckCommand = scripts.typecheck
    ? `${runPrefix} typecheck`
    : scripts["check-types"]
      ? `${runPrefix} check-types`
      : undefined;

  const hasThinRoutes = appDir
    ? detectThinRoutes(path.join(dir, appDir), featuresDir)
    : false;

  const profile: ProjectProfile = {
    name: (pkg?.name as string) ?? path.basename(dir),
    stack,
    packageManager: pm,
    devCommand: devCommand(pm),
    paths: {
      features,
      services,
      components: componentSubs,
      appRouter,
      appDir,
      srcRoot,
    },
    conventions: {
      featureNaming: inferNaming(featureFolderNames),
      componentNaming: inferNaming(componentFiles.map((f) => f.replace(/\.(tsx?|jsx?)$/, ""))),
      hasThinRoutes,
      pathAlias,
    },
    rules: {},
    hasExistingAgentsMd: fs.existsSync(path.join(dir, "AGENTS.md")),
    scripts,
  };

  if (features.length > 0) profile.rules.featureGlob = `${featuresRel}/**/*`;
  if (services.length > 0) profile.rules.serviceGlob = `${servicesRel}/**/*`;
  if (Object.keys(componentSubs).length > 0 || fs.existsSync(componentsDir)) {
    profile.rules.componentGlob = `${componentsRel}/**/*`;
  }
  if (appDir) profile.rules.appGlob = `${appDir}/**/*`;
  profile.rules.lintCommand = lintCommand;
  profile.rules.typecheckCommand = typecheckCommand;

  return profile;
}
