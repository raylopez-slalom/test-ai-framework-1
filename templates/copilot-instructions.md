# AI-Assisted SDLC Framework — Copilot Instructions

This repository uses an AI-assisted development framework. The instructions below
describe how to assist developers consistently across the feature lifecycle.

---

## Project context

Always read `CLAUDE.md` at the project root before answering questions about
conventions, architecture, or patterns. It is the source of truth for this project.
When files exist under `docs/` (architecture-specs.md, product-requirements.md,
ui-guidelines.md, testing-guidelines.md, data-model.md), read the relevant ones
when they bear on the question.

---

## Starting a feature (`/feature-start` equivalent)

When a developer asks to start a feature, pick up a ticket, or begin work on a task:

1. Ask for the JIRA ticket ID, or ask them to describe what to build
2. Read the full requirements — acceptance criteria, linked tickets, constraints
3. Scan `CLAUDE.md` and relevant source files to understand what the change touches
4. For each acceptance criterion ask:
   - Is it testable? Can a test prove it passes?
   - Is it unambiguous? Could two developers implement it differently?
   - Are edge cases covered? (error states, empty states, permissions, mobile)
5. Flag gaps as:
   - **BLOCKING** — cannot start without resolving
   - **CLARIFY** — can proceed with a stated assumption
   - **ASSUMPTION** — proceeding, noted in the brief
6. Produce a development brief and offer to save it to `docs/briefs/[ID].md`:
   - What to build (and explicitly what NOT to build)
   - Acceptance criteria as a checklist
   - Files likely affected
   - Proposed approach
   - Gaps requiring clarification
7. Do not write any code until the developer confirms the brief
8. Once confirmed: create a feature branch before touching any files
   - Format: `feature/[TICKET-ID]-[short-slug]` or `feature/[short-slug]`
   - Example: `feature/PROJ-123-user-authentication`

---

## Code review (`/code-review` equivalent)

When a developer asks to review code, a diff, or a PR:

1. **Correctness** — does the implementation match the acceptance criteria?
2. **Conventions** — does it follow `CLAUDE.md` patterns? check naming, structure, anti-patterns
3. **Test coverage** — are new behaviors tested? do existing tests still pass?
4. **Security** — input validation, auth checks, no hardcoded secrets, safe dependencies
5. Report findings using these severity levels:
   - **BLOCKING** — must fix before the PR can merge
   - **RECOMMENDED** — should fix; explain why
   - **INFORMATIONAL** — optional improvement, no pressure
6. BLOCKING findings must be resolved before the PR is opened

---

## Before opening a PR (`/spec-check` + `/pr-ready` equivalent)

When a developer asks if code is ready for review or wants to prepare a PR:

1. Check that docs are updated — if new behavior was added, is it reflected in `docs/`?
2. Verify `CLAUDE.md` conventions were followed throughout
3. Confirm the build, lint, type check, and unit tests would pass
4. Produce a PR description containing:
   - Summary: what changed and why
   - How to test it (steps a reviewer can follow)
   - Checklist: spec-check ✓ · code-review (no blockers) ✓ · tests pass ✓

---

## Architecture decisions (`/adr` equivalent)

Require an Architecture Decision Record before proceeding when a change:
- Affects another team's API or shared contract
- Adds a new dependency to the project
- Overrides a pattern established in `CLAUDE.md`
- Introduces a new AI tool or service

Save the ADR to `docs/decisions/YYYY-MM-DD-short-title.md`. Include:
- Context: why this decision is needed
- Options considered (at least two)
- Decision and rationale
- Consequences (positive and negative)

---

## Security-sensitive changes (`/security-review` equivalent)

For changes touching authentication, authorization, data access, external APIs,
or user-supplied input: apply OWASP Top 10 checks. Flag findings as:
- **CRITICAL** / **HIGH** — block merge
- **MEDIUM** — fix before next sprint
- **LOW** / **INFORMATIONAL** — optional

---

## Pipeline failures (`/diagnose-pipeline` equivalent)

When a developer shares CI logs or asks why a build failed:
1. Identify the failure type: build error, test failure, lint violation, missing dependency, infrastructure issue
2. Find the root cause — quote the specific log line
3. Propose a concrete fix — not a generic suggestion

---

## Release notes (`/release-notes` equivalent)

When preparing for a release or sprint close:
1. List completed tickets from the sprint (ask for JIRA sprint ID or ticket list)
2. Generate two versions:
   - **Client-facing**: plain language, business value, no technical jargon
   - **Internal changelog**: technical detail, files changed, migration notes if any

---

## Onboarding (`/onboard` equivalent)

When a developer is new to the project or a module:
1. Explain what the system does and where it fits in the broader architecture
2. Name the key files to know first
3. Describe the patterns to follow and the anti-patterns to avoid
4. Call out known gotchas that trip up new contributors
5. Show how to run the project locally and run the tests

---

## Non-negotiable rules

- Never suggest committing secrets, `.env` files, or credentials
- Every commit referencing a JIRA ticket must follow the format: `PROJ-123: description`
- No code merges to main without: passing build + tests, no BLOCKING review findings, updated docs, human reviewer approval
- Create a feature branch before writing any code — never commit directly to main
