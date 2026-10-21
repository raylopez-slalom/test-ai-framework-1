# Agents

This repository uses the AI-Assisted SDLC Framework with GitHub Copilot.

## Before you start

Read these files first — they are the source of truth for this project:

- `CLAUDE.md` — conventions, architecture, tech stack, patterns to follow and avoid
- `docs/` — detailed specifications (architecture, requirements, UI guidelines, etc.)
- `.github/copilot-instructions.md` — how Copilot should assist across the feature lifecycle

## Repository structure

```
docs/                    Project specifications (read these for context)
  architecture-specs.md
  product-requirements.md
  ui-guidelines.md
  testing-guidelines.md
  data-model.md
  briefs/                Development briefs (one per feature, created before coding)
  decisions/             Architecture Decision Records

.github/
  copilot-instructions.md  Copilot skill instructions
  workflows/               CI pipelines (including JIRA close-on-merge)

scripts/
  hooks/                 Git hooks: secrets scan, commit format, build + tests
  setup-hooks.sh         Run once after cloning to install the hooks

templates/               Framework templates for new projects
CLAUDE.md                Project conventions and architecture summary
AGENTS.md                This file
```

## Development workflow

Every feature follows this sequence — do not skip steps:

1. **Brief before code** — produce a development brief from the ticket or requirements before writing any files
2. **Feature branch** — create `feature/[TICKET-ID]-[slug]` before the first commit
3. **Implement** — follow the conventions in `CLAUDE.md`
4. **Check spec** — verify docs still match what was built
5. **Review code** — resolve all BLOCKING findings before opening a PR
6. **Open PR** — use the PR description template; include the checklist
7. **Merge** — requires human reviewer approval and green CI

## Running the project

See `CLAUDE.md` for the tech stack and local setup instructions.

## Commit format

All commits referencing a JIRA ticket must follow:
```
PROJ-123: short description of what changed
```

The `commit-msg` hook enforces this automatically after running `scripts/setup-hooks.sh`.

## JIRA automation

When JIRA secrets are configured in GitHub (JIRA_URL, JIRA_EMAIL, JIRA_TOKEN):
- Merging a PR automatically transitions the referenced ticket to Done
- See `.github/workflows/jira-close-on-merge.yml`
