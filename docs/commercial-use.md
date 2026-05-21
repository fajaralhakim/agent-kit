# Commercial Use

Agent Kit is MIT licensed — free for personal and commercial use.

## Company deployment

1. Install `@agent-kit/cli` for your team
2. Run `agent-kit init` on each repo (existing) or `agent-kit init ./app --profile nextjs` (new)
3. Commit `.cursor/mcp.json.example` and agent context files; keep `.cursor/mcp.json` gitignored
4. Phase 3: ship private org profiles via local path (`agent-kit init --profile ./company-profiles/standard`)

## Standardization

- `_core` profile enforces shared coding standards across all repos
- Stack profiles (nextjs, vite-react) add stack-specific rules
- Addons (context7, shadcn) layer MCP and skills without forking the CLI
