---
name: personal-performance-audit
description: Audit an affected Personal frontend flow for measurable performance regressions and optimization opportunities.
---

# Audit performance

## Manual context

Required sections: `docs/ai/manual-performance.md`, `docs/ai/manual-architecture.md`, `docs/ai/manual-compatibility.md`.

Read these additional sections when their trigger applies:

- request bottlenecks: `docs/ai/manual-api.md`.
- cache behavior: `docs/ai/manual-state.md`.
- assets and layouts: `docs/ai/manual-design.md`.
- production traces: `docs/ai/manual-observability.md`.
- repeatable measurements: `docs/ai/manual-testing.md`.
- release/build comparison: `docs/ai/manual-delivery.md`.

Follow the shared reading contract in `AGENTS.md`.

Define the route, user flow, platform, build mode, network/device profile, and comparison baseline. Inspect bundle impact, route loading, duplicate requests, cache behavior, render frequency, long tasks, layout shifts, image/font loading, memory retention, and webview constraints when `PROJECT.md` enables `webview`.

Prefer measurements from production-like builds over intuition. Report the baseline, measurement method, evidence, user impact, confidence, and smallest remediation direction. Separate confirmed regressions from hypotheses. Do not make broad optimizations or change code unless explicitly requested.
