---
name: personal-verify-task
description: Verify completed frontend work in this project against its original checklist and produce an evidence-based platform test matrix.
---

# Verify a frontend task

## Manual context

Required sections: `docs/ai/manual-testing.md`, `docs/ai/manual-compatibility.md`.

Read these additional sections when their trigger applies:

- expected behavior: `docs/ai/manual-product.md`.
- newly affected consumers: `docs/ai/manual-architecture.md`.
- visual comparisons: `docs/ai/manual-design.md`.
- response and error scenarios: `docs/ai/manual-api.md`.
- cache/persistence scenarios: `docs/ai/manual-state.md`.
- restricted-user scenarios: `docs/ai/manual-security.md`.
- text and formatting when `PROJECT.md` enables localization: `docs/ai/manual-localization.md`.
- UI interaction: `docs/ai/manual-accessibility.md`.
- telemetry assertions when `PROJECT.md` enables sentry: `docs/ai/manual-observability.md`.
- performance acceptance criteria: `docs/ai/manual-performance.md`.
- release-specific checks: `docs/ai/manual-delivery.md`.

Follow the shared reading contract in `AGENTS.md`.

Read the original task record, approved checklist, final diff, and `docs/ai/workflows.md`.

## Workflow

1. Map every acceptance criterion and planned checklist item to implementation evidence.
2. Inspect changes for newly affected surfaces that were absent from the original plan.
3. Build the required level-purpose matrix from `docs/ai/manual-testing.md`. Apply its capability conditions and distinguish new-behavior from regression coverage.
4. Identify changed logic and the relevant unit and integration tests. Resolve commands from `PROJECT.md` and current package scripts. Run targeted tests first, then the established non-watch suite when proportionate. Do not assume a package manager or test runner. Do not substitute an implementer's report for execution.
5. Report a missing test file, a command that collects no tests, unavailable dependencies, or an unsafe environment as missing/blocked evidence—not a pass. Do not create or edit tests in this read-only role.
6. Reconcile claimed regression coverage with the scenarios actually executed.
7. Run proportionate build or static checks when the change can fail outside behavioral test execution, but do not label those checks as unit, integration, or E2E tests.
8. Apply the evidence statuses and reasons defined in `docs/ai/manual-testing.md`.
9. Select required browsers, responsive layouts, containers, user states, locales, and failure modes based on the actual change.
10. Route affected browser journeys to `personal-e2e-tester` and, when `PROJECT.md` enables webview, native-container behavior to `personal-webview-tester`; do not duplicate specialist execution when it is not applicable.
11. Identify tests that require a human, real device, production-like data, or unavailable credentials.
12. Update the completion reconciliation with missed items and follow-up tasks.

## Output

Return:

- acceptance-criteria verification;
- reconciled checklist;
- automated check results;
- exact unit and integration test commands, selected tests, duration when available, and pass/fail/no-tests evidence;
- the completed level-purpose matrix, including new-behavior and regression columns;
- platform, browser, and device scenario matrix where applicable;
- residual risks;
- final status: verified, verified with follow-up, blocked, or failed.

Do not infer that unexecuted testing passed.

For a substantial Cursor verification result, use the verification Canvas in `docs/ai/cursor-canvas.md` when useful or requested. Display the actual level-purpose/platform matrix; keep blocked and not-run checks visible and retain the authoritative task record.
