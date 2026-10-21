# Travel AI Advisor

## Project overview

Travel AI Advisor is a conversational travel-planning assistant that turns a trip idea into a feasible, constraint-aware itinerary. It is a decision-support tool, not a booking platform. Users provide a trip brief (departure city, dates, budget, interests, pace, and transportation constraints) and the advisor compares up to three destination options, builds a day-by-day itinerary for the chosen destination, and supports conversational refinement while keeping all hard constraints intact.

## Tech stack

- **Frontend**: React 18 + TypeScript + Vite, Tailwind CSS
- **Backend**: Node.js (AWS-supported LTS) + TypeScript on AWS Lambda
- **AI runtime**: Amazon Bedrock (AWS SDK for JavaScript) — requires owner approval before any production call
- **Validation**: Zod — runtime schema validation for all AI output and API inputs
- **Infrastructure**: AWS CDK (TypeScript), AWS Amplify Hosting, Amazon API Gateway
- **Monitoring**: Amazon CloudWatch (no full conversations or sensitive trip details logged by default)
- **CI/CD**: GitHub Actions (OIDC + scoped IAM roles, no long-lived AWS keys)

## Architecture

Three-layer separation — each layer has one responsibility:

```
UI (React + Vite)
  └── HTTPS → Application Logic (Lambda + TypeScript)
                  ├── AI Runtime (Amazon Bedrock)
                  └── Travel Data Layer (versioned JSON catalog)
```

- **UI layer**: renders Trip Brief, Destination Comparison, and Itinerary Workspace views. Validates input with Zod before sending to the API. Never calls Bedrock directly. Shows an explicit error and preserves the previous valid plan on API failure.
- **Application logic layer**: classifies constraints vs. preferences, validates all Bedrock output with Zod, calculates and totals budget figures (the AI model never does arithmetic), diffs itineraries for change summaries, enforces the budget-honesty rule.
- **AI runtime (Bedrock)**: interprets natural-language preferences, proposes destinations with rationale and trade-offs, generates itinerary structure. Does NOT supply prices, hours, or availability. Does NOT perform arithmetic.
- **Travel data layer**: versioned JSON catalog supplying traceable facts (cost ranges, source URLs, check dates). Human-curated; the AI model never writes to the catalog.

## Key directories

```
packages/
  web/          React + TypeScript frontend (Vite, Tailwind)
  api/          Node.js Lambda handlers (TypeScript, ESM, esbuild)
  shared/       Shared TypeScript interfaces and Zod schemas
  infra/        AWS CDK stacks (TypeScript)
e2e/            Playwright end-to-end tests
data/           Versioned JSON destination catalog
docs/           Product requirements, architecture, data model, guidelines
```

## Conventions

**Naming**
- TypeScript interfaces: PascalCase (e.g. `TripBrief`, `Destination`, `CostLine`)
- Functions and variables: camelCase
- Zod schemas: named after their interface with a `Schema` suffix (e.g. `TripBriefSchema`)
- JSON catalog files: kebab-case destination names

**Patterns to follow**
- All Bedrock responses must be Zod-validated before reaching the UI; on validation failure return a user-visible error and preserve the previous valid plan
- Budget arithmetic and constraint checks are always deterministic application code — never model-generated arithmetic
- Every travel fact (price range, hours, transit time) must carry a `Source` with `url`, `dateChecked`, and `isStale`
- Sources with `dateChecked` older than 90 days are flagged `isStale: true` and shown with a warning icon in the UI
- Hard constraints are never silently violated; if a constraint makes a destination impossible, explain why
- After any itinerary refinement, recheck the **entire** plan against all hard constraints — not just the changed section
- Prompt templates are versioned (e.g. `destination-proposals-v1`); increment the version when output structure changes
- Pass plan state to the AI model as structured JSON, not prose summaries
- Include the JSON catalog in the prompt; the model uses catalog data, not its training knowledge, for facts

**Patterns to avoid**
- No direct Bedrock calls from the UI layer
- No raw model output rendered in the UI — always parse, validate, and render through typed components
- No prices or facts invented by the AI model — all monetary figures come from the JSON catalog
- No `any` in TypeScript — use `unknown` and narrow
- No silent price adjustment to make a plan fit the budget
- Do not add a database, user accounts, map view, booking APIs, a vector database, or an agent framework unless an approved requirement demonstrates the need (out of scope for pilot)

## Approved dependencies

- **Validation**: Zod
- **Styling**: Tailwind CSS
- **Testing (unit/component)**: Vitest + React Testing Library
- **Testing (e2e)**: Playwright
- **Infrastructure**: AWS CDK v2 (TypeScript)
- **Build**: Vite (frontend), esbuild (Lambda bundling)
- **AI SDK**: AWS SDK for JavaScript (Bedrock)

## Forbidden dependencies

- No booking or live pricing APIs (out of scope for pilot)
- No map libraries (Mapbox, Google Maps) — map view is post-pilot
- No vector databases
- No agent frameworks
- No user-account or session-storage libraries (Amazon Cognito / DynamoDB deferred to post-pilot pending owner approval)

## Environment variables

```
AWS_REGION                  AWS region for Bedrock and Lambda
BEDROCK_MODEL_ID            Bedrock model identifier (requires owner approval)
API_GATEWAY_URL             API Gateway endpoint for the Lambda functions
AMPLIFY_APP_ID              Amplify Hosting app identifier
CLOUDWATCH_LOG_GROUP        CloudWatch log group name
```

## Development workflow

1. Start with `/feature-start` — reads the GitHub issue, confirms requirements
2. Phases 1–2 have zero AI dependency — complete and merge before Bedrock access is confirmed
3. Each phase produces a working, deployable increment
4. Run `/spec-check` — fix any doc gaps before opening a PR
5. Run `/code-review` — resolve all BLOCKING findings
6. Run `/pr-ready` — confirms checklist before requesting review
7. Open PR with `/pr-ready` output pasted in description

## PR review gates (required before merge)

- [ ] `/preflight` passed
- [ ] `/code-review`: no BLOCKING findings
- [ ] `/spec-check`: no gaps
- [ ] Human reviewer approved
- [ ] CI pipeline green (type check, lint, Vitest, Playwright, production build)

## Testing strategy

| Layer | Tool | Scope |
|-------|------|-------|
| Unit | Vitest | Budget calculation, constraint classification, change diffing, Zod schema parse/reject, source freshness |
| Component | React Testing Library + Vitest | Form validation, chip rendering, budget summary, error states |
| End-to-end | Playwright | AC-1 through AC-11 (see `docs/testing-guidelines.md`) |
| AI fixtures | Recorded JSON (VCR pattern) | No live Bedrock calls in CI |
| Type checking | `tsc --noEmit` | All packages |

Do **not** write automated assertions on specific destinations proposed, exact wording of rationale, or specific activities — these are human-judgment evaluations, not CI gates.

## Acceptance criteria (AC-1 – AC-11)

All eleven ACs are defined in `docs/testing-guidelines.md` and mapped to Playwright scenarios. Key ones:

- **AC-1**: Budget clarification before proposing destinations (never assume budget includes flights)
- **AC-2**: No-rental-car constraint enforced throughout destinations and itinerary
- **AC-5**: Category amounts sum to displayed total; unknown costs remain visibly unknown (never treated as zero)
- **AC-8**: Conflicting change raises an explicit conflict explanation — constraint is never silently dropped
- **AC-9**: Infeasibility reported honestly; no fabricated prices
- **AC-11**: Brief, budget, and itinerary accessible in structured views outside conversation history

## Non-negotiable product rules

These apply to every AI-generated response and cannot be configured away:

1. **Budget honesty** — if no plan fits constraints, say so and offer adjustments; never adjust prices to make the answer fit
2. **Estimate labeling** — all costs are labeled as estimates; an estimate is not a quote; an itinerary is not a reservation
3. **Source transparency** — every travel fact is accompanied by its source and the date it was checked
4. **Constraint integrity** — hard constraints are never silently violated
5. **Full-plan recheck on change** — refinement rechecks the whole itinerary, not just the changed section
6. **Clarify before assuming** — when user input is ambiguous (e.g., whether budget includes flights), ask rather than decide

## Open decisions blocking implementation

| Decision | Blocks | Owner |
|----------|--------|-------|
| Which destinations, departure regions, and trip lengths the pilot supports | Phase 2 (catalog) | Product owner |
| Which sources are permitted and how recent each must be | Phase 2 (catalog) | Product owner + technical owner |
| Bedrock model, region, data handling, latency, and cost approved | Phase 4 (Bedrock calls) | Product owner + technical owner |
| Data retention, deletion, and sharing rules | Phase 7 (CloudWatch config) | Product owner + technical owner |
| Pilot access controls and cost limits | Phase 7 (Budgets, IAM) | Product owner + technical owner |
| Measurable pilot success target and acceptance process | Pre-launch | Product owner + QA owner |

## Pods and owners

| Pod | Area | Contact |
|-----|------|---------|
| Not yet assigned | Product decisions | Product owner (TBD) |
| Not yet assigned | Technical decisions, architecture | Technical owner (TBD) |
| Not yet assigned | QA and acceptance | QA owner (TBD) |
| Not yet assigned | Delivery | Delivery owner (TBD) |

## Reference documents

| Document | Purpose |
|----------|---------|
| `docs/travel-ai-advisor-spec.md` | Authoritative product spec and acceptance criteria (AC-1–AC-11) |
| `docs/architecture-specs.md` | Three-layer architecture, AWS stack, data flows |
| `docs/product-requirements.md` | Core user flows, non-negotiable rules, out-of-scope items |
| `docs/ui-guidelines.md` | Three-view layout, component patterns, copy guidelines |
| `docs/testing-guidelines.md` | AC-1–AC-11 Playwright scenarios, unit test coverage, what not to automate |
| `docs/ai-prompt-guidelines.md` | System prompt template, output schemas, prompt versioning |
| `docs/data-model.md` | TypeScript interfaces and curated catalog schema |
| `docs/implementation-plan.md` | Phase-by-phase tasks, guiding principles, open decisions |
