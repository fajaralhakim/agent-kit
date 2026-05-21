#!/usr/bin/env node
import { Command } from "commander";
import { runAdd, runDoctor, runInit } from "./commands/index.js";

const program = new Command();

program
  .name("agent-kit")
  .description("Install agent context and scaffold projects with Agent Kit profiles")
  .version("0.1.0");

program
  .command("init")
  .description("Initialize agent context (and scaffold new Next.js projects)")
  .argument("[path]", "Target directory", ".")
  .option("-p, --profile <id>", "Stack profile: nextjs, vite-react")
  .option("-a, --addon <id...>", "MCP addons to include", ["context7"])
  .option("-f, --force", "Overwrite existing agent files")
  .option("--no-feature-docs", "Skip feature-docs rule")
  .action(async (targetPath: string, options) => {
    await runInit(targetPath, {
      profile: options.profile,
      force: options.force,
      noFeatureDocs: !options.featureDocs,
      addons: options.addon,
    });
  });

program
  .command("add")
  .description("Add a profile addon (shadcn, context7, etc.)")
  .argument("<addon>", "Addon profile id")
  .argument("[path]", "Target directory", ".")
  .option("-f, --force", "Overwrite existing files")
  .action(async (addon: string, targetPath: string, options) => {
    await runAdd(targetPath, addon, { force: options.force });
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
