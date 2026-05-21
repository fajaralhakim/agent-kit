import fs from "node:fs";
import path from "node:path";
import type { ProfileManifest } from "../types.js";
import { getProfilesDir, resolveProfileDir } from "../paths.js";

export function loadManifest(profileId: string): ProfileManifest {
  const profileDir = resolveProfileDir(profileId);
  const manifestPath = path.join(profileDir, "manifest.json");

  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Profile not found: ${profileId} (${manifestPath})`);
  }

  const raw = JSON.parse(fs.readFileSync(manifestPath, "utf-8")) as ProfileManifest;
  return { ...raw, id: raw.id ?? profileId };
}

export function resolveProfileChain(profileIds: string[]): ProfileManifest[] {
  const resolved = new Map<string, ProfileManifest>();
  const queue = [...profileIds];

  while (queue.length > 0) {
    const id = queue.shift()!;
    if (resolved.has(id)) continue;

    const manifest = loadManifest(id);
    resolved.set(id, manifest);

    for (const req of manifest.requires ?? []) {
      if (!resolved.has(req)) queue.push(req);
    }
  }

  const order = ["_core", ...profileIds.filter((id) => id !== "_core")];
  const seen = new Set<string>();
  const result: ProfileManifest[] = [];

  for (const id of order) {
    if (resolved.has(id) && !seen.has(id)) {
      result.push(resolved.get(id)!);
      seen.add(id);
    }
  }

  for (const [id, manifest] of resolved) {
    if (!seen.has(id)) {
      result.push(manifest);
      seen.add(id);
    }
  }

  return result;
}

export function listAvailableProfiles(): string[] {
  const profilesDir = getProfilesDir();
  const ids: string[] = [];

  if (fs.existsSync(path.join(profilesDir, "_core"))) ids.push("_core");

  for (const entry of fs.readdirSync(profilesDir, { withFileTypes: true })) {
    if (entry.isDirectory() && !entry.name.startsWith("_") && entry.name !== "addons") {
      ids.push(entry.name);
    }
  }

  const addonsDir = path.join(profilesDir, "addons");
  if (fs.existsSync(addonsDir)) {
    for (const entry of fs.readdirSync(addonsDir, { withFileTypes: true })) {
      if (entry.isDirectory()) ids.push(entry.name);
    }
  }

  return ids;
}

export function getProfileDir(profileId: string): string {
  return resolveProfileDir(profileId);
}
