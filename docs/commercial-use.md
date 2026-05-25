# Commercial Use

Agent Kit is MIT licensed — free for personal and commercial use.

## Company deployment

1. Distribute `bunx github:fajaralhakim/agent-kit` (or a private fork) to your team.
2. Run `agent-kit analyze . --write --harness <cursor|opencode|claude-code|...>` in each repo to generate project-tailored docs + rules.
3. Optionally run `agent-kit init .` first to drop the generic `_core` skeleton.
4. Commit `.cursor/mcp.json.example` (or harness equivalent) and agent context files; keep `.cursor/mcp.json` gitignored.

## Standardization

- `_core` profile enforces shared coding standards across all repos.
- Stack-specific rules are **generated** from each project's scan — no per-stack profile to maintain.
- Addons (e.g. `context7`) layer MCP and skills without forking the CLI.
- Extend `mcp/registry.json` to publish company-wide MCP servers.
