---
name: ui-shadcn-first
description: Enforces shadcn-first UI component selection before building custom components. Use when building or updating frontend UI in projects with shadcn/ui configured.
---

# UI Shadcn First

1. Check if a shadcn component exists (`npx shadcn@latest add` or shadcn MCP).
2. Compose shadcn primitives before creating custom components.
3. Custom components only when shadcn cannot cover the requirement.
4. Match existing Tailwind tokens and `cn()` usage from `@/lib/utils`.

Use shadcn MCP when available (configure in `.cursor/mcp.json`).
