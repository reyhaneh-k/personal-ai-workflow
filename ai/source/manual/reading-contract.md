# Shared reading and evidence contract

Read once per task, then reuse unchanged context. Each skill owns its required and conditional reading lists. Do not preload every skill or manual.

- Read required sections and sections triggered by actual scope before relying on them. Capability-conditional sections apply only when their `PROJECT.md` flag is `on`; never infer an enabled capability from an example.
- Read selected sections completely. Treat unfinished templates as questions, not approved policy. Ask only about gaps that materially affect the task.
- Record selected sources, material gaps, decisions, and verification in the task's context manifest; use references rather than copying source bodies. Reconcile readings with the final scope.
- Consult `docs/ai/manual-routing.md` only for mixed tasks, unmapped impacts, or AI-system maintenance. The catalog is derived from skills, not an independently maintained requirement list.
- When generated files are absent, read `ai/source/instructions.md`, `ai/source/skills/`, `ai/source/agents/`, and `ai/source/manual/` directly. A `docs/ai/<name>.md` reference maps to `ai/source/manual/<name>.md`. Source availability does not establish native discovery or runtime loading. Generation remains opt-in under `ai/README.md`.

## Conditional platform procedures

For interactive browser execution in Cursor, read `docs/ai/cursor-browser.md` for setup, safe session/data preflight, evidence, and fallbacks. Use available approved capabilities. Browser checks do not prove coverage of other browsers or a native webview.

When presenting evidence in a Canvas, use `personal-canvas-report` for its layout and formatting contract. Pass completed evidence to it; presentation alone does not require repeating analysis or provider requests.

## Procedure ownership

- `docs/ai/manual-testing.md` owns testing levels, purposes, status meanings, and the completion matrix. Skills add task-specific scenarios; role definitions assign responsibility.
- `ai/source/agents/*.json` owns role responsibilities, access boundaries, primary skills, and allowed handoffs. `docs/ai/teammates.md` is a derived catalog. Shared `AGENTS.md` owns the final handoff format.
- `docs/ai/workflows.md` owns the task record and lifecycle. `docs/ai/cursor-review.md` owns Cursor's review sequence.
