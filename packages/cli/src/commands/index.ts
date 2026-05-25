import fs from "node:fs";
import path from "node:path";
import { detectStack } from "../detect/index.js";
import { installProfiles, readProjectLock } from "../install/index.js";
import { resolveProfileChain } from "../registry/index.js";
import type { InstallContext } from "../types.js";

export interface InitOptions {
  force?: boolean;
  noFeatureDocs?: boolean;
  addons?: string[];
}

export async function runInit(targetPath: string, options: InitOptions): Promise<void> {
  const targetDir = path.resolve(targetPath);

  if (!fs.existsSync(targetDir)) {
    console.error(`Path not found: ${targetDir}`);
    console.error("Create the directory first, then run agent-kit init.");
    process.exit(1);
  }

  const detected = detectStack(targetDir);
  const addonIds = options.addons ?? ["context7"];
  let profileChain = resolveProfileChain(["_core", ...addonIds]);

  if (options.noFeatureDocs) {
    profileChain = profileChain.map((manifest) => {
      if (manifest.id !== "_core") return manifest;
      return {
        ...manifest,
        files: manifest.files.filter((f) => !f.dest.includes("feature-docs.mdc")),
      };
    });
  }

  const ctx: InstallContext = {
    targetDir,
    detected,
    variables: {
      packageManager: detected.packageManager,
      devCommand: detected.devCommand,
      profile: detected.stack ?? "unknown",
    },
  };

  console.log(`\nAgent Kit init → ${targetDir}`);
  console.log(`Detected stack: ${detected.stack ?? "unknown"}\n`);

  installProfiles(profileChain, ctx, {
    force: options.force,
    agentKitVersion: "0.1.0",
  });

  console.log("\nDone!");
  console.log("Next steps:");
  console.log("  1. Run agent-kit analyze . --write to generate project-tailored docs and rules.");
  console.log("  2. Edit .cursor/mcp.json — replace YOUR_* with your API keys.");
  console.log(`  3. Run ${detected.devCommand} to verify the project still works.`);
}

export interface AddOptions {
  force?: boolean;
}

export async function runAdd(targetPath: string, addonId: string, options: AddOptions): Promise<void> {
  const targetDir = path.resolve(targetPath);
  if (!fs.existsSync(targetDir)) {
    console.error(`Directory not found: ${targetDir}`);
    process.exit(1);
  }

  const detected = detectStack(targetDir);
  const lock = readProjectLock(targetDir);
  const profileChain = resolveProfileChain([addonId]);

  const ctx: InstallContext = {
    targetDir,
    detected,
    variables: {
      packageManager: detected.packageManager,
      devCommand: detected.devCommand,
      profile: lock?.detected.stack ?? detected.stack ?? "unknown",
    },
  };

  console.log(`\nAgent Kit add → ${addonId}\n`);
  installProfiles(profileChain, ctx, { force: options.force });
  console.log("\nDone!");
}

export async function runDoctor(targetPath: string): Promise<number> {
  const targetDir = path.resolve(targetPath);
  let exitCode = 0;

  console.log(`\nAgent Kit doctor → ${targetDir}\n`);

  const lock = readProjectLock(targetDir);
  if (!lock) {
    console.log("✗ .agent-kit.lock.json not found — run agent-kit init");
    return 1;
  }

  console.log(`✓ Lock file (profiles: ${lock.profiles.join(", ")})`);

  const requiredFiles = ["AGENTS.md", ".agents/AGENTS.md"];
  for (const file of requiredFiles) {
    const exists = fs.existsSync(path.join(targetDir, file));
    console.log(`${exists ? "✓" : "✗"} ${file}`);
    if (!exists) exitCode = 1;
  }

  const archFile = path.join(targetDir, ".agents/architecture.md");
  if (fs.existsSync(archFile)) {
    console.log("✓ .agents/architecture.md");
  } else {
    console.log("⚠ .agents/architecture.md missing — run agent-kit analyze . --write");
  }

  const rulesDir = path.join(targetDir, ".cursor/rules");
  if (fs.existsSync(rulesDir)) {
    const rules = fs.readdirSync(rulesDir).filter((f) => f.endsWith(".mdc"));
    console.log(`✓ .cursor/rules/ (${rules.length} rules)`);
  } else {
    console.log("⚠ .cursor/rules/ missing — run agent-kit analyze . --write --harness cursor");
  }

  const mcpPath = path.join(targetDir, ".cursor/mcp.json");
  if (fs.existsSync(mcpPath)) {
    const mcp = fs.readFileSync(mcpPath, "utf-8");
    if (mcp.includes("YOUR_")) {
      console.log("⚠ .cursor/mcp.json has placeholder API keys — edit before use");
    } else {
      console.log("✓ .cursor/mcp.json configured");
    }
  } else {
    console.log("⚠ .cursor/mcp.json missing — see .agents/mcp-registry.md");
  }

  const gitignore = path.join(targetDir, ".gitignore");
  if (fs.existsSync(gitignore)) {
    const content = fs.readFileSync(gitignore, "utf-8");
    if (content.includes(".cursor/mcp.json")) {
      console.log("✓ .cursor/mcp.json in .gitignore");
    } else {
      console.log("⚠ Add .cursor/mcp.json to .gitignore");
    }
  }

  console.log("");
  return exitCode;
}
