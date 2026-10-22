---
name: personal-refactor
description: Refactor an approved area of the Personal frontend while preserving defined behavior and controlling scope.
---

# Refactor Personal frontend code

## Manual context

Required sections: `docs/ai/manual-architecture.md`, `docs/ai/manual-coding.md`, `docs/ai/manual-testing.md`.

Read these additional sections when their trigger applies:

- behavior invariants: `docs/ai/manual-product.md`.
- component contracts: `docs/ai/manual-design.md`.
- operation contracts: `docs/ai/manual-api.md`.
- state ownership: `docs/ai/manual-state.md`.
- trust boundaries: `docs/ai/manual-security.md`.
- text or formatting paths: `docs/ai/manual-localization.md`.
- interaction semantics: `docs/ai/manual-accessibility.md`.
- platform paths: `docs/ai/manual-compatibility.md`.
- bundle or runtime impact: `docs/ai/manual-performance.md`.
- instrumentation paths: `docs/ai/manual-observability.md`.

Follow the reading contract in `AGENTS.md`. The required and conditional lists above are authoritative for this skill. Consult `docs/ai/manual-routing.md` only for a mixed task or an impact not covered above. Record selected sections and material gaps in the context manifest; never treat template prompts as approved rules. Read the relevant task-record, readiness, impact, and completion sections of `docs/ai/workflows.md`.

## Required inputs

- reason and measurable objective;
- allowed file and behavior scope;
- behavior that must remain unchanged;
- verification and rollback strategy.

Before editing, document current behavior, consumers, shared dependencies, tests, generated files, and platform-specific paths. Build the level-purpose matrix from `docs/ai/manual-testing.md`; refactors normally emphasize regression purpose at every affected level and must identify any separately approved new behavior. Refactor in reviewable steps, preserve public contracts unless explicitly approved, and avoid mixing feature work with structural cleanup. Run focused regression checks after each meaningful boundary. Report behavior evidence, the reconciled matrix, structural changes, deviations, and remaining risks.
