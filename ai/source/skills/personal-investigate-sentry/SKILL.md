---
name: personal-investigate-sentry
description: Investigate Personal production issues through read-only Sentry API evidence without mutating issues or exposing user data.
---

# Investigate Sentry

## Manual context

When presenting results in a Canvas, use the current platform's `personal-canvas-report` skill for the stable layout and formatting contract. Pass completed evidence to it; do not repeat this workflow solely for rendering.

Required sections: `docs/ai/manual-observability.md`, `docs/ai/manual-security.md`.

Read these additional sections when their trigger applies:

- tracing stack locations: `docs/ai/manual-architecture.md`.
- assessing user impact: `docs/ai/manual-product.md`.
- network errors: `docs/ai/manual-api.md`.
- stale state: `docs/ai/manual-state.md`.
- platform clusters: `docs/ai/manual-compatibility.md`.
- slowdowns or memory issues: `docs/ai/manual-performance.md`.
- release correlation: `docs/ai/manual-delivery.md`.

Follow the reading contract in `AGENTS.md`. The required and conditional lists above are authoritative for this skill. Consult `docs/ai/manual-routing.md` only for a mixed task or an impact not covered above. Record selected sections and material gaps in the context manifest; never treat template prompts as approved rules.

## Required configuration

- `SENTRY_AUTH_TOKEN` with read-only project, event, and organization scopes;
- `SENTRY_ORG` and `SENTRY_PROJECT`;
- environment and time range, defaulting to `prod` and `24h` only when appropriate.

Never ask for a token in chat. Ask the developer to set it locally.

## Integration preflight

Read `docs/ai/integrations.md`. Before accessing Sentry data, show the human-visible preflight and ask whether to use a read-only Sentry MCP, supplied sanitized files, or the repository REST utility unless the task already selects one. Estimate the MCP calls needed and report capacity as sufficient, insufficient, or unknown with its basis. Do not describe MCP capacity as checked when the client hides quota metadata, and do not call a data-reading MCP tool before the choice.

If MCP is selected, use read tools only and retrieve a compact issue list before selected event details. If MCP is unavailable, has insufficient capacity, or is rate-limited, stop MCP requests, tell the developer, and use only the fallback they approved. The REST utility reports endpoint-specific rate-limit headers; those do not establish MCP capacity. Report the source actually used and any missing evidence.

## Workflow

1. Verify only the credentials required by the selected access path, without printing them.
2. Use the selected read-only MCP, sanitized files, or `node scripts/ai/sentry-readonly.mjs`; never mix sources silently.
3. Collect the minimum issue and event evidence needed for the investigation.
4. Redact emails, IP addresses, identifiers, request bodies, and other personal data from reports.
5. Correlate stack location, release, environment, frequency, first/last seen, browser, and affected route with repository code.
6. Separate confirmed evidence, likely hypotheses, missing evidence, and recommended next actions.
7. For a proposed fix, run normal task intake before changing code.

Never resolve, assign, delete, comment on, or otherwise mutate a Sentry issue. Never save raw production payloads in the repository.

For a substantial Cursor investigation, use the Sentry Canvas layout in `docs/ai/cursor-canvas.md` when useful or requested. Render sanitized evidence already retrieved through the approved path; a saved view is not live monitoring.
