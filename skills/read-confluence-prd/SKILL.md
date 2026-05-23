---
name: read-confluence-prd
description: Fetch a Confluence page or PRD via Atlassian Rovo MCP before implementing features. Use when the user shares a Confluence URL, page ID, or asks to implement from a PRD.
---

# Read Confluence PRD

## Prerequisites

1. Atlassian Rovo MCP configured (see `.agents/atlassian.md`)
2. OAuth completed for Atlassian MCP

## Workflow

1. Read `.agents/atlassian.md` for Confluence spaceId and cloudId
2. Fetch the page via Atlassian MCP (CQL or page ID from user)
3. Extract and summarize:
   - Goal and scope
   - Requirements / acceptance criteria
   - Out of scope
   - Open questions
4. Read `AGENTS.md` and `.agents/feature-structure.md` (or other guides) before scaffolding
5. Propose implementation plan aligned with **detected** project structure — do not invent folders

## Rules

- Respect `maxResults` in `.agents/atlassian.md` for CQL searches
- If page is ambiguous, ask clarifying questions before large changes
- Reference Confluence page title/link in PR description when applicable
