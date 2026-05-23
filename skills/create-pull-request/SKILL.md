---
name: create-pull-request
description: Create a GitHub pull request with gh CLI, following repo conventions and linking Jira when applicable. Use when the user asks to open a PR or finish a feature branch.
---

# Create Pull Request

## Prerequisites

- `gh` CLI authenticated
- Branch pushed to remote
- Changes verified locally (see generated `verification` rule / `AGENTS.md`)

## Workflow

1. Run `git status`, `git diff`, and `git log` to understand the branch
2. Confirm base branch (usually `main`) and that CI-relevant checks pass
3. Draft PR title and body:
   - **Summary** — what changed and why (1–3 bullets)
   - **Test plan** — checklist of verification steps
   - **Jira** — `PROJ-123` if ticket-driven (from `.agents/atlassian.md` project key)
4. Create PR:

```bash
git push -u origin HEAD
gh pr create --title "..." --body "$(cat <<'EOF'
## Summary
- ...

## Test plan
- [ ] ...

EOF
)"
```

5. Return the PR URL to the user

## Rules

- Never force-push to main/master
- Do not skip hooks unless user explicitly requests
- Follow user/repo rules for commit and PR message style
