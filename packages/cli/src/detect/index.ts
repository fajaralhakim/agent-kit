import fs from "node:fs";
import path from "node:path";
import type { DetectedStack } from "../types.js";

const IGNORED_ENTRIES = new Set([".git", ".DS_Store", "node_modules"]);

function isDirectoryEmpty(dir: string): boolean {
  if (!fs.existsSync(dir)) return true;
  const entries = fs.readdirSync(dir).filter((e) => !IGNORED_ENTRIES.has(e));
  return entries.length === 0;
}

function readPackageJson(dir: string): Record<string, unknown> | null {
  const pkgPath = path.join(dir, "package.json");
  if (!fs.existsSync(pkgPath)) return null;
  return JSON.parse(fs.readFileSync(pkgPath, "utf-8")) as Record<string, unknown>;
}

function hasDependency(pkg: Record<string, unknown>, name: string): boolean {
  const deps = {
    ...(pkg.dependencies as Record<string, string> | undefined),
    ...(pkg.devDependencies as Record<string, string> | undefined),
  };
  return name in deps;
}

function hasFile(dir: string, files: string[]): boolean {
  return files.some((f) => fs.existsSync(path.join(dir, f)));
}

function detectPackageManager(dir: string): DetectedStack["packageManager"] {
  if (fs.existsSync(path.join(dir, "bun.lock")) || fs.existsSync(path.join(dir, "bun.lockb"))) {
    return "bun";
  }
  if (fs.existsSync(path.join(dir, "pnpm-lock.yaml"))) return "pnpm";
  if (fs.existsSync(path.join(dir, "yarn.lock"))) return "yarn";
  return "npm";
}

function devCommand(pm: DetectedStack["packageManager"]): string {
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

export function detectStack(targetDir: string): DetectedStack {
  const empty = isDirectoryEmpty(targetDir);
  const pkg = readPackageJson(targetDir);
  const pm = detectPackageManager(targetDir);

  if (empty || !pkg) {
    return {
      stack: null,
      packageManager: pm,
      devCommand: devCommand(pm),
      isEmpty: empty,
      isExisting: false,
    };
  }

  const hasAppDir =
    fs.existsSync(path.join(targetDir, "src/app")) ||
    fs.existsSync(path.join(targetDir, "app"));

  if (hasDependency(pkg, "next")) {
    return {
      stack: "nextjs",
      packageManager: pm,
      devCommand: devCommand(pm),
      isEmpty: false,
      isExisting: true,
    };
  }

  if (hasDependency(pkg, "vite") && hasDependency(pkg, "react")) {
    return {
      stack: "vite-react",
      packageManager: pm,
      devCommand: devCommand(pm),
      isEmpty: false,
      isExisting: true,
    };
  }

  if (hasFile(targetDir, ["manage.py"]) || hasFile(targetDir, ["pyproject.toml"])) {
    return {
      stack: "django",
      packageManager: pm,
      devCommand: devCommand(pm),
      isEmpty: false,
      isExisting: true,
    };
  }

  return {
    stack: null,
    packageManager: pm,
    devCommand: devCommand(pm),
    isEmpty: false,
    isExisting: true,
  };
}
