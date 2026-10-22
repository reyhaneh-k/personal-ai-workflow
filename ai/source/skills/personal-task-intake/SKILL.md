---
name: personal-task-intake
description: Prepare a this workflow frontend task by gathering authoritative context, exposing missing inputs, mapping impact, and deciding readiness before implementation.
---

# Personal task intake

## Manual context

When presenting results in a Canvas, use the current platform's `personal-canvas-report` skill for the stable layout and formatting contract. Pass completed evidence to it; do not repeat this workflow solely for rendering.

Required sections: `docs/ai/manual-product.md`, `docs/ai/manual-architecture.md`.

Read these additional sections when their trigger applies:

- visual requirements: `docs/ai/manual-design.md`.
- network contracts: `docs/ai/manual-api.md`.
- data ownership: `docs/ai/manual-state.md`.
- identity or sensitive data: `docs/ai/manual-security.md`.
- platform constraints: `docs/ai/manual-compatibility.md`.
- acceptance and verification expectations: `docs/ai/manual-testing.md`.

Follow the reading contract in `AGENTS.md`. The required and conditional lists above are authoritative for this skill. Consult `docs/ai/manual-routing.md` only for a mixed task or an impact not covered above. Record selected sections and material gaps in the context manifest; never treat template prompts as approved rules.

Read the relevant sections of `docs/ai/workflows.md` for intake and impact checks.

## Inputs

Require an objective and enough evidence to identify the task type. Gather the task-type inputs listed in `docs/ai/commands.md`.

## Workflow

1. Classify the task and name the human feature owner.
2. Start the context manifest and identify product, design, API, code, production, manual, integration, and tool sources that apply; record irrelevant sources as explicit exclusions only when that distinction is useful.
3. Inspect relevant existing code and repository patterns.
4. Separate verified facts, explicit human decisions, and missing information.
5. Ask focused questions for missing information that could materially change behavior or scope.
6. Complete the context manifest, context-readiness checklist, and change-impact checklist without copying full source bodies into the record.
7. Return `ready` only when no material unknown remains. Otherwise return `blocked` with the exact questions required.

Do not implement code as part of intake.

## Output

Use the task record format in `docs/ai/workflows.md`. Include the sources consulted and the reasons for any not-applicable checklist items.

For a substantial Cursor intake, present linked impacts and readiness as the feature-overview Canvas in `docs/ai/cursor-canvas.md` when useful or requested. Preserve the task record; a visual checklist is not implementation approval.
