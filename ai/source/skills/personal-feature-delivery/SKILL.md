---
name: personal-feature-delivery
description: Maintain readiness, scope, impact checks, and completion evidence across a multi-turn Personal frontend feature implementation.
---

# Feature delivery

Use as the persistent working method for a substantial feature. In Cursor, the developer can select this skill with **Use as Mode**; loading the skill does not prove that a mode is active. For a bounded edit, use its specific task skill directly.

## Manual context

When presenting results in a Canvas, use the current platform's `personal-canvas-report` skill for the stable layout and formatting contract. Pass completed evidence to it; do not repeat this workflow solely for rendering.

Required sections: `docs/ai/manual-product.md`, `docs/ai/manual-architecture.md`, `docs/ai/manual-coding.md`, `docs/ai/manual-testing.md`.

Follow the reading contract in `AGENTS.md` and the task record, readiness, impact, and completion sections of `docs/ai/workflows.md`. Load `personal-implement-task` from the current platform for its conditional manual routing and implementation procedure. Additionally load `personal-implement-figma` for design translation, `personal-integrate-api` for endpoint integration, or `personal-refactor` for an explicitly scoped restructuring. Read only applicable skills and their required/triggered sections; reuse unchanged context. For an unmapped impact consult `docs/ai/manual-routing.md`.

## Inputs and persistent checkpoints

- Establish the outcome, acceptance criteria, feature owner, and relevant product/design/API evidence. If intake is not ready, use `personal-task-intake` before implementation. Ask about material gaps; preserve answers and evidence in one task record.
- Before editing, reconcile the request with existing code and present readiness, affected consumers, and the implementation/test checklist. Do not restart intake on every follow-up.
- Keep one primary task skill recorded separately from this working method. Apply specialist procedures where needed, including Figma/Sentry source and capacity checks; a mode does not authorize integration access or external writes.
- On scope changes, refresh only the affected sources, manual sections, checklist items, and test scenarios. Record unrelated discoveries separately.
- For Cursor visual refinement, recommend native Design Mode and follow `docs/ai/cursor-design-mode.md`. Use the applicable implementation skill, check shared-component impact, and reconcile visual feedback in the existing task record. A working-mode badge does not prove native Design Mode is enabled.
- Write and execute the applicable unit/integration tests. Select higher levels from the change's actual boundaries and distinguish regression purpose from testing level.
- If a defect requires runtime investigation, preserve the evidence and recommend `personal-debug`; do not pretend that a text instruction switches Cursor modes.

## Completion and handoff

When a feature's checklist or dependencies benefit from an interactive overview in Cursor, read `docs/ai/cursor-canvas.md` and maintain a view of the existing task record. Reuse collected evidence and update the same view instead of rebuilding it each turn.

Reconcile the final diff, acceptance criteria, initial checklist, newly affected consumers, and actual test evidence. Include the required browser/device/WebView matrix with explicit gaps. Follow `docs/ai/cursor-review.md` on Cursor. Use the frontend implementer's next-teammate route in `docs/ai/agents.md`; recommend rather than launch the next role. A same-chat review remains self-review. At a phase transition, provide a compact handoff and ask the developer to exit or replace the active mode through the client; never claim it was switched automatically.
