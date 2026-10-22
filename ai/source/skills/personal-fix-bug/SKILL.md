---
name: personal-fix-bug
description: Diagnose and fix a reproducible Personal frontend defect with regression-focused verification.
---

# Fix a Personal frontend bug

Use this workflow when the defect is straightforward or the root cause is already supported by evidence. For a difficult defect that needs instrumentation or runtime-state collection, use `personal-debug` instead; on Cursor that workflow must run in native Debug Mode.

## Manual context

For interactive browser execution in Cursor, read `docs/ai/cursor-browser.md` for setup, session/data preflight, evidence, and fallback handling. Use actual available capabilities; native browser checks do not establish cross-browser or Android WebView coverage.

Required sections: `docs/ai/manual-product.md`, `docs/ai/manual-architecture.md`, `docs/ai/manual-testing.md`.

Read these additional sections when their trigger applies:

- implementing the fix: `docs/ai/manual-coding.md`.
- visual defects: `docs/ai/manual-design.md`.
- network failures: `docs/ai/manual-api.md`.
- cache or store defects: `docs/ai/manual-state.md`.
- auth or private data: `docs/ai/manual-security.md`.
- RTL or formatting defects: `docs/ai/manual-localization.md`.
- interaction defects: `docs/ai/manual-accessibility.md`.
- browser/device reproduction: `docs/ai/manual-compatibility.md`.
- Sentry or logs: `docs/ai/manual-observability.md`.
- timing or resource symptoms: `docs/ai/manual-performance.md`.

Follow the reading contract in `AGENTS.md`. The required and conditional lists above are authoritative for this skill. Consult `docs/ai/manual-routing.md` only for a mixed task or an impact not covered above. Record selected sections and material gaps in the context manifest; never treat template prompts as approved rules. Read the relevant task-record, readiness, impact, and completion sections of `docs/ai/workflows.md`.

## Required inputs

- expected and actual behavior;
- reproduction steps and affected environment;
- browser, device, or webview information;
- evidence such as logs, screenshots, Sentry issue, or failing test.

## Workflow

1. Reproduce the failure or state exactly why reproduction is blocked.
2. Trace the failing behavior through the smallest relevant code and runtime path.
3. Distinguish the root cause from symptoms and unrelated defects.
4. Prepare an impact checklist and the level-purpose matrix from `docs/ai/manual-testing.md`. Identify the lowest level that reliably reproduces the defect and every higher-level boundary required by the failure.
5. Implement the narrowest durable fix without silently changing product behavior.
6. Add a regression scenario at the lowest reliable level and any required integration, E2E, or webview level. Record an explicit reason when durable automation is not possible.
7. Re-run the original scenario and affected adjacent states.
8. Reconcile the final diff with the initial hypothesis and report residual risk.

Do not change code merely because a plausible cause was found. Evidence must support the fix.
