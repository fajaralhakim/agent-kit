import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import Handlebars from "handlebars";
import type {
  InstallContext,
  LockFile,
  LockFileEntry,
  McpServerConfig,
  ProfileManifest,
} from "../types.js";
import { getProfileDir } from "../registry/index.js";
import { getTemplatesDir } from "../paths.js";

const LOCK_FILE = ".agent-kit.lock.json";
const AGENT_KIT_SECTION = "## Agent Kit";

function checksum(content: string): string {
  return crypto.createHash("sha256").update(content).digest("hex").slice(0, 12);
}

function ensureDir(filePath: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function renderTemplate(content: string, variables: Record<string, string>): string {
  return Handlebars.compile(content, { noEscape: true })(variables);
}

function readLockFile(targetDir: string): LockFile | null {
  const lockPath = path.join(targetDir, LOCK_FILE);
  if (!fs.existsSync(lockPath)) return null;
  return JSON.parse(fs.readFileSync(lockPath, "utf-8")) as LockFile;
}

function writeLockFile(targetDir: string, lock: LockFile): void {
  fs.writeFileSync(path.join(targetDir, LOCK_FILE), `${JSON.stringify(lock, null, 2)}\n`);
}

function upsertGitignore(targetDir: string, line: string): void {
  const gitignorePath = path.join(targetDir, ".gitignore");
  const existing = fs.existsSync(gitignorePath) ? fs.readFileSync(gitignorePath, "utf-8") : "";
  if (existing.split("\n").some((l) => l.trim() === line)) return;
  const separator = existing.length > 0 && !existing.endsWith("\n") ? "\n" : "";
  fs.writeFileSync(gitignorePath, `${existing}${separator}${line}\n`);
}

function copyDirRecursive(src: string, dest: string, variables: Record<string, string>): void {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });

  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath, variables);
      continue;
    }

    ensureDir(destPath);
    let content = fs.readFileSync(srcPath, "utf-8");
    if (entry.name.endsWith(".hbs") || srcPath.includes(".hbs.")) {
      content = renderTemplate(content, variables);
    } else if (entry.name.endsWith(".md") || entry.name.endsWith(".mdc") || entry.name.endsWith(".json")) {
      content = renderTemplate(content, variables);
    }
    fs.writeFileSync(destPath, content);
  }
}

function mergeAppend(destPath: string, content: string, profileId: string): void {
  const markerBegin = `<!-- agent-kit:begin ${profileId} -->`;
  const markerEnd = `<!-- agent-kit:end ${profileId} -->`;
  const block = `\n${markerBegin}\n${content.trim()}\n${markerEnd}\n`;

  if (!fs.existsSync(destPath)) {
    ensureDir(destPath);
    fs.writeFileSync(destPath, block);
    return;
  }

  const existing = fs.readFileSync(destPath, "utf-8");
  if (existing.includes(markerBegin)) return;

  if (existing.includes(AGENT_KIT_SECTION)) {
    fs.writeFileSync(destPath, `${existing.trimEnd()}\n${block}`);
    return;
  }

  fs.writeFileSync(destPath, `${existing.trimEnd()}\n\n${AGENT_KIT_SECTION}\n${block}`);
}

function installProfileFile(
  profile: ProfileManifest,
  file: ProfileManifest["files"][number],
  ctx: InstallContext,
  lockEntries: LockFileEntry[],
  force: boolean,
): void {
  const profileDir = getProfileDir(profile.id);
  const srcPath = path.join(profileDir, file.src);
  const destPath = path.join(ctx.targetDir, file.dest);

  if (!fs.existsSync(srcPath)) {
    console.warn(`  skip missing: ${file.src}`);
    return;
  }

  if (fs.existsSync(destPath) && !force && file.merge !== "append") {
    console.log(`  skip exists: ${file.dest}`);
    return;
  }

  let content = fs.readFileSync(srcPath, "utf-8");
  if (file.template !== false) {
    content = renderTemplate(content, ctx.variables);
  }

  if (file.merge === "append") {
    mergeAppend(destPath, content, profile.id);
  } else {
    ensureDir(destPath);
    fs.writeFileSync(destPath, content);
  }

  lockEntries.push({
    path: file.dest,
    checksum: checksum(content),
    profile: profile.id,
  });
  console.log(`  + ${file.dest}`);
}

export function scaffoldTemplate(templateName: string, targetDir: string, variables: Record<string, string>): void {
  const templateDir = path.join(getTemplatesDir(), templateName);
  if (!fs.existsSync(templateDir)) {
    throw new Error(`Template not found: ${templateName}`);
  }
  console.log(`  scaffolding from templates/${templateName}/`);
  copyDirRecursive(templateDir, targetDir, variables);
}

export function mergeMcpServers(
  targetDir: string,
  servers: Record<string, McpServerConfig>,
): void {
  const mcpPath = path.join(targetDir, ".cursor/mcp.json");
  const examplePath = path.join(targetDir, ".cursor/mcp.json.example");

  let existing: { mcpServers: Record<string, McpServerConfig> } = { mcpServers: {} };
  if (fs.existsSync(mcpPath)) {
    existing = JSON.parse(fs.readFileSync(mcpPath, "utf-8")) as typeof existing;
  }

  existing.mcpServers = { ...existing.mcpServers, ...servers };
  ensureDir(mcpPath);
  fs.writeFileSync(mcpPath, `${JSON.stringify(existing, null, 2)}\n`);
  fs.writeFileSync(examplePath, `${JSON.stringify(existing, null, 2)}\n`);
  upsertGitignore(targetDir, ".cursor/mcp.json");
}

export function installProfiles(
  profiles: ProfileManifest[],
  ctx: InstallContext,
  options: { force?: boolean; scaffold?: boolean; agentKitVersion?: string } = {},
): LockFile {
  const lockEntries: LockFileEntry[] = [];
  const profileIds = profiles.map((p) => p.id);

  for (const profile of profiles) {
    console.log(`Installing profile: ${profile.name} (${profile.id})`);

    if (
      options.scaffold &&
      profile.scaffoldOnEmpty &&
      profile.template &&
      ctx.detected.isEmpty
    ) {
      scaffoldTemplate(profile.template, ctx.targetDir, ctx.variables);
    }

    for (const file of profile.files) {
      installProfileFile(profile, file, ctx, lockEntries, options.force ?? false);
    }

    if (profile.mcpServers) {
      mergeMcpServers(ctx.targetDir, profile.mcpServers);
    }
  }

  const existingLock = readLockFile(ctx.targetDir);
  const lock: LockFile = {
    version: "1.0.0",
    agentKitVersion: options.agentKitVersion ?? "0.1.0",
    installedAt: new Date().toISOString(),
    profiles: [...new Set([...(existingLock?.profiles ?? []), ...profileIds])],
    detected: {
      stack: ctx.detected.stack ?? undefined,
      packageManager: ctx.detected.packageManager,
      devCommand: ctx.detected.devCommand,
    },
    files: [...(existingLock?.files ?? []), ...lockEntries],
  };

  writeLockFile(ctx.targetDir, lock);
  return lock;
}

export function readProjectLock(targetDir: string): LockFile | null {
  return readLockFile(targetDir);
}

export { LOCK_FILE };
