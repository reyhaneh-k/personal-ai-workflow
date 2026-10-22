---
name: personal-performance-audit
description: Audit an affected Personal frontend flow for measurable performance regressions and optimization opportunities.
---

# Audit performance

## Manual context

For interactive browser execution in Cursor, read `docs/ai/cursor-browser.md` for setup, session/data preflight, evidence, and fallback handling. Use actual available capabilities; native browser checks do not establish cross-browser or Android WebView coverage.

Required sections: `docs/ai/manual-performance.md`, `docs/ai/manual-architecture.md`, `docs/ai/manual-compatibility.md`.

Read these additional sections when their trigger applies:

- request bottlenecks: `docs/ai/manual-api.md`.
- cache behavior: `docs/ai/manual-state.md`.
- assets and layouts: `docs/ai/manual-design.md`.
- production traces: `docs/ai/manual-observability.md`.
- repeatable measurements: `docs/ai/manual-testing.md`.
- release/build comparison: `docs/ai/manual-delivery.md`.

Follow the reading contract in `AGENTS.md`. The required and conditional lists above are authoritative for this skill. Consult `docs/ai/manual-routing.md` only for a mixed task or an impact not covered above. Record selected sections and material gaps in the context manifest; never treat template prompts as approved rules.

Define the route, user flow, platform, build mode, network/device profile, and comparison baseline. Inspect bundle impact, route loading, duplicate requests, cache behavior, render frequency, long tasks, layout shifts, image/font loading, memory retention, and Android webview constraints as applicable.

Prefer measurements from production-like builds over intuition. Report the baseline, measurement method, evidence, user impact, confidence, and smallest remediation direction. Separate confirmed regressions from hypotheses. Do not make broad optimizations or change code unless explicitly requested.
