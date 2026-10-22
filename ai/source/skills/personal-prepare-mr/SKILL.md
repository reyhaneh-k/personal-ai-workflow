---
name: personal-prepare-mr
description: Prepare Personal GitLab merge-request content and a human-opened creation link without submitting, approving, or merging the MR.
---

# Prepare a Personal merge request

## Manual context

Required sections: `docs/ai/manual-delivery.md`.

Read these additional sections when their trigger applies:

- missing verification evidence: `docs/ai/manual-testing.md`.
- missing platform matrix: `docs/ai/manual-compatibility.md`.
- unclear intent: `docs/ai/manual-product.md`.
- monitoring or production risk: `docs/ai/manual-observability.md`.

Follow the reading contract in `AGENTS.md`. The required and conditional lists above are authoritative for this skill. Consult `docs/ai/manual-routing.md` only for a mixed task or an impact not covered above. Record selected sections and material gaps in the context manifest; never treat template prompts as approved rules.

This workflow does not create an MR. It prepares a link for a human to open and submit.

## Required inputs

- GitLab project URL;
- source branch;
- target branch;
- task title or reference;
- final change summary;
- checks and testing status.

If the project URL, target branch, or installed GitLab URL behavior is unknown, ask for it or validate it without submitting anything.

## Workflow

1. Confirm the branch and working-tree state.
2. Draft a concise title and structured Markdown description.
3. Include purpose, implementation summary, verification, platform testing, risks, screenshots/design references, and checklist.
4. URL-encode the supported new-MR query parameters for the project's GitLab version.
5. Return the link and the complete unencoded content for human review.

Never push, submit, approve, merge, enable auto-merge, or deploy through this skill.
