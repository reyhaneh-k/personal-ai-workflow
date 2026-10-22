---
name: personal-update-ai-manual
description: Update Personal AI documentation after verified project decisions, recurring mistakes, or workflow changes.
---

# Update the AI manual

## Manual context

Read `docs/ai/manual-routing.md` and `docs/ai/governance.md`, then only the section(s) named in the team's agreed change. For a routing change, inspect affected skills and task mappings too. Preserve verified baseline content; distinguish templates, observed code, and approved guidance. Keep unanswered fields explicit and follow the meeting-first process below.

Read `docs/ai/governance.md`. Default to drafting an AI change proposal using `.gitlab/issue_templates/AI_change_proposal.md`; return the draft in chat unless issue creation is explicitly authorized. Do not change AI policy during ordinary feature work. Before implementing, require the recorded team-meeting outcome and agreed scope. If missing, ask for that record and pause implementation. Use a standalone AI-only MR, never a product MR. No individual is assigned ownership of AI policy; a checkbox cannot establish that a meeting occurred.

1. Identify the evidence prompting the update: an explicit human decision, approved convention, repeated reviewed mistake, or verified repository change.
2. Locate the smallest authoritative document that owns the rule.
3. Check for conflicts and duplication across project rules, platform rules, skills, agents, and checklists.
4. Check the recorded team-meeting agreement covers every proposed AI change; return scope expansions to team discussion before encoding them.
5. Edit the authoritative file under `ai/source/`, or native formatting under `ai/platform-overrides/`. Run `pnpm ai:generate` and `pnpm ai:check`; never hand-edit generated output. See `ai/README.md`.
6. Keep instructions concise, testable, and scoped. Remove obsolete guidance rather than accumulating exceptions.
7. Report the evidence, files changed, and any platform that could not be synchronized.

Do not convert one-off preferences, speculative advice, or unreviewed agent conclusions into permanent policy.
