---
name: personal-integrate-api
description: Integrate a documented API operation into the this workflow frontend with complete state, cache, and error handling.
---

# Integrate a Personal API operation

## Manual context

For interactive browser execution in Cursor, read `docs/ai/cursor-browser.md` for setup, session/data preflight, evidence, and fallback handling. Use actual available capabilities; native browser checks do not establish cross-browser or Android WebView coverage.

Required sections: `docs/ai/manual-api.md`, `docs/ai/manual-state.md`, `docs/ai/manual-security.md`, `docs/ai/manual-testing.md`.

Read these additional sections when their trigger applies:

- domain rules: `docs/ai/manual-product.md`.
- network placement or consumers: `docs/ai/manual-architecture.md`.
- new or changed code: `docs/ai/manual-coding.md`.
- new UI states: `docs/ai/manual-design.md`.
- messages or formatting: `docs/ai/manual-localization.md`.
- dynamic status or form errors: `docs/ai/manual-accessibility.md`.
- offline or container behavior: `docs/ai/manual-compatibility.md`.
- error capture or telemetry: `docs/ai/manual-observability.md`.
- request volume or payload impact: `docs/ai/manual-performance.md`.

Follow the reading contract in `AGENTS.md`. The required and conditional lists above are authoritative for this skill. Consult `docs/ai/manual-routing.md` only for a mixed task or an impact not covered above. Record selected sections and material gaps in the context manifest; never treat template prompts as approved rules. Read the relevant task-record, readiness, impact, and completion sections of `docs/ai/workflows.md`.

## Required inputs

- authoritative endpoint or OpenAPI operation;
- request, response, and documented error schemas;
- authentication and authorization behavior;
- cache, refetch, invalidation, and retry expectations;
- acceptance criteria and affected UI states.

## Workflow

1. Compare the contract with existing network operations, models, query keys, and error handling.
2. List missing or conflicting contract details and stop for material answers.
3. Define request ownership, response mapping, cache behavior, state transitions, and observability impact.
4. Implement within existing network and TanStack Query patterns.
5. Cover success, empty, partial, unauthorized, forbidden, validation, server, timeout, offline, cancellation, and retry behavior when applicable.
6. Build the level-purpose matrix from `docs/ai/manual-testing.md`. Add unit and integration coverage for new contract behavior and affected regressions, especially mapping, state transitions, cache invalidation, retries, and errors.
7. Run proportionate checks and route complete affected journeys to browser or webview testing when applicable.
8. Reconcile the contract, UI behavior, cache effects, level-purpose matrix, and platform matrix against the final diff.

Do not infer undocumented fields or error behavior from endpoint names. Never place secrets or private API documentation in the repository.
