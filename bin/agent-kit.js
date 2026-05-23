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

if (!fs.existsSync(entry)) {
  console.error("agent-kit: CLI entry not found. Run `bun run build` in the agent-kit repo.");
  process.exit(1);
}

await import(entry);
