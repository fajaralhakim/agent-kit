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
  try {
    return JSON.parse(fs.readFileSync(pkgPath, "utf-8")) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function readTextFile(filePath: string): string {
  if (!fs.existsSync(filePath)) return "";
  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch {
    return "";
  }
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

function devCommand(pm: DetectedStack["packageManager"], stack: string | null): string {
  if (stack === "django") return "python manage.py runserver";
  if (stack === "fastapi") return "uvicorn main:app --reload";
  if (stack === "go") return "go run ./...";
  if (stack === "rust") return "cargo run";
  if (stack === "flutter") return "flutter run";
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

function detectStackName(dir: string, pkg: Record<string, unknown> | null): string | null {
  if (pkg) {
    if (hasDependency(pkg, "next")) return "nextjs";
    if (hasDependency(pkg, "expo")) return "expo";
    if (hasDependency(pkg, "react-native")) return "react-native";
    if (hasDependency(pkg, "@nestjs/core")) return "nest";
    if (hasDependency(pkg, "fastify")) return "fastify";
    if (hasDependency(pkg, "express")) return "express";
    if (hasDependency(pkg, "vite") && hasDependency(pkg, "react")) return "vite-react";
  }

  if (hasFile(dir, ["pubspec.yaml"])) return "flutter";
  if (hasFile(dir, ["Cargo.toml"])) return "rust";
  if (hasFile(dir, ["go.mod"])) return "go";

  const pyproject = readTextFile(path.join(dir, "pyproject.toml"));
  if (hasFile(dir, ["manage.py"]) || /django/i.test(pyproject)) return "django";
  if (/fastapi/i.test(pyproject)) return "fastapi";
  if (hasFile(dir, ["pyproject.toml", "requirements.txt"])) return "fastapi";

  return null;
}

export function detectStack(targetDir: string): DetectedStack {
  const empty = isDirectoryEmpty(targetDir);
  const pkg = readPackageJson(targetDir);
  const pm = detectPackageManager(targetDir);

  if (empty) {
    return {
      stack: null,
      packageManager: pm,
      devCommand: devCommand(pm, null),
      isEmpty: true,
      isExisting: false,
    };
  }

  const stack = detectStackName(targetDir, pkg);

  return {
    stack,
    packageManager: pm,
    devCommand: devCommand(pm, stack),
    isEmpty: false,
    isExisting: true,
  };
}
