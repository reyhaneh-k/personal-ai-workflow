---
name: personal-peer-review
description: Perform a read-only, evidence-based peer review of this project's frontend merge/pull request or local diff for defects, regressions, and missing verification.
---

# Peer-review a frontend change

This is the independent teammate review for this project's frontend. It is separate from Cursor Agent Review, Cursor's human-facing Review changes screen, and Bugbot.

For an extended review, this same skill can be pinned in Cursor with **Use as Mode**; no separate `personal-review` alias is needed. Keep findings, inspected scope, and changed-revision evidence current across follow-ups. A same-chat switch from implementation is self-review, not independent approval. For independent review use a fresh reviewer context with the requirement, exact diff/base/revision, and necessary evidence. Exit implementation mode before reviewing; pinning does not create a separate agent or enforce read-only tool permissions.

## Manual context

Required sections: `docs/ai/manual-coding.md`, `docs/ai/manual-testing.md`, `docs/ai/manual-delivery.md`.

Read these additional sections when their trigger applies:

- acceptance criteria: `docs/ai/manual-product.md`.
- shared consumers: `docs/ai/manual-architecture.md`.
- UI changes: `docs/ai/manual-design.md`.
- network diff: `docs/ai/manual-api.md`.
- queries or stores: `docs/ai/manual-state.md`.
- auth or sensitive data: `docs/ai/manual-security.md`.
- text or formatting when `PROJECT.md` enables localization: `docs/ai/manual-localization.md`.
- interactive UI: `docs/ai/manual-accessibility.md`.
- affected platforms: `docs/ai/manual-compatibility.md` (webview only when `PROJECT.md` enables webview).
- telemetry diff when `PROJECT.md` enables sentry: `docs/ai/manual-observability.md`.
- resource impact: `docs/ai/manual-performance.md`.

Follow the shared reading contract in `AGENTS.md`.

Read the task requirement and the actual diff. When Cursor Agent Review findings exist, treat them as evidence to verify rather than conclusions to repeat. Do not skip independent inspection because Agent Review or Bugbot reported no findings.

## Review priorities

1. Incorrect behavior and acceptance-criteria gaps
2. Regressions in affected and shared flows
3. Authentication, authorization, privacy, and secret exposure
4. API contract and cache behavior
5. Browser compatibility, and native webview compatibility when `PROJECT.md` enables webview
6. Localization and layout direction when `PROJECT.md` enables localization; accessibility; responsive behavior
7. Performance and, when `PROJECT.md` enables sentry, observability regressions
8. Missing or ineffective tests
9. Maintainability issues that create a concrete future risk

Use current library documentation when correctness depends on a versioned API. Do not report generic style preferences as defects.

## Output

For a substantial Cursor review, use the peer-review Canvas layout in `docs/ai/cursor-canvas.md` when useful or requested. Preserve actionable text findings and exact reviewed revision; the view adds no approval or edit authority.

Lead with actionable findings ordered by severity. For every finding include location, evidence, user impact, and a concrete remediation direction. Then list open questions and residual testing gaps.

If no actionable finding exists, say so and still report unverified areas. Do not edit code during the review unless the human explicitly requests fixes.
