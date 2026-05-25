---
name: implement-from-prd
description: >
  Execute implementation from a verified formatted PRD (produced by
  format-confluence-prd). Reads project context, optionally fetches Figma
  design via MCP, reuses existing components, and implements the feature.
  Use when the user says "implementasi", "code this", "mulai", or equivalent
  after the PRD has been verified.
---

# Implement from PRD

Turn a verified formatted PRD into working code, with optional Figma design context.

## Prerequisites

- `format-confluence-prd` has been run and the user has confirmed the output
- The verified structured PRD is available in the current context

## Workflow

### Step 1 — Read project context

1. Read `AGENTS.md` — stack, dev commands, detected layer map
2. Read `.agents/architecture.md` if adding or moving folders
3. Read `.agents/code-conventions.md` for naming and file organization
4. Read the relevant layer guide under `.agents/layers/` for the area being touched
5. Inspect existing code in the target area — understand patterns before writing anything

### Step 2 — Ask for Figma design

Ask the user:
> "Ada link Figma untuk desain fitur ini? Kalau ada, share URL-nya (bisa frame atau layer link)."

- If the user provides a Figma URL or node ID → continue to Step 3
- If no design is available → skip to Step 4

### Step 3 — Fetch Figma design (only if provided)

Run in this order — do not skip steps:

1. `get_design_context(figma_url)` — fetch the structured design representation
2. If the response is too large or truncated, run `get_metadata` first to get the node map, then re-fetch only the needed node with `get_design_context`
3. `get_screenshot(figma_url)` — fetch the visual reference
4. From the design output, identify the UI elements needed (table, filter bar, badge, status chip, modal, form field, etc.)

#### Component resolution (for each UI element identified)

Before creating anything, check what already exists:

1. Search the codebase for a matching component (look in the project's component library, `components/`, `ui/`, or equivalent)
2. If a matching component is found → use it directly, do not recreate it
3. If unsure whether a component exists → ask the user:
   > "Di project ini ada komponen untuk [X]? Kalau ada, di mana lokasinya?"
4. Only if the user confirms no matching component exists → create a new one, following the project's existing component patterns and design system tokens

#### Asset handling

- If Figma MCP returns a `localhost` URL for an image or SVG asset, use that URL directly
- Do not import or install new icon packages — all assets should come from the Figma payload
- Do not use placeholders when a localhost asset source is provided

### Step 4 — Implement

Using the verified PRD structured doc (and Figma design if available):

1. Implement the feature following the project's detected patterns
2. Do not invent new folder layouts when guides and existing code already define the structure
3. Items marked `REMOVED` or `~~strikethrough~~` in the PRD must NOT be implemented
4. Never guess field mappings — use only what is in the verified PRD doc

### Step 5 — Validate

1. Check every requirement listed in the verified PRD against the implementation
2. If Figma design was provided, validate the visual output against the `get_screenshot` reference for 1:1 parity
3. Run the project's typecheck command (`bun run typecheck` or equivalent) before marking complete

## Rules

- Do not start this skill until `format-confluence-prd` output has been explicitly confirmed by the user
- Do not implement REMOVED items under any circumstances
- Do not add new dependencies or icon packages without asking the user first
- Follow `.agents/code-conventions.md` naming and file organization at all times
- If a PRD section is ambiguous, ask the user rather than guessing
