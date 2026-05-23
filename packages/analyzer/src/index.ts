export type { GeneratedFile, Harness, ProjectProfile, Stack } from "./types.js";
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
