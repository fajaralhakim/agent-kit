---
name: using-project-context
description: Reads AGENTS.md and .agents/ guides before scaffolding or large changes. Use when starting new work or touching unfamiliar areas of the codebase.
---

# Using Project Context

Before scaffolding or making large edits:

1. Read `AGENTS.md` — stack, dev command, **detected layer map**.
2. Read [`.agents/architecture.md`](.agents/architecture.md) if you will add or move folders.
3. Read [`.agents/code-conventions.md`](.agents/code-conventions.md) for naming and file organization.
4. Read the specific layer guide under `.agents/layers/` only when working in that layer (e.g. `layers/modules.md`, `layers/handlers.md`).
5. Inspect existing code in the same area and follow established patterns.

Rules in your harness folder (`.cursor/rules/`, `.claude/rules/`, etc.) were generated from **this project's** scan — paths and globs are project-specific.

Do not invent new folder layouts when guides and existing code already define the structure.
