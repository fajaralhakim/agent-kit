# MCP Guide

Agent Kit generates `.cursor/mcp.json` with **placeholder API keys**. Edit the file and replace `YOUR_*` values with real keys.

## Project vs user config

| File | Use case |
|------|----------|
| `.cursor/mcp.json` | Per-project (default, gitignored) |
| `~/.cursor/mcp.json` | Global credentials shared across projects |

Commit `.cursor/mcp.json.example` (placeholders only) for team reference.

## Common servers

| Server | Purpose |
|--------|---------|
| context7 | Library/API documentation lookup |
| shadcn | shadcn/ui component registry (after `agent-kit add shadcn`) |

## Setup

1. Open `.cursor/mcp.json`
2. Replace placeholder keys
3. Restart Cursor or reload MCP servers
4. Run `agent-kit doctor` to check installation
