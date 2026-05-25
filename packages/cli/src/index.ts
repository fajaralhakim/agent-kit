#!/usr/bin/env node
import { Command } from "commander";
import { runAnalyze } from "./commands/analyze.js";
import { runAdd, runDoctor, runInit } from "./commands/index.js";

const program = new Command();

program
  .name("agent-kit")
  .description("Install agent context (AGENTS.md, rules, skills, MCP) into any codebase")
  .version("0.1.0");

program
  .command("init")
  .description("Install Agent Kit core context into an existing project")
  .argument("[path]", "Target directory", ".")
  .option("-a, --addon <id...>", "MCP addons to include", ["context7"])
  .option("-f, --force", "Overwrite existing agent files")
  .option("--no-feature-docs", "Skip change-docs rule")
  .action(async (targetPath: string, options) => {
    await runInit(targetPath, {
      force: options.force,
      noFeatureDocs: !options.featureDocs,
      addons: options.addon,
    });
  });

program
  .command("add")
  .description("Add a profile addon (context7, etc.)")
  .argument("<addon>", "Addon profile id")
  .argument("[path]", "Target directory", ".")
  .option("-f, --force", "Overwrite existing files")
  .action(async (addon: string, targetPath: string, options) => {
    await runAdd(targetPath, addon, { force: options.force });
  });

program
  .command("analyze")
  .description("Analyze project structure and optionally generate tailored agent docs and rules")
  .argument("[path]", "Target directory", ".")
  .option("--json", "Output ProjectProfile as JSON")
  .option("-w, --write", "Write generated AGENTS.md, .agents/, and rules to disk")
  .option("-H, --harness <name>", "Target harness: cursor, opencode, claude-code, antigravity, copilot", "cursor")
  .action(async (targetPath: string, options) => {
    await runAnalyze(targetPath, {
      json: options.json,
      write: options.write,
      harness: options.harness,
    });
  });

program
  .command("doctor")
  .description("Validate agent-kit installation")
  .argument("[path]", "Target directory", ".")
  .action(async (targetPath: string) => {
    const code = await runDoctor(targetPath);
    process.exit(code);
  });

program.parse();
