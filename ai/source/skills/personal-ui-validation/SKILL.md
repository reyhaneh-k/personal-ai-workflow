---
name: personal-ui-validation
description: Maintain evidence-based visual, interaction, browser, and WebView checks throughout an extended Personal UI validation session.
---

# UI validation

Use for sustained validation across screens, states, or platforms. In Cursor this skill can be pinned with **Use as Mode**. Default to inspection and testing; findings do not authorize implementation changes. Test sessions may interact with the agreed test environment and data.

## Manual context

For interactive browser execution in Cursor, read `docs/ai/cursor-browser.md` for setup, session/data preflight, evidence, and fallback handling. Use actual available capabilities; native browser checks do not establish cross-browser or Android WebView coverage.

When presenting results in a Canvas, use the current platform's `personal-canvas-report` skill for the stable layout and formatting contract. Pass completed evidence to it; do not repeat this workflow solely for rendering.

Required sections: `docs/ai/manual-design.md`, `docs/ai/manual-testing.md`, `docs/ai/manual-compatibility.md`, `docs/ai/manual-accessibility.md`, `docs/ai/manual-localization.md`.

Read `docs/ai/manual-product.md` for behavior/acceptance questions, `docs/ai/manual-api.md` and `docs/ai/manual-state.md` for response/cache scenarios, `docs/ai/manual-security.md` for restricted users or private data, and `docs/ai/manual-performance.md` for explicit performance criteria. Follow `AGENTS.md` and the task-record, impact, and completion sections of `docs/ai/workflows.md`. Reuse unchanged context; consult `docs/ai/manual-routing.md` only for an unmapped impact.

## Inputs and persistent checks

- For Cursor Design Mode input, read `docs/ai/cursor-design-mode.md` and use its visual evidence for comparison. Remain findings-only until a fix is requested; a browser toggle does not change the task's authorization. Recheck the live state after edits and use normal browsing for interaction tests.
- Establish routes/journeys, acceptance criteria, the approved visual reference, runnable environment, safe user/data states, and available browsers/devices. Separate unavailable evidence from defects. If accessing Figma, first follow `docs/ai/integrations.md`; an export is a valid source and a screenshot alone cannot establish unspecified interactions.
- Select the actual scope: responsive layouts, loading/empty/error/disabled states, RTL and long text, focus and keyboard behavior, and relevant navigation. Do not claim every platform is required or verified for every change.
- Use the current platform's `personal-test-e2e` for browser journeys, `personal-test-webview` for Android container/bridge behavior, and `personal-accessibility-audit` for a dedicated accessibility audit. Load only selected skills and their required/triggered manual sections. This routing does not launch teammates.
- Record build/revision, environment, browser/device, viewport, scenario, purpose, expected/actual behavior, and focused evidence. Desktop mobile emulation is not real-device or Android WebView evidence; a screenshot is not a behavioral test.
- Maintain one platform matrix and finding list across follow-ups. After a fix, rerun the failing scenario and affected adjacent states; mark evidence stale if the tested build changed.
- If asked to fix findings, clarify the implementation scope when needed and transition to the appropriate implementation skill. Do not call subsequent self-validation independent verification.

## Completion and handoff

When a Cursor validation matrix spans many states or platforms, use `docs/ai/cursor-canvas.md` for an interactive verification view. Keep the findings-only scope and evidence-backed statuses; report-layout changes do not count as product fixes.

Return prioritized findings and the reconciled checklist/matrix using passed, failed, blocked, not run, and not applicable with reasons. Distinguish visual comparison, interaction evidence, and durable automated tests. Include remaining human/device checks and recommend at most one relevant existing teammate from `docs/ai/agents.md` (or `none`); do not start it automatically. Keep unit/integration verification with `personal-test-verifier`. End the persistent mode through the client when validation is finished.
