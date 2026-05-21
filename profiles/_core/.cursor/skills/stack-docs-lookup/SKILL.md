---
name: stack-docs-lookup
description: Looks up library and framework documentation via Context7 MCP before guessing APIs or versions. Use when working with library APIs, version-specific behavior, or setup steps.
---

# Stack Docs Lookup

When library behavior or version matters:

1. Prefer **Context7 MCP** (`query-docs`) for official docs and examples.
2. Do not rely on training-data versions — verify against the project's `package.json`.
3. If MCP is unavailable, use web search as fallback.

See `.agents/mcp-guide.md` for MCP setup (edit `.cursor/mcp.json` API keys).
