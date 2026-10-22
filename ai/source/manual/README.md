# Personal AI AI System

This directory is the human-readable control center for AI-assisted frontend work in the this workflow application.

## System map

```text
Human request
    |
    v
Coordinator -> task intake -> questions -> readiness decision
    |
    v
Frontend implementer -> implementation + self-check
    |
    v
Independent reviewer -> findings only
    |
    v
Verification analyst -> tests + platform matrix + reconciliation
    |
    v
Human approval -> optional MR creation link

Sentry monitor -> read-only health checks -> meaningful-change alert -> human decision
```

## Documentation map

| Location | Purpose |
| --- | --- |
| `AGENTS.md` | Shared generated instructions for Codex, Cursor, and Claude |
| `<scope>/AGENTS.md` | Optional generated directory guidance sourced from `ai/source/scoped-instructions/<scope>/instructions.md` |
| `ai/source/` | Editable instructions, skills, roles, and manuals |
| `ai/platform-overrides/` | Platform formatting and Bugbot source |
| `ai/README.md` | Generation, validation, ownership, and recovery |
| `.agents/skills/` | Independent Codex skill copies |
| `.cursor/skills/` | Independent Cursor skill copies |
| `.claude/skills/` | Independent Claude skill copies |
| `.cursor/agents/` | Cursor-native custom teammates |
| `ai/generated/cursor-plugin/` | Ignored, portable Cursor Plugin package built from Personal's canonical sources |
| `.claude/agents/` | Claude-native custom teammates |
| `docs/ai/project-manual.md` | Manual contents, section templates, and preserved technical baseline |
| `docs/ai/manual-routing.md` | Required skill reading and cross-cutting impact triggers |
| `docs/ai/agents.md` | Teammate responsibilities and boundaries |
| `docs/ai/commands.md` | Command catalog and required inputs |
| `docs/ai/cursor-modes.md` | Persistent working methods, Cursor activation, phase handoffs, and context costs |
| `docs/ai/cursor-design-mode.md` | Native visual refinement, implementation/validation routing, and local setup |
| `docs/ai/cursor-browser.md` | Native browser setup, safe sessions, debugging/testing evidence, and coverage fallbacks |
| `docs/ai/cursor-canvas.md` | Interactive task, review, verification, Sentry, usage, and context reports |
| `docs/ai/workflows.md` | Before/after checklist and task lifecycle |
| `docs/ai/governance.md` | Meeting-first proposals and standalone AI-only MRs |
| `docs/ai/integrations.md` | Figma, Sentry, API docs, GitLab, and Context7 strategy |
| `docs/ai/figma-mcp.md` | Figma connection setup preserving developer preferences; authentication and access checks |
| `docs/ai/context7.md` | Context7 activation, capacity checks, lookup policy, and web fallback |
| `docs/ai/platform-setup.md` | Platform-specific installation plan |
| `docs/ai/platform-capabilities.md` | Installed and authenticated capability checklist |
| `docs/ai/token-usage.md` | Privacy-safe monthly token reporting schema and review workflow |
| `docs/ai/token-optimization.md` | Developer practices for reducing context and token waste safely |
| `docs/ai/credentials.md` | Local AI credential profiles, placement, and validation |

Platform directories contain independent physical copies. Do not use symlinks, adapters that import another platform's skill, or cross-platform agent discovery as a dependency. When a shared workflow changes, edit `ai/source/` and run `pnpm ai:generate` and `pnpm ai:check`. This document is generated from `ai/source/manual/`.

Each skill may contain a focused `SKILL.md` plus optional `scripts/`, `references/`, and `assets/` directories. Put executable helpers, on-demand detail, and static resources there rather than inflating the main skill. The generator copies these resources byte-for-byte to every native platform directory and the optional Cursor Plugin package.

## How agents study the project

`personal-project-orientation` is intentionally an empty placeholder for now.

Each active skill names its required manual sections and conditional readings; `docs/ai/manual-routing.md` validates the full mapping and handles mixed or unmapped impacts. Do not load this README or the routing map during ordinary work when the active skill is sufficient. Keep shared `AGENTS.md` mandatory. The new subject sections are templates, not approved conventions; preserve unanswered questions and ask when they materially affect a task. Current requirements, designs, API contracts, code, and Sentry evidence must still be refreshed for affected work.

## Human owners

- Product decision owner: the owner of the feature being implemented.
- Engineering and release owner: the designated engineering owner.
