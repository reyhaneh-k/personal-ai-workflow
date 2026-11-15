# Teammates

Use these roles for isolated phases that need fresh context or independent evidence. Skill and agent IDs keep the `personal-*` prefix as the workflow brand; product scope comes from `PROJECT.md`. Recommend at most one next teammate; never auto-launch it.

## Role catalog

Role JSON files under `ai/source/agents/` are authoritative for responsibilities and boundaries. In a source-only checkout read them directly. The catalog is derived from their metadata when rendering; edit the JSON rather than maintaining a second role list.

<!-- TEAMMATE_TABLE -->

## Cursor built-ins

Generated Cursor agent files may list native `/` capabilities for that role. These are human-gated helpers, not automatic launches. Current mappings live in `ai/platform-overrides/cursor/agent-builtins.json` and are copied into each agent body at generate time:

<!-- CURSOR_BUILTINS_TABLE -->

Built-in Explore and Browser subagents may be used for reconnaissance and browser interaction without replacing the project roles above.

## Platform notes

| Platform | How teammates appear |
| --- | --- |
| Cursor | `.cursor/agents/` custom subagents; invoke with `/personal-<role>` or by name |
| Claude Code | `.claude/agents/` |
| Codex | `.codex/agents/*.toml` after explicitly requested generation; inherit parent permissions |

For Codex activation, discovery, and delegation see `docs/ai/codex-capabilities.md`.

See `docs/ai/cursor-modes.md` for persistent modes and `docs/ai/cursor-review.md` for the review sequence after implementation.
