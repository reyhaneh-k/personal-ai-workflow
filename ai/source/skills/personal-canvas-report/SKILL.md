---
name: personal-canvas-report
description: Create or refresh a consistent Personal Canvas report for feature readiness, peer review, verification, Sentry, monthly usage, or context audits. Use for interactive reports, not product UI implementation.
---

# Personal Canvas report

## Manual context

Read `docs/ai/cursor-canvas.md` for native rendering, evidence, and sharing behavior. Presentation of existing evidence requires no product-manual sections. If analysis or fresh data is needed, use only the relevant source workflow below and its required/conditional readings. Reuse results already in context; do not recursively rerun a source workflow that handed its completed results to this skill.

## Inputs

Identify the report type, evidence paths/task record, relevant revision or time window, and whether the request is to render existing results or refresh them. Infer the type from a clear request; ask only if the choice or missing scope materially changes the report. Reuse the previous view's confirmed scope for a refresh and disclose its new evidence window. Never fabricate missing input.

## Sources and refresh routing

Use skills from the current platform's directory. Preserve their access choices, read-only boundaries, and authorization. Reformatting needs no fresh provider call.

| Type | Evidence source | If evidence needs collecting or refreshing |
| --- | --- | --- |
| `feature` | Task record, acceptance criteria, inspected consumers | `personal-task-intake`; inspect current code without implementing |
| `review` | Findings plus reviewed base/head and diff | `personal-peer-review`; refresh against the specified revision |
| `verification` | Actual test results, level-purpose and platform matrices | `personal-verify-task`, or `personal-ui-validation` for visual checks; never infer test success |
| `sentry` | Sanitized issue summary with project/environment/window | `personal-investigate-sentry`; preserve its MCP/export/API preflight and selected query/window |
| `usage` | Generated report and aggregate monthly CSV/SVG outputs | `personal-token-usage-audit`; use its canonical input and `node scripts/ai/token-usage-audit.mjs --input <canonical-file> --output <private-report-directory>` |
| `context` | Repository audit plus observed platform context | `personal-context-audit`; start with `node scripts/ai/context-audit.mjs --platform <platform> --repository-only`, then obtain available runtime evidence |

## Stable layout contract

Use this section order for every report: **Title and scope → Summary → Main view → Evidence and gaps → Next action**. Include source links, revision/time window, freshness, and exact/estimated/unknown coverage in the title or evidence section. Keep the same layout on refresh unless the human asks to change it.

| Type | Summary | Main view, columns, and default order | Filters |
| --- | --- | --- | --- |
| `feature` | Readiness; open questions; applicable checklist count | Objective and criteria, then impacts and checklist: item, area/consumer, status, evidence. Blockers first, then planned work. Show relationships only when supported by inspected code. | Area, status |
| `review` | Findings by reported severity; reviewed revision | Finding, severity, file/line, user impact, evidence, remediation. Severity highest first, then path/line; preserve the review's severity scale. | Severity, file |
| `verification` | Passed, failed, blocked, not-run counts; applicability | Criterion/scenario, testing level, purpose, platform, status, evidence. Failed and blocked first, then not run, passed, not applicable. Keep N/A reasons visible. | Level, purpose, platform, status |
| `sentry` | Observed issue/event counts and coverage | Issue, environment, release, measured frequency, last seen, evidence/hypothesis, next action. Frequency descending when available, unknown frequency last. Do not invent affected-user counts. | Environment, release, issue |
| `usage` | Reported tokens/cost; task efficiency when available; coverage | Monthly trends, then tool breakdown: period, provider/product, measurement, tokens, cost/currency, tasks, tool calls/failures/fallbacks. Months ascending; tools by measured result tokens or calls descending. | Provider/product, month, measurement |
| `context` | Repository status and runtime verification separately | Category/item, available evidence, loaded/unknown state, measured occupancy, recommendation. Conflicts first, then warnings and unknowns. | Category, evidence source, status |

Render missing sections as a concise gap with its reason rather than silently dropping them. Empty findings are distinct from an unperformed review. Derive counts from displayed source rows; label whether summary counts follow filters or show the entire dataset.

## Formatting and delivery

- Use explicit units and currency; preserve source precision in detail rows, with rounding only in labeled display summaries. Show percentages with numerator/denominator. Do not turn unknowns into zeros or exclude missing coverage silently.
- Use `YYYY-MM` for monthly buckets and an explicit timezone for event timestamps/windows. Do not silently reinterpret source periods in a new timezone. Separate incomplete months from complete-month comparisons.
- Keep exact and estimated measurements distinguishable. Context occupancy is not billing. Tool-result tokens are not additional provider tokens. Task efficiency requires a documented task denominator.
- Use readable status labels and accessible contrast; color supplements text. Filters and expansion inspect evidence, not change test results or approve work.
- In Cursor, use the available native `/canvas` skill/tools and follow their rendering instructions. Do not invent native APIs or install an application renderer. Elsewhere or if unavailable, preserve this layout in Markdown and existing charts and state the fallback.
- Inspect the rendered view and exercise filters when possible. Reconcile totals, row counts, units, statuses, and source references. Report unavailable interaction checks explicitly.
- Return the artifact reference, a compact conclusion, and material gaps. Keep the original report/task record authoritative. Refresh the same view when supported; label old snapshots if replaced. Do not publish, schedule refreshes, or launch teammates merely to display a report.
