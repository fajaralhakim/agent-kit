import type { LayerRole } from "./types.js";

export interface LayerPattern {
  role: LayerRole;
  label: string;
  candidates: string[];
}

/**
 * Layer pattern registry — maps folder-name candidates to a role label.
 * Scan probes each candidate under common root prefixes (e.g. ``, `src/`, `app/`, `internal/`).
 * Only layers that exist on disk are emitted to the profile.
 */
export const LAYER_PATTERNS: LayerPattern[] = [
  {
    role: "modules",
    label: "Modules",
    candidates: ["features", "modules", "domain", "domains", "apps"],
  },
  {
    role: "ui",
    label: "UI / Components",
    candidates: ["components", "ui", "widgets"],
  },
  {
    role: "data-layer",
    label: "Data layer",
    candidates: ["services", "repositories", "repository", "api", "clients", "data"],
  },
  {
    role: "routes",
    label: "Routes",
    candidates: ["app", "routes", "pages", "router"],
  },
  {
    role: "handlers",
    label: "Handlers",
    candidates: ["controllers", "handlers", "resolvers", "views"],
  },
  {
    role: "screens",
    label: "Screens",
    candidates: ["screens"],
  },
  {
    role: "navigation",
    label: "Navigation",
    candidates: ["navigation"],
  },
  {
    role: "shared",
    label: "Shared",
    candidates: ["lib", "utils", "common", "shared", "helpers"],
  },
  {
    role: "config",
    label: "Config",
    candidates: ["config", "configs", "settings"],
  },
];

/**
 * Root prefixes to probe when matching layer candidates.
 * An empty string means "at repo root".
 */
export const LAYER_ROOT_PREFIXES = ["src", "app", "internal", ""];
