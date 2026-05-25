export type {
  DetectedLayer,
  GeneratedFile,
  Harness,
  Language,
  LayerRole,
  ProjectConventions,
  ProjectProfile,
  Stack,
  StackFamily,
  VerificationCommands,
} from "./types.js";
export { LAYER_PATTERNS, LAYER_ROOT_PREFIXES } from "./patterns.js";
export { MCP_REGISTRY, getMcpServer, type McpServerDefinition } from "./mcp-registry.js";
export { analyzeProject } from "./scan.js";
export { generateDocs, mergeAgentsMd } from "./generate-docs.js";
export { generateRules, generateCopilotInstructions } from "./generate-rules.js";

import type { Harness } from "./types.js";
import { analyzeProject } from "./scan.js";
import { generateDocs } from "./generate-docs.js";
import { generateRules, generateCopilotInstructions } from "./generate-rules.js";

export function analyzeAndGenerate(targetDir: string, harness: Harness = "cursor") {
  const profile = analyzeProject(targetDir);
  const docs = generateDocs(profile, harness);
  const rules =
    harness === "copilot"
      ? [generateCopilotInstructions(profile)]
      : generateRules(profile, harness);
  return { profile, files: [...docs, ...rules] };
}
