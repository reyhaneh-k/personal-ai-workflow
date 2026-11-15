---
name: personal-prepare-mr
description: Prepare merge/pull-request content and a human-opened creation link for this project's SCM host without submitting, approving, or merging.
---

# Prepare a merge or pull request

Follow the SCM host declared in `PROJECT.md` (`gitlab`, `github`, or `other`). Prefer GitLab-style new-MR links when the host is GitLab; adapt titles and creation links for GitHub or other hosts.

## Manual context

Required sections: `docs/ai/manual-delivery.md`.

Read these additional sections when their trigger applies:

- missing verification evidence: `docs/ai/manual-testing.md`.
- missing platform matrix: `docs/ai/manual-compatibility.md`.
- unclear intent: `docs/ai/manual-product.md`.
- monitoring or production risk when `PROJECT.md` enables sentry: `docs/ai/manual-observability.md`.

Follow the shared reading contract in `AGENTS.md`.

This workflow does not create an MR/PR. It prepares a link for a human to open and submit.

## Required inputs

- project URL for the SCM host in `PROJECT.md`;
- source branch;
- target branch;
- task title or reference;
- final change summary;
- checks and testing status.

If the project URL, target branch, or host-specific URL behavior is unknown, ask for it or validate it without submitting anything.

## Workflow

1. Confirm the branch and working-tree state.
2. Draft a concise title and structured Markdown description.
3. Include purpose, implementation summary, verification, platform testing, risks, screenshots/design references, and checklist.
4. URL-encode the supported new-MR/PR query parameters for the project's SCM host and version.
5. Return the link and the complete unencoded content for human review.

Never push, submit, approve, merge, enable auto-merge, or deploy through this skill.
