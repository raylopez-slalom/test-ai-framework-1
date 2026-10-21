# Development Brief — Phase 1: Project scaffold

**Source**: docs/implementation-plan.md (tasks 1.1–1.9)
**Date**: 2026-10-21
**Branch**: feature/phase-1-scaffold

---

## What to build

A working monorepo with three packages (web, api, infra) and a shared package for types/schemas. `packages/web` renders a React "hello world" via Vite; `packages/api` exposes a Lambda health-check handler; `packages/infra` defines the CDK stacks. ESLint and strict TypeScript run across all packages from a shared root config. Vitest covers unit/component tests in `packages/web`; Playwright covers end-to-end tests in `e2e/`. GitHub Actions CI runs type check, lint, Vitest, and a production build on every PR and retains results. CD (deploy to Amplify + Lambda via OIDC) is included in scope but blocked on AWS access (see Gaps below).

---

## Acceptance criteria

- [ ] Monorepo root has a working `package.json` with workspaces for `packages/web`, `packages/api`, `packages/infra`, `packages/shared`
- [ ] `npm run dev` in `packages/web` serves a React "hello world" page
- [ ] `packages/api` exports a Lambda handler that returns `{ status: "ok" }`
- [ ] `packages/infra` has a deployable CDK v2 stack (even if not yet deployed)
- [ ] `tsc --noEmit` passes across all packages with strict mode enabled
- [ ] ESLint passes across all packages with zero errors
- [ ] Vitest runs in `packages/web` with at least one passing test
- [ ] Playwright runs against `packages/web` with at least one passing test
- [ ] GitHub Actions CI workflow runs on every PR; type check + lint + Vitest + build all pass
- [ ] CD workflow scaffolded with OIDC placeholders (deploying deferred until AWS access is confirmed)

---

## What NOT to build

- Any application logic, UI components, or AI integration
- The JSON destination catalog (Phase 2)
- Trip Brief form, destination cards, or itinerary views (Phases 3–5)
- Real CDK deployment (blocked on AWS access)
- User accounts, database, map view (out of scope for pilot)

---

## Files likely affected

New:
- `package.json` (root) — workspace config (npm workspaces)
- `tsconfig.json` (root) — base strict TypeScript config
- `eslint.config.js` (root) — shared ESLint v9 flat config
- `.nvmrc` — pinned Node.js version (22.x)
- `packages/web/` — Vite + React 18 + TypeScript + Tailwind project
- `packages/api/` — Node.js + TypeScript Lambda handler + esbuild config
- `packages/infra/` — AWS CDK v2 TypeScript stack (placeholder stacks)
- `packages/shared/` — empty TypeScript project; types + Zod schemas added in Phase 2
- `e2e/` — Playwright config + one smoke test
- `.github/workflows/ci.yml` — type check, lint, Vitest, build on every PR
- `.github/workflows/cd.yml` — CD scaffold with OIDC placeholders (deploy step commented out)

Existing files to verify:
- `.gitignore` — confirm `cdk.out/`, `dist/`, `playwright-report/`, `test-results/` are covered (already present)

---

## Approach

Initialize the monorepo root with npm workspaces pointing at `packages/*`. Set up a shared `tsconfig.json` in strict mode that each package extends. Add ESLint v9 (flat config) with TypeScript support at the root. Scaffold `packages/web` with `npm create vite` (React + TypeScript template) and add Tailwind. Scaffold `packages/api` as a plain TypeScript project with esbuild for bundling; the handler returns `{ status: "ok" }`. Scaffold `packages/infra` with `cdk init app --language typescript`. Add `packages/shared` as an empty TypeScript project. Add Vitest to `packages/web` with one smoke test. Add Playwright at `e2e/` with one smoke test against the dev server. Wire up GitHub Actions CI to run `tsc`, `eslint`, `vitest`, and a build on every PR.

---

## Gaps requiring clarification

**BLOCKING** (CD / deployment only — CI tasks 1.1–1.8 can proceed now):
- AWS account ID and target region needed for CDK and Amplify config → contact technical owner / product owner
- GitHub Actions OIDC IAM role ARN needed for task 1.9 (CD) → CD workflow scaffolded with placeholder
- Amplify app ID needed to wire CD → same blocker as above

**CLARIFY** (proceeding with stated assumptions):
- Workspace manager: **assumed npm workspaces** (not pnpm) — confirm with technical owner if team has a preference
- Node.js version: **assumed Node 22.x** (current LTS as of Oct 2026) — confirm if a different version is required
- ESLint config style: **assumed ESLint v9 flat config** (`eslint.config.js`) — not legacy `.eslintrc`

---

## Definition of done

- All acceptance criteria checked off
- `/spec-check` passes
- `/code-review` passes (no BLOCKING findings)
- `/preflight` passes
- CI workflow is green on a real test PR
