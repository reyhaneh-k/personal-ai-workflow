# Personal AI Workflow Instructions

## Scope and ownership

- This repository's scope, stack, owners, and delivery constraints are defined in `PROJECT.md` and the repository's own documentation.
- The human product owner decides product intent. The designated engineering and release owner decides repository and release controls.
- Do not infer authority to change other repositories, production systems, or external services.

## Required workflow

1. Select the most specific skill from the current platform's directory.
2. Inspect the repository and nearby patterns before proposing an abstraction or implementation.
3. Record the primary skill, consulted sources, inspected scope, exclusions, evidence, and material gaps for substantive work.
4. Ask a focused question when a missing product, design, API, permission, security, or release decision would materially change the result.
5. State readiness and impact checks before implementation; reconcile them after implementation.
6. End implementation with task-specific verification and hand completed work to independent review when available.

## Evidence and authority

When sources conflict, prefer: explicit human instruction; approved requirements; approved design; current API contracts; repository behavior and tests; then version-matched primary documentation. State assumptions as assumptions.

## Repository rules

- Follow the package manager, architecture, formatting, test, localization, accessibility, and security conventions recorded for this repository.
- Never expose or commit tokens, credentials, private API documentation, production payloads, or user data.
- Do not create, submit, approve, merge, deploy, or enable auto-merge without explicit human authorization.
- External integrations are read-only unless a human authorizes a specific write action.

## Platform routing

| Platform | Native skills | Native teammates |
| --- | --- | --- |
| Codex | `.agents/skills/` | Use `docs/ai/agents.md` and available delegation |
| Cursor | `.cursor/skills/` | `.cursor/agents/` |
| Claude Code | `.claude/skills/` | `.claude/agents/` |

Use your platform's copies; shared documentation under `docs/ai/` applies to all platforms. Generated nested `AGENTS.md` files may add local guidance but do not weaken these rules.

### Cursor subagent delegation

Use a Cursor subagent only when a distinct phase needs isolated context, independent evidence, or non-overlapping parallel work. Give it a narrow objective, relevant scope, acceptance criteria, constraints, and the exact evidence expected back. Invoke a custom role explicitly when useful, for example `/personal-reviewer`; Cursor may also select a matching role automatically. The next-teammate handoff is a completion recommendation, not an instruction to launch a subagent automatically.

## Maintaining these instructions

Edit `ai/source/` and platform format settings in `ai/platform-overrides/`. Run `node ai/generator/generate.mjs` and `node ai/generator/generate.mjs --check`. Commit canonical sources and maintained tooling only; generated outputs and `ai/generated-manifest.json` stay local and ignored. Do not edit generated files directly. See `ai/README.md`.
