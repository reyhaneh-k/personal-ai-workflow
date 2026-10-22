---
name: personal-test-e2e
description: Independently test an affected Personal browser journey end to end using an approved browser capability or existing project harness.
---

# Test a Personal browser journey

## Manual context

For interactive browser execution in Cursor, read `docs/ai/cursor-browser.md` for setup, session/data preflight, evidence, and fallback handling. Use actual available capabilities; native browser checks do not establish cross-browser or Android WebView coverage.

Required sections: `docs/ai/manual-testing.md`, `docs/ai/manual-compatibility.md`.

Read these additional sections when their trigger applies:

- expected outcomes and user roles: `docs/ai/manual-product.md`.
- navigation or shared consumers: `docs/ai/manual-architecture.md`.
- visual states and breakpoints: `docs/ai/manual-design.md`.
- request, response, and failure states: `docs/ai/manual-api.md`.
- cache or persistence: `docs/ai/manual-state.md`.
- authentication, authorization, or sensitive data: `docs/ai/manual-security.md`.
- Persian, RTL, or formatting: `docs/ai/manual-localization.md`.
- keyboard, focus, and semantics: `docs/ai/manual-accessibility.md`.
- telemetry expectations: `docs/ai/manual-observability.md`.
- performance criteria: `docs/ai/manual-performance.md`.

Follow the reading contract in `AGENTS.md`. The required and conditional lists above are authoritative for this skill. Consult `docs/ai/manual-routing.md` only for a mixed task or an impact not covered above. Record selected sections and material gaps in the context manifest.

## Inputs

Require the affected journey and acceptance criteria, environment or runnable build, browser matrix, test-user/state requirements, data prerequisites, and the final implementation evidence. Ask for material missing access; never invent credentials or production data.

## Workflow

1. Confirm whether a committed E2E harness exists. This repository currently does not establish Playwright or Cypress as a project capability; re-check rather than assuming.
2. Use an available approved browser capability for focused execution when no harness exists. Do not add a framework or modify tests in this read-only role.
3. Separate E2E purposes: cover the shortest complete journey for new behavior and the affected existing journeys for regression protection. A scenario may serve both purposes only when its assertions genuinely cover both.
4. Inspect visible behavior, URL/navigation, console errors, failed requests, focus/keyboard behavior, and responsive layout where relevant.
5. Record browser/version, viewport, environment, data state, steps, expected result, actual result, and sanitized evidence.
6. Mark every scenario passed, failed, blocked, not run, or not applicable and identify its purpose as new behavior, regression, or both. Browser execution does not certify Android webview behavior.

Return findings first, followed by the scenario matrix, evidence, coverage gaps, and status. Never expose session tokens, personal data, or private response bodies.
