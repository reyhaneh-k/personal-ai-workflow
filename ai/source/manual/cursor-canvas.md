# Cursor Canvas for Personal

## Contents

- [Start using Canvas](#start-using-canvas)
- [Reusable Personal views](#reusable-personal-views)
- [Evidence and interaction](#evidence-and-interaction)
- [Example prompts](#example-prompts)
- [Cost and verification](#cost-and-verification)

## Start using Canvas

Cursor canvases are saved interactive artifacts beside chat. Open a result through its chat card, **View: Open Canvas**, or the Agents Window's new-tab menu. They can be revisited and updated. [Cursor Canvas documentation](https://cursor.com/docs/agent/tools/canvas)

Use `/personal-canvas-report` for the Personal report contract. It selects the layout, source workflow, and formatting, then uses Cursor's built-in `/canvas` capability when available. [Cursor built-in skills](https://cursor.com/docs/skills)

For Personal, use a canvas when it makes a substantial result easier to inspect: linked impacts, many findings, a testing matrix, or comparable usage periods. Small answers can remain text. Load this guide only when producing such a view. The task skill supplies evidence; native Canvas instructions supply rendering. No extra project dependency or always-on mode is needed.

Confirm native support in the current client and use its rendering instructions instead of inventing a file format or API. If unavailable, deliver Markdown tables and existing SVG charts, and report that no native canvas was created. Other platforms may use available presentation tools without claiming Cursor compatibility.

## Reusable Personal views

The authoritative layout and formatting contract lives in `personal-canvas-report`. The table below is a human-facing summary; select only the relevant view. The skill preserves section order and columns across refreshes, defines sort/filter behavior, and keeps source units, time windows, and missing-data coverage explicit.

| View | Existing workflow | Evidence and layout |
| --- | --- | --- |
| Feature overview | Task intake / feature delivery | Task record and inspected consumers: readiness, open questions, impact relationships, checklist filtered by status/area, source references |
| Peer review | `personal-peer-review` | Exact diff/base/revision and verified findings: severity summary, findings by file/impact, expandable evidence, reviewed scope and gaps |
| Verification | Task verification / UI validation | Executed checks and reconciled matrices: acceptance coverage, testing level versus purpose, browser/device filters, blocked/not-run cases |
| Sentry investigation | `personal-investigate-sentry` | Sanitized evidence from the selected MCP/export/API: environment/release/window, issue clusters, measured impact, observations versus hypotheses |
| Monthly usage | `personal-token-usage-audit` | Existing aggregate CSV/SVG/report outputs: provider/product/month filters, tokens/cost, tool failures/fallbacks, efficiency and measurement coverage |
| Context audit | `personal-context-audit` | Repository audit plus actual client evidence: available versus loaded instructions, duplicate candidates, measured context categories, unknowns |

Include source references, data/revision window, scope, and material unknowns. Use status text rather than color alone. Diagrams should explain relationships; tables suffice for direct comparisons.

## Evidence and interaction

1. Complete the task skill's analysis first. Reuse evidence already collected; changing presentation does not require new integration requests. Retain Figma/Sentry source-choice and capacity rules in `docs/ai/integrations.md`.
2. Treat the canvas as a view of the task record or audit output. Keep project instructions in Markdown. Do not add report UI to application routes or install dependencies in Personal just to render it.
3. Use filters, sorting, expandable evidence, and source links. A manually changed checkbox is not proof that a test passed or a requirement was accepted. Update the authoritative record from actual decisions/results before refreshing the display.
4. Preserve units, denominators, time windows, and exact/estimated labels. Unknown usage is not zero. Context occupancy is separate from billed usage; do not add tool-result tokens again to totals already containing them. Preserve untested-platform gaps.
5. Mark views stale when code/data changes. Refresh through the existing workflow. Reopening a canvas does not establish live data, a monitoring schedule, or an active Sentry robot.
6. Follow the source skill and `docs/ai/credentials.md`: use sanitized evidence and exclude credentials, raw production payloads, and private chat histories from artifact source as well as its visible UI.
7. Keep interactions focused on evidence. Any action button must clearly describe its intended prompt; a report grants no new authority to mutate Sentry, submit/merge MRs, or message teammates. MR preparation still returns a creation link.

Publishing creates a separate share and depends on account, team, privacy, and administrator settings. Publish or send links only when requested. [Canvas sharing](https://cursor.com/docs/agent/tools/canvas#sharing-canvases)

Cursor supports Design Mode within canvases and a context-usage Canvas report. Use those for layout refinement or available context evidence. [Canvas improvements](https://cursor.com/changelog/canvas-improvements)

Editing report layout does not change the application or underlying evidence. For running-product refinement use `docs/ai/cursor-design-mode.md`. A findings-only request permits a presentation artifact, not product-code changes.

## Example prompts

Short prompts can invoke the packaged workflow directly:

```text
/personal-canvas-report feature from this task record
/personal-canvas-report verification from these test results
/personal-canvas-report usage from this month's generated report
/personal-canvas-report sentry from this sanitized export
```

Ask to refresh when new evidence is needed; otherwise the skill reuses supplied results. Source workflows can also hand their outputs to `personal-canvas-report`, as in these examples:

```text
Use personal-task-intake for this feature. Show readiness questions, affected
components, and the checklist as a Canvas using docs/ai/cursor-canvas.md.
Do not implement yet.
```

```text
Use personal-verify-task on this diff and task record. Present actual test
results and the browser/WebView matrix in a Canvas. Include filters for
blocked and not-run checks and preserve the evidence-backed task record.
```

```text
Use personal-token-usage-audit with these approved aggregate exports.
Render the generated monthly report in a Canvas with provider/month
filters. Distinguish unknown from zero; keep it unshared.
```

```text
Use personal-investigate-sentry with this sanitized export. Show issue
clusters, evidence, hypotheses, and gaps in a Canvas without new requests.
```

## Cost and verification

Start with the smallest useful view and update it rather than rebuilding every turn. Reuse aggregates and focused evidence references. Rendering consumes tokens; measure its value through actual usage and fewer clarification/review cycles, without promising savings or adding tool-call caps.

Inspect the rendered result when tools allow it, exercise filters, and compare displayed totals/statuses to sources. Check empty/unknown states, provenance, and stale-data labels. Report unverified rendering or interaction honestly. Rendering a canvas is not an application E2E test.

Complete the local checks in `docs/ai/platform-capabilities.md`. Repository generation verifies references and copies; native Canvas behavior still requires a Cursor session.
