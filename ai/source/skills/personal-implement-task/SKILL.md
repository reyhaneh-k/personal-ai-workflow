---
name: personal-implement-task
description: Implement a ready this workflow frontend task from an approved intake record and impact checklist.
---

# Implement a Personal frontend task

## Manual context

For interactive browser execution in Cursor, read `docs/ai/cursor-browser.md` for setup, session/data preflight, evidence, and fallback handling. Use actual available capabilities; native browser checks do not establish cross-browser or Android WebView coverage.

Required sections: `docs/ai/manual-product.md`, `docs/ai/manual-architecture.md`, `docs/ai/manual-coding.md`, `docs/ai/manual-testing.md`.

Read these additional sections when their trigger applies:

- UI changes: `docs/ai/manual-design.md`.
- Cursor visual refinement or Design Mode input: `docs/ai/cursor-design-mode.md`. Recommend native Design Mode when a running UI can clarify a spatial change; preserve the current task's scope and evidence.
- network operations: `docs/ai/manual-api.md`.
- queries or stores: `docs/ai/manual-state.md`.
- auth or sensitive data: `docs/ai/manual-security.md`.
- text, RTL, numbers, or dates: `docs/ai/manual-localization.md`.
- interactive UI: `docs/ai/manual-accessibility.md`.
- platform-specific behavior: `docs/ai/manual-compatibility.md`.
- instrumentation: `docs/ai/manual-observability.md`.
- loading or resource impact: `docs/ai/manual-performance.md`.

Follow the reading contract in `AGENTS.md`. The required and conditional lists above are authoritative for this skill. Consult `docs/ai/manual-routing.md` only for a mixed task or an impact not covered above. Record selected sections and material gaps in the context manifest; never treat template prompts as approved rules. Read the relevant task-record, readiness, impact, and completion sections of `docs/ai/workflows.md`.

Use only after task intake is `ready` or the human explicitly resolves the recorded blockers.

## Inputs

- approved task record;
- acceptance criteria;
- implementation checklist;
- relevant product, design, and API sources.

## Workflow

1. Verify the approved inputs still match the current request and working tree.
2. Inspect nearby code, tests, shared components, network operations, and platform helpers.
3. Implement the smallest coherent change that satisfies the acceptance criteria.
4. Cover each applicable state and cross-cutting concern from the checklist.
5. Plan applicable testing levels separately from testing purposes using the matrix in `docs/ai/manual-testing.md`. Do not require every level automatically.
6. Add or update unit and integration tests for new behavior and regression protection at the lowest reliable level. Add higher-level coverage when the risk depends on interactions, navigation, browser behavior, or the native container.
7. Run proportionate checks without overwriting unrelated user changes. Record automated tests separately from manual checks, builds, linting, and static analysis.
8. Reconcile the level-purpose matrix and implementation checklist against the actual diff; record deviations, new discoveries, and applicable tests that were not run or remain blocked.
9. Hand the change to independent review and verification.

Stop and ask when implementation reveals a material product, design, API, permission, or release decision that was not approved.

## Output

Report changed behavior, changed files, the level-purpose test matrix, checks performed, unverified conditions, deviations, and follow-up work. Do not claim completion solely from a successful build.
