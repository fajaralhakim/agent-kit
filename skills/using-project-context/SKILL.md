---
name: using-project-context
description: Reads AGENTS.md and conditional .agents/ guides before scaffolding or large changes. Use when starting new features, services, components, or unfamiliar areas of the codebase.
---

# Using Project Context

Before scaffolding or large edits:

1. Read `AGENTS.md` — stack, dev command, **detected folder map**
2. Read guides only when needed:
   - Feature work → `.agents/feature-structure.md`
   - Components → `.agents/component-structure.md`
   - API/data → `.agents/service-structure.md`
   - Naming → `.agents/naming-conventions.md`
   - Jira/Confluence → `.agents/atlassian.md`
3. Inspect existing code in the same area and follow established patterns
4. Respect generated rules in your harness (e.g. `.cursor/rules/project-architecture.mdc`)

Do not invent new folder layouts when guides and examples already exist. Rules were generated from **this project's** scan — paths and globs are project-specific.
