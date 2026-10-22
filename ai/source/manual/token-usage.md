# Token Usage Audit

Use this workflow to compare monthly AI consumption without mixing incompatible provider measures or storing sensitive activity data in the repository.

For the developer practices being measured and improved, read `docs/ai/token-optimization.md`.

## What can be measured

| Product | Preferred evidence | Important limitation |
| --- | --- | --- |
| Codex in a ChatGPT workspace | Workspace Admin Console Usage/Insights export or another workspace-provided report | Token measures, credits, messages, and share metrics are different. Availability depends on workspace permissions and features. |
| OpenAI API | Organization Usage and Costs APIs using an admin key outside the repository | This measures API organization traffic; it is not automatically Codex subscription/workspace usage. Costs are the financial source of truth. |
| Cursor | Team Analytics CSV; Enterprise Admin API usage events when available | Analytics/API availability depends on plan. Request-based usage is not safely convertible to tokens. |
| Claude Code / Anthropic API | Claude `/usage` evidence for a session; Anthropic Console export or Admin Usage API for API traffic | Subscription limits and API usage are different datasets. A session view is not automatically a complete monthly team export. |

Use official exports or read-only APIs. Follow `docs/ai/credentials.md` for the separate admin environment profile. Store credentials and raw exports outside Git. A monthly report should contain aggregates only, unless the team explicitly approves a stricter access-controlled analytics system.

## Canonical input

The report generator accepts JSON or CSV. JSON is either an array of records or:

```json
{
  "schemaVersion": 1,
  "records": []
}
```

Allowed fields:

| Field | Requirement |
| --- | --- |
| `date` | Required `YYYY-MM` or `YYYY-MM-DD`; grouped by calendar month. |
| `platform` | Required: `codex`, `cursor`, or `claude`. |
| `measurement` | Required: `exact` or `estimated`. |
| `source` | Required non-secret label such as `workspace-export` or `admin-api`. |
| `model`, `task_type` | Optional non-personal grouping labels. |
| `tool` | Optional stable tool label such as `figma`, `sentry-api`, `browser`, or `repository-search`; required when a tool metric is present. |
| `uncached_input_tokens` | Input tokens that were not cache reads or cache writes. |
| `cache_read_input_tokens` | Input tokens served from cache. |
| `cache_write_input_tokens` | Input tokens written to cache when the provider reports them separately. |
| `output_tokens` | All output tokens. |
| `reasoning_tokens` | Optional subset of output tokens; never add it to the total again. |
| `requests`, `completed_tasks`, `cost_usd` | Optional non-negative measures. Keep zero only when the value is truly zero, not unavailable. |
| `tool_calls` | Optional number of recorded calls to `tool`. |
| `tool_result_tokens` | Optional tokens returned by `tool` into model context. This is observational context evidence and is never added to total tokens. |
| `tool_failures`, `tool_fallbacks` | Optional recorded failures and switches to a fallback source or access method. |

Omitted numeric values become zero. A record may contain token measurements, tool measurements, or both. Omit an entire provider/month when neither dataset is available rather than creating a zero record. Tool-only evidence does not create token usage. The script rejects unknown columns to reduce accidental ingestion of emails, prompts, session IDs, code, or other personal data.

Total tokens are `uncached input + cache read input + cache write input + output`. Provider accounting semantics can differ; record the source and compare like-for-like months.

## Generate the report

```text
pnpm ai:token-audit -- --input C:\private\usage.json --output C:\private\personal-ai-report
```

The output contains:

- `token-usage-report.md`: monthly table, interpretation limits, and improvement signals.
- `monthly-token-usage.svg`: platform-stacked token totals.
- `monthly-token-efficiency.svg`: tokens per completed task when task counts exist.
- `monthly-tool-usage.svg`: tool-result context tokens by tool, or call counts when result-token evidence is unavailable.
- `monthly-token-usage.csv`: normalized monthly/platform aggregates.
- `monthly-tool-usage.csv`: monthly tool calls, returned context, failures, fallbacks, and tokens attributed to single-tool records.

## Monthly review

Compare complete calendar months and keep source coverage stable. Review:

- total and uncached input tokens;
- cache-read share;
- output tokens and reasoning share when available;
- tokens and cost per completed task;
- task mix, retries, defects, review findings, and cycle time;
- exact versus estimated coverage.
- calls and returned context by tool, including failures and fallbacks;

Turn findings into a small experiment, such as narrowing manual sections, removing duplicated context, batching file reads, shortening routine output, stabilizing cacheable instructions, or choosing a cheaper model for bounded work. Tool usage is audited rather than capped: do not introduce a hard call or output budget solely from this report. Investigate high-cost or unreliable patterns and compare any change against quality and throughput, not token totals alone.

Do not schedule collection until the source, read-only credential owner, private storage destination, retention, timezone, and report audience are confirmed.
