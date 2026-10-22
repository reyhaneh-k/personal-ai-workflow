---
name: personal-release-health
description: Assess Personal frontend release health from read-only build, deployment, and Sentry evidence.
---

# Assess release health

## Manual context

Required sections: `docs/ai/manual-delivery.md`, `docs/ai/manual-observability.md`.

Read these additional sections when their trigger applies:

- production data: `docs/ai/manual-security.md`.
- platform regressions: `docs/ai/manual-compatibility.md`.
- smoke-test evidence: `docs/ai/manual-testing.md`.
- performance regressions: `docs/ai/manual-performance.md`.
- affected user journeys: `docs/ai/manual-product.md`.
- affected modules: `docs/ai/manual-architecture.md`.

Follow the reading contract in `AGENTS.md`. The required and conditional lists above are authoritative for this skill. Consult `docs/ai/manual-routing.md` only for a mixed task or an impact not covered above. Record selected sections and material gaps in the context manifest; never treat template prompts as approved rules.

Require the release identifier, environment, observation window, deployment evidence, and Sentry access when production errors are in scope.

When Sentry evidence is needed, follow the source-selection and capacity preflight in `docs/ai/integrations.md` before any provider-data request. Communicate the selected MCP/file/API path, capacity status, fallback decision, and source actually used.

Compare the release with its baseline using available build status, deployment status, unresolved/new/regressed issues, event volume, affected routes, browser tags, and webview evidence. Separate facts from inference. Report healthy, degraded, blocked, or unknown with supporting evidence and explicit gaps.

This skill is read-only. It does not deploy, roll back, resolve issues, merge branches, or change release controls. Escalate release decisions to the designated engineering owner.
