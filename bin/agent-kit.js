#!/usr/bin/env bun
/**
 * Entry shim for bunx / npm bin.
 * Sets AGENT_KIT_ROOT and runs CLI from dist (built) or src (fallback).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const kitRoot = path.resolve(__dirname, "..");
process.env.AGENT_KIT_ROOT = kitRoot;

const distEntry = path.join(kitRoot, "packages/cli/dist/index.js");
const srcEntry = path.join(kitRoot, "packages/cli/src/index.ts");
const entry = fs.existsSync(distEntry) ? distEntry : srcEntry;

// #region agent log
fetch("http://127.0.0.1:7584/ingest/ece5426c-eb3d-4ae9-ba4c-a14b277f6545", {
  method: "POST",
  headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "85c083" },
  body: JSON.stringify({
    sessionId: "85c083",
    hypothesisId: "F",
    location: "bin/agent-kit.js",
    message: "CLI entry resolution",
    data: { kitRoot, entry, distExists: fs.existsSync(distEntry), srcExists: fs.existsSync(srcEntry) },
    timestamp: Date.now(),
    runId: "post-fix-2",
  }),
}).catch(() => {});
// #endregion

if (!fs.existsSync(entry)) {
  console.error("agent-kit: CLI entry not found. Run `bun run build` in the agent-kit repo.");
  process.exit(1);
}

await import(entry);
