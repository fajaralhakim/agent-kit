import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const CLI_SRC_DIR = path.dirname(fileURLToPath(import.meta.url));

/** Repo / package root (contains profiles/, templates/) */
export function getKitRoot(): string {
  if (process.env.AGENT_KIT_ROOT) {
    return process.env.AGENT_KIT_ROOT;
  }

  const fromCli = path.resolve(CLI_SRC_DIR, "../../..");
  if (fs.existsSync(path.join(fromCli, "profiles"))) {
    return fromCli;
  }

  let dir = CLI_SRC_DIR;
  for (let i = 0; i < 8; i++) {
    if (fs.existsSync(path.join(dir, "profiles"))) {
      return dir;
    }
    dir = path.dirname(dir);
  }

  return fromCli;
}

export function getProfilesDir(): string {
  return path.join(getKitRoot(), "profiles");
}

export function getTemplatesDir(): string {
  return path.join(getKitRoot(), "templates");
}

export function resolveProfileDir(profileId: string): string {
  if (profileId.startsWith("_") || profileId.includes("/")) {
    return profileId.includes("/")
      ? path.resolve(profileId)
      : path.join(getProfilesDir(), profileId);
  }

  const stackPath = path.join(getProfilesDir(), profileId);
  if (fs.existsSync(path.join(stackPath, "manifest.json"))) {
    return stackPath;
  }

  const addonPath = path.join(getProfilesDir(), "addons", profileId);
  if (fs.existsSync(path.join(addonPath, "manifest.json"))) {
    return addonPath;
  }

  return stackPath;
}
