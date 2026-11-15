---
name: personal-context-audit
description: Audit which Personal AI instructions, skills, teammates, manual sections, and integrations are available to a Codex, Cursor, or Claude task.
---

# Audit task context

## Manual context

Required sections: `docs/ai/platform-setup.md`, `docs/ai/platform-capabilities.md`, `docs/ai/token-optimization.md`.

For Codex, also read `docs/ai/codex-capabilities.md` for scoped discovery and sanitized runtime evidence.

This repository-AI setup check needs no product-manual sections. Source-only is a valid repository state, not proof of native discovery.

Use this before a high-impact task, after regenerating AI files, or when a platform appears to ignore or duplicate instructions.

1. Ask which platform is being audited and identify the active task skill, if any.
2. Run `node scripts/ai/context-audit.mjs --platform <platform> --repository-only` first. Do not edit settings or remove duplicates.
3. Collect live evidence from the platform:
   - Cursor: inspect Customize > Skills and the current context view. Cursor can discover its native skill location plus compatibility locations, so report same-name candidates explicitly. See `docs/ai/platform-setup.md` for the concrete locations.
   - Claude Code: inspect `/context`, `/agents`, and `/mcp`.
   - Codex: use the current session's displayed instructions, available skills, connected tools, and sanitized configuration evidence. Pass `--working-directory` for scoped discovery; user-scope files require `--include-user` and external linked skills require explicit read scope. If the client does not expose a fact, record it as unknown.
4. Put observed facts in a temporary JSON file outside tracked project files. Include `evidenceSource` and only claims the platform actually exposed. The optional `codex` object is defined in `docs/ai/codex-capabilities.md`; it records sanitized effective settings and loaded instruction paths. Other supported fields are `agentsLoaded`, `agentsHash`, `discoveredSkills`, `activeSkill`, `manualSections`, `enabledMcp`, `usedMcp`, `contextSources`, and `usedContextSources`.
5. Run the task audit with `--runtime <file>`, `--active-skill <name>`, and one `--manual <path>` per section already loaded. Never claim loaded context from model recollection alone.
6. Report `healthy`, `warning`, or `invalid`, distinguish identical duplicates from conflicting copies, and explain unknowns. Recommend corrections, but do not apply platform configuration changes without an explicit request.

Use `node scripts/ai/context-audit.mjs --all --repository-only --format json` for deterministic repository validation across all three platforms.

If a substantial Cursor audit benefits from a visual report, additionally read `docs/ai/cursor-canvas.md` and use its context-audit view or the client's native context report when available. Separate observed runtime loading from repository discovery and context occupancy from monthly billing.
