---
name: personal-accessibility-audit
description: Audit an affected Personal frontend flow for concrete accessibility defects and verification gaps.
---

# Audit accessibility

## Manual context

For interactive browser execution in Cursor, read `docs/ai/cursor-browser.md` for setup, session/data preflight, evidence, and fallback handling. Use actual available capabilities; native browser checks do not establish cross-browser or Android WebView coverage.

Required sections: `docs/ai/manual-accessibility.md`, `docs/ai/manual-design.md`, `docs/ai/manual-compatibility.md`.

Read these additional sections when their trigger applies:

- intended behavior: `docs/ai/manual-product.md`.
- RTL or localized content: `docs/ai/manual-localization.md`.
- test tooling/evidence: `docs/ai/manual-testing.md`.
- shared component consumers: `docs/ai/manual-architecture.md`.

Follow the reading contract in `AGENTS.md`. The required and conditional lists above are authoritative for this skill. Consult `docs/ai/manual-routing.md` only for a mixed task or an impact not covered above. Record selected sections and material gaps in the context manifest; never treat template prompts as approved rules.

Audit only the requested or changed surface. Inspect semantic structure, accessible names, keyboard order, focus visibility and restoration, dialogs, forms, errors, live updates, contrast, zoom/reflow, reduced motion, RTL behavior, and screen-reader semantics as applicable.

Combine automated checks with manual reasoning; automated success is not proof of accessibility. Report findings by severity with location, affected users, reproduction steps, and remediation direction. Distinguish verified failures from tests requiring a human or assistive technology. Do not change code unless fixes are explicitly requested.
