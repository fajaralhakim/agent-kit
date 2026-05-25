import fs from "node:fs";
import path from "node:path";
import {
  analyzeProject,
  generateDocs,
  generateRules,
  generateCopilotInstructions,
  mergeAgentsMd,
  type Harness,
} from "@agent-kit/analyzer";

export interface AnalyzeOptions {
  json?: boolean;
  harness?: Harness;
  write?: boolean;
}

const VALID_HARNESSES: Harness[] = ["cursor", "opencode", "claude-code", "antigravity", "copilot"];

export async function runAnalyze(targetPath: string, options: AnalyzeOptions): Promise<void> {
  const targetDir = path.resolve(targetPath);
  if (!fs.existsSync(targetDir)) {
    console.error(`Directory not found: ${targetDir}`);
    process.exit(1);
  }

  const harness = (options.harness ?? "cursor") as Harness;
  if (!VALID_HARNESSES.includes(harness)) {
    console.error(`Invalid harness: ${harness}. Use: ${VALID_HARNESSES.join(", ")}`);
    process.exit(1);
  }

  const profile = analyzeProject(targetDir);

  if (options.json && !options.write) {
    console.log(JSON.stringify(profile, null, 2));
    return;
  }

  const docs = generateDocs(profile, harness);
  const rules =
    harness === "copilot" ? [generateCopilotInstructions(profile)] : generateRules(profile, harness);
  const files = [...docs, ...rules];

  if (options.json) {
    console.log(JSON.stringify({ profile, files: files.map((f) => ({ path: f.path, content: f.content })) }, null, 2));
    return;
  }

  if (options.write) {
    for (const file of files) {
      const dest = path.join(targetDir, file.path);
      fs.mkdirSync(path.dirname(dest), { recursive: true });

      if (file.path === "AGENTS.md" && profile.hasExistingAgentsMd) {
        const existing = fs.readFileSync(dest, "utf-8");
        fs.writeFileSync(dest, mergeAgentsMd(existing, file.content));
        console.log(`  merged ${file.path}`);
      } else {
        fs.writeFileSync(dest, file.content);
        console.log(`  wrote ${file.path}`);
      }
    }
    console.log(`\nGenerated ${files.length} files for harness: ${harness}`);
    return;
  }

  console.log(`\nProject: ${profile.name}`);
  console.log(`Stack: ${profile.stack} (${profile.stackFamily})`);
  console.log(`Language: ${profile.language}`);
  console.log(`Layers: ${profile.layers.length === 0 ? "(none detected)" : profile.layers.map((l) => `${l.label} → ${l.path}`).join(", ")}`);
  console.log(`\nRun with --write to generate files, or --json for full output.`);
}
