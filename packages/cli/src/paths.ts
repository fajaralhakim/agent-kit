import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const CLI_SRC_DIR = path.dirname(fileURLToPath(import.meta.url));

/** Repo root: agent-kit/ (contains profiles/, templates/) */
export function getKitRoot(): string {
  return path.resolve(CLI_SRC_DIR, "../../..");
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
