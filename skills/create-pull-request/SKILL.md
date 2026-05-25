---
name: create-pull-request
description: >
  Commit changes with a project-convention message, push the branch, create a
  PR/MR on Bitbucket (Atlassian MCP), GitHub (GitHub MCP or manual URL), or
  GitLab (GitLab MCP or manual URL), then detect merge conflicts and manage a
  -DEV resolution branch loop. Use when the user asks to open a PR, push a
  branch, or finish a feature.
---

# Create Pull Request

Full flow: commit → push → create PR → detect conflicts → resolve loop.

## Step 1 — Understand the changes

Run these before touching anything:

```bash
git status
git diff
git log --oneline -10
```

Read the output to understand what was changed and on which branch.

## Step 2 — Draft and create the commit

1. Read `.agents/code-conventions.md` or `AGENTS.md` for the project's commit message convention
2. If no convention is found, fall back to Conventional Commits: `type(scope): description`
   - Examples: `feat(EO-1232): add promo order list page`, `fix(auth): handle token expiry`
3. Stage all relevant changes and commit:

```bash
git add .
git commit -m "your message here"
```

## Step 3 — Ask for the target branch

Ask the user:
> "Mau di-push dan PR ke branch apa? (misal: main, develop, staging)"

Store the answer as `TARGET_BRANCH`. Use it in all subsequent steps.

## Step 4 — Detect the platform

Run:
```bash
git remote get-url origin
```

Match the remote URL to a platform:

| Remote URL contains | Platform | Preferred tool |
|---|---|---|
| `bitbucket.org` | Bitbucket | Atlassian MCP |
| `github.com` | GitHub | GitHub MCP (if connected) |
| `gitlab.com` or other | GitLab | GitLab MCP (if connected) |

## Step 5 — Push the branch

```bash
git push -u origin HEAD
```

## Step 6 — Create the PR

Use the platform detected in Step 4:

### Bitbucket — Atlassian MCP

- Read `.agents/atlassian.md` for `cloudId`, workspace slug, and project key
- If Atlassian MCP is not authenticated, prompt the user to authenticate first
- Call the Atlassian MCP Bitbucket `create_pull_request` tool:
  - `title` — derived from branch name + Jira ticket if present
  - `description` — what was built, based on feature context and recent commits
  - `source_branch` — current active branch
  - `destination_branch` — `TARGET_BRANCH`

### GitHub — GitHub MCP or manual

- Check if a GitHub MCP server is connected in the current session
- If connected → use GitHub MCP to create the PR with title, body, base branch
- If not connected → provide the manual compare URL to the user:
  ```
  https://github.com/{owner}/{repo}/compare/TARGET_BRANCH...CURRENT_BRANCH
  ```
  Tell the user: "GitHub MCP tidak tersedia. Buka URL ini untuk buat PR secara manual."

### GitLab — GitLab MCP or manual

- Check if a GitLab MCP server is connected
- If connected → use GitLab MCP to create the MR with title, description, source/target branch
- If not connected → provide the manual MR URL:
  ```
  https://gitlab.com/{group}/{repo}/-/merge_requests/new?merge_request[source_branch]=CURRENT_BRANCH&merge_request[target_branch]=TARGET_BRANCH
  ```
  Tell the user: "GitLab MCP tidak tersedia. Buka URL ini untuk buat MR secara manual."

**PR/MR title format:** `[TICKET-ID] Short description` or branch name if no ticket
**PR/MR description:** summary of the feature, referencing the Jira ticket if applicable

Return the PR/MR URL to the user after creation.

## Step 7 — Check for merge conflicts

After the PR is created, check the merge status using the same platform tool:

- **Bitbucket** — call Atlassian MCP `get_pull_request` (or equivalent) and read the merge status field
- **GitHub** — use GitHub MCP if available to check `mergeable` status; if no MCP, ask the user directly:
  > "Apakah ada conflict di PR-nya?"
- **GitLab** — use GitLab MCP if available to check `has_conflicts`; if no MCP, ask the user directly:
  > "Apakah ada conflict di MR-nya?"

If no conflict → done. Share the PR URL and stop.

## Step 8 — Conflict resolution loop

If a conflict is detected:

1. Get the current branch name (e.g. `feature/EO-1232-promo`)
2. Create a new branch from `TARGET_BRANCH`:
   ```bash
   git checkout -b feature/EO-1232-promo-DEV origin/TARGET_BRANCH
   ```
3. Push the `-DEV` branch:
   ```bash
   git push -u origin HEAD
   ```
4. Inform the user:
   > "Ada conflict. Branch `[CURRENT_BRANCH]-DEV` sudah dibuat dari `TARGET_BRANCH`.
   > Ini adalah branch sementara untuk resolve conflict. Merge branch kamu ke branch ini secara lokal,
   > selesaikan conflict-nya, lalu commit. Kasih tau aku kalau sudah selesai."

5. Wait for the user to confirm the conflict is resolved and committed
6. When confirmed → return to **Step 5** (push) and **Step 6** (create PR) from the `-DEV` branch
7. Repeat **Step 7–8** if a new conflict appears

## Rules

- Never force-push to `main` or `master`
- Never skip pre-commit hooks unless the user explicitly asks
- Always read the commit convention before writing a message — do not guess the format
- Always detect the platform from the remote URL — do not assume GitHub
- Never require `gh` or `glab` CLI installation — use MCP first, manual URL as fallback
- `-DEV` branches are temporary — make that clear in their PR description
- If Atlassian MCP is needed but not authenticated, stop and prompt authentication before continuing
- For conflict detection without MCP, ask the user directly — do not assume there are no conflicts
