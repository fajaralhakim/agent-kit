---
name: read-jira-ticket
description: Fetch and summarize a Jira ticket via Atlassian Rovo MCP before implementing bug fixes or feedback. Use when the user references a Jira key (PROJ-123) or asks to work from a ticket.
---

# Read Jira Ticket

## Prerequisites

1. Atlassian Rovo MCP configured (see `.agents/atlassian.md` and `.agents/mcp-guide.md`)
2. User has completed OAuth for `https://mcp.atlassian.com/v1/mcp`

## Workflow

1. Read `.agents/atlassian.md` for project key, cloudId, and maxResults
2. Use Atlassian MCP to fetch the ticket by key (e.g. `PROJ-123`)
3. Summarize for the user:
   - Title, status, priority
   - Description and acceptance criteria
   - Linked PRs or parent epic if relevant
4. Read `AGENTS.md` and relevant `.agents/*` guides before changing code
5. Inspect existing code in the affected area — match patterns

## Rules

- Do not guess ticket content — fetch via MCP or ask user to paste if MCP unavailable
- Limit JQL searches to `maxResults` from `.agents/atlassian.md`
- Link commits/PRs back to the ticket when done
