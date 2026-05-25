---
name: format-confluence-prd
description: >
  Fetch a Confluence PRD and parse it into a structured, LLM-friendly format,
  then verify it with the user before any implementation begins. Use when the
  user shares a Confluence URL, page ID, or pastes raw PRD content.
---

# Format Confluence PRD

Read and structure a PRD into a verified document an agent can act on.
Do not write any code until the user has confirmed the output.

## Prerequisites

- Atlassian MCP configured and authenticated (skip if user pasted content directly)

## Workflow

1. **Accept input** — Confluence URL, page ID, or pasted PRD content
2. **Fetch** — use Atlassian MCP to retrieve the page (skip if content was pasted)
3. **Identify feature type** — read the PRD and determine what kind of feature it describes before formatting (list page, form, detail view, dashboard, modal, etc.)
4. **Format** — produce a structured document using the Output Format rules below
5. **Present** — show the formatted output to the user
6. **Verify** — ask the verification question (see below) and wait for explicit confirmation
7. **Correct if needed** — if the user requests changes, update and repeat from step 5
8. **Stop** — do not proceed to implementation; let the user invoke `implement-from-prd` when ready

## Output Format

The format is **adaptive** — determined by the PRD content, not a fixed template.
Do not invent sections that are not present in the PRD.
If something is present but unclear, place it in Open Questions instead of guessing.

### Always included

- **Feature name + goal** — 1-2 sentences describing what is being built and why
- **Removed / Out of Scope** — explicit bulleted list of every item marked REMOVE or "not available" in the PRD
- **Open questions** — anything ambiguous, missing, or that needs clarification from the team

### Include only when present in the PRD

| Feature type | Sections to include |
|---|---|
| List / table page | Data table (column label → API field), status enumerations (value / label / color per type), filters (name / API param / format), pagination details, API endpoint + response schema |
| Form / input page | Form fields (label / input type / required / API field / validation rules), submit API endpoint + request payload shape |
| Detail page | Field layout (display label → API field), API endpoint |
| Dashboard / summary | Widgets or metric cards, data sources, API endpoints |
| Modal / drawer | Trigger condition, content fields, primary and secondary actions |
| Any other type | Whatever logical sections are present in the PRD |

### Formatting conventions

- Use tables wherever there are mappings (column ↔ field, value ↔ label, filter ↔ param)
- Mark removed items inline with `~~strikethrough~~` and a `REMOVED` note
- For status enumerations always include: value, display label, color (if specified), and API param name used for filtering
- For API endpoints always include: method, full URL, and all query params or body fields

## Verification question (required — do not skip)

After presenting the formatted output, always ask:

> "Apakah format ini sudah benar dan sesuai dengan konteks project aplikasinya?
> Ada komponen, naming convention, atau pattern yang perlu aku ketahui sebelum mulai implementasi?"

Wait for an explicit "yes / sudah benar / lanjut" before doing anything else.

## Rules

- Never start implementation from this skill — that is the job of `implement-from-prd`
- If the Confluence page is ambiguous or the user pasted incomplete content, ask a clarifying question before formatting
- Respect `maxResults` from `.agents/atlassian.md` for any CQL searches
- Reference the Confluence page title and URL in the formatted output header
