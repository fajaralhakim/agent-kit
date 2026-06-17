---
name: conversation-memory
description: Reads and writes lean plan/session memory in .agents/memory/. Use when starting work on an ongoing task, creating a plan, ending a session with durable context, or when the user asks to continue previous work.
---

# Conversation Memory

Persist plan and session context on disk. **Do not dump full chat history into prompts** — use the compact index and linked files only.

## Read (start of relevant work)

1. Read [`.agents/memory/index.md`](.agents/memory/index.md) — always, when continuing prior work or the user references a plan.
2. If **Active plan** points to a file, read that plan file only.
3. If **Latest handoff** points to a file and the task depends on prior session context, read that session file only.
4. Do **not** bulk-read all files under `plans/` or `sessions/`.

## Write — new plan

When the user creates or approves an implementation plan:

1. Create `.agents/memory/plans/YYYY-MM-DD-<slug>.md` (kebab-case slug).
2. Update `index.md` — set Active plan file, goal, and status.
3. Keep the plan file detailed; keep `index.md` compact.

### Plan file template

```markdown
# Plan title

**Created:** YYYY-MM-DD
**Status:** in_progress | blocked | done

## Goal

One sentence.

## Tasks

- [ ] Task 1
- [ ] Task 2

## Notes

Research, constraints, links — detail lives here, not in index.md.
```

## Write — session handoff

When ending a session with context worth preserving (blockers, partial progress, decisions):

1. Create `.agents/memory/sessions/YYYY-MM-DD-<slug>.md`.
2. Update `index.md` — Latest handoff file + one-line summary.
3. Append new **Decisions** or **Open questions** bullets to `index.md` (short phrases only).

### Session file template

```markdown
# Session handoff — YYYY-MM-DD

## Done

- …

## In progress

- …

## Blockers / open questions

- …

## Next steps

1. …
```

## Write — decisions only

For a decision that should survive future chats without a full handoff:

- Add one bullet under **Decisions** in `index.md`.
- Optionally add detail to the active plan file.

## Rules

- `index.md` stays under ~30 lines; move detail to plan/session files.
- Filename pattern: `YYYY-MM-DD-<kebab-slug>.md`.
- Do not duplicate `.agents/docs/` change logs — those document shipped code; memory tracks active execution state.
- After updating memory, continue work without repeating the full index in your reply.
