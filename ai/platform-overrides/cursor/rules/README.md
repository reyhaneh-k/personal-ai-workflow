# Cursor Project Rules

This generated directory is reserved for narrowly scoped Cursor project rules. Edit `ai/platform-overrides/cursor/rules/`, then run `pnpm ai:generate`; never edit `.cursor/rules/` directly. Only the source is committed.

`README.md` is documentation only. Cursor does not apply it as a rule because project rules must use the `.mdc` extension and valid Cursor rule frontmatter.

## Current policy

There are no approved Cursor project rules yet. The root `AGENTS.md` remains the only project-wide instruction file for Cursor, Codex, and Claude. Do not create an always-applied Cursor rule that duplicates it.

Add a rule here only after repeated task evidence shows that Cursor needs an instruction that is:

- specific to Cursor;
- relevant to a well-defined file type or code area;
- useful across multiple tasks rather than one workflow;
- too conditional for the always-loaded `AGENTS.md`;
- not already owned by a skill, teammate, manual section, or Bugbot guidance; and
- approved through the AI-change process in `docs/ai/governance.md`.

Good candidates include recurring conventions for route files, test files, localization resources, or another path-specific area. A single mistake or personal preference is not enough evidence for a repository rule.

## Rule types

Choose the narrowest applicable Cursor mode:

| Mode | Use when |
| --- | --- |
| Apply to Specific Files | The instruction applies to known glob patterns. Prefer this for repository conventions. |
| Apply Intelligently | Cursor should select the rule from a precise description when relevance cannot be expressed by file paths. |
| Apply Manually | The rule is optional and should be activated explicitly with `@rule-name`. |
| Always Apply | The instruction truly applies to every Cursor conversation and does not duplicate `AGENTS.md`. This should be rare. |

## Rule shape

Use a descriptive kebab-case filename ending in `.mdc`, for example `route-files.mdc`.

```md
---
description: Personal conventions for implementing and changing route files
globs:
  - "src/routes/**/*.tsx"
alwaysApply: false
---

- Follow the nearest existing route pattern.
- Treat generated route-tree files as generated output.
- Consult `docs/ai/manual-architecture.md` when route boundaries change.
```

Keep each rule focused and concise. Prefer links to repository examples or manual sections over copying large bodies of text. A referenced file is supporting context; do not assume its full content is always loaded.

## What does not belong here

- General project rules already present in `AGENTS.md`.
- Task procedures already implemented as `.cursor/skills/*/SKILL.md`.
- Teammate responsibilities from `.cursor/agents/`.
- Agent Review or Bugbot instructions from `.cursor/BUGBOT.md`.
- Personal preferences, which belong in Cursor User Rules.
- Secrets, tokens, private URLs, production payloads, or developer-specific paths.
- Legacy `.cursorrules` content.

## Adding or changing a rule

1. Bring the recurring problem and examples to the team meeting.
2. Record the agreed scope and expected behavior.
3. Implement the rule under `ai/platform-overrides/cursor/rules/` in a standalone AI-only change and regenerate.
4. Confirm its frontmatter, description, and globs select the intended tasks.
5. Verify it does not duplicate or conflict with `AGENTS.md`, skills, agents, manuals, or `.cursor/BUGBOT.md`.
6. Test one matching task and one non-matching task in Cursor.
7. Record the result in `docs/ai/platform-capabilities.md` when the behavior is verified.

Cursor project-rule reference: <https://cursor.com/docs/rules>
