# Maintaining Personal AI instructions

## Contents

- [Layout](#layout)
- [Edit and regenerate](#edit-and-regenerate)
- [Generated file ownership](#generated-file-ownership)
- [Platform behavior](#platform-behavior)
- [Manual sections and skill routing](#manual-sections-and-skill-routing)
- [Verification and recovery](#verification-and-recovery)

## Layout

| Editable source | Generated destination |
| --- | --- |
| `ai/source/instructions.md` | Root `AGENTS.md` |
| `ai/source/scoped-instructions/<scope>/instructions.md` | `<scope>/AGENTS.md` |
| `ai/source/skills/<name>/SKILL.md` | `.agents/skills/`, `.cursor/skills/`, `.claude/skills/` |
| `ai/source/agents/*.json` | `.cursor/agents/` and `.claude/agents/` |
| `ai/source/manual/*.md` | `docs/ai/*.md` |
| `ai/platform-overrides/*/adapter.json` | Native paths and agent metadata |
| `ai/platform-overrides/cursor/BUGBOT.md` and `bugbot.yaml` | Cursor Bugbot files |
| `ai/platform-overrides/cursor/rules/README.md` and `*.mdc` | `.cursor/rules/` |
| `ai/generator/setup-figma.mjs` (explicit setup, not generation) | Adds a missing Figma connection to local `.cursor/mcp.json` |

All three platforms use `AGENTS.md`; there is no `CLAUDE.md`. Skills and native agent definitions are independent physical copies. Shared documentation is intentionally under `docs/ai/`. Everything stays in this repository.

Nested instructions are optional and scoped by repository directory. For example, `ai/source/scoped-instructions/src/features/orders/instructions.md` generates `src/features/orders/AGENTS.md`. Keep only the additional local guidance in the scoped source. Platforms may differ in hierarchical discovery and precedence, so verify the installed versions before relying on a nested file as an enforcement mechanism.

Only this workflow is in scope. Add Android-native/dashboard profiles when their requirements are approved. The orientation skill intentionally has no workflow body.

## Edit and regenerate

After cloning or pulling AI-source changes, run `node ai/generator/generate.mjs` before starting an AI session. No install hook runs automatically. Generated documentation appears under `docs/ai/`; its tracked source is always available in `ai/source/manual/`.

Add Cursor rules with frontmatter under `ai/platform-overrides/cursor/rules/`, not in the generated directory. This migration adds no active rule.

Ignored files are not available to remote repository services. Local generation of `.cursor/BUGBOT.md` and `.cursor/config/bugbot.yaml` does not configure hosted Bugbot. A separately verified service-side configuration or publishing arrangement is required; CI generation alone does not make these files visible to Bugbot. Do not assume remote Autofix is disabled from the local YAML.

Follow the meeting-first process in `docs/ai/governance.md` before changing AI behavior: discuss as a team, record the outcome, and implement agreed changes in a standalone AI-only MR. These commands do not substitute for that discussion. Server-side enforcement remains unverified.

Requires Node.js 20.12 or later. Generation itself needs no additional dependencies, downloads, credentials, or network access.

1. Edit the source above. Use platform adapters only for native formatting.
2. Preview with `pnpm ai:preview`.
3. Generate all three platforms with `pnpm ai:generate`.
4. Check with `pnpm ai:check`.
5. Review and commit only canonical sources and maintained tooling. Generated outputs and `ai/generated-manifest.json` stay local and ignored. Run `node ai/generator/check-tracking.mjs` to verify the Git index.

Equivalent direct commands:

```sh
node ai/generator/generate.mjs --dry-run
node ai/generator/generate.mjs
node ai/generator/generate.mjs --check
node ai/generator/generate.mjs --restore
node --test ai/generator/generate.test.mjs
```

Generation is deterministic: no timestamps or machine paths. Every generated file identifies its source. The marker follows YAML frontmatter so native discovery still works. `--check` and `--dry-run` never write. Check exits nonzero on drift; preview lists pending changes.

MCP and permission files belong to each developer, not the generator. Generation never creates, overwrites, or deletes them; legacy manifest ownership is released without touching their contents. Extra personal files in all platform folders are preserved. Only obsolete, unchanged generator-owned outputs may be removed. Keep personal files outside generator-owned filenames; collisions are reported, not silently overwritten.

To add Figma in Cursor, run `node ai/generator/setup-figma.mjs` explicitly. It preserves other servers and settings, skips an existing matching endpoint, and refuses conflicting names or unsupported JSON/JSONC without changes. Generation does not run setup or authenticate. See `docs/ai/figma-mcp.md`.

Some pnpm versions automatically check/install application dependencies before running any script. To avoid that for these dependency-free tools, use the direct Node commands above, or `pnpm --config.verify-deps-before-run=false ai:check` (the same option works for the other AI commands). No repository-wide package-manager setting needs to change.

Source skills currently support one `SKILL.md` with single-line name and description metadata. Adding scripts/assets or richer frontmatter requires extending the generator's validation and copying support; unsupported files cause a clear error instead of being silently dropped.

## Generated file ownership

The manifest stores SHA-256 hashes for individual owned files, never entire directories. Personal settings, secrets, unrelated rules, other skills, and files beside a generated nested `AGENTS.md` are not owned.

Generation validates all targets before writing. It refuses existing unowned files and outputs edited since generation. Obsolete outputs are deleted only when their previous hash still matches. No directory is recursively deleted. Linked paths and invalid destinations are rejected.

The ignored local manifest is an ownership ledger, not a source file. Do not delete or hand-edit it to force an update.

## Platform behavior

Persistent working methods are ordinary source skills; Cursor can pin them with **Use as Mode**. See `docs/ai/cursor-modes.md` for selection, activation, and verification. Reuse the existing debug and peer-review skills. No client settings or automatic mode-switching hooks are generated, and other platforms receive the workflows without a promise of persistent modes.

Cursor receives skill files and role prompts with native metadata. Claude also receives preloaded skills and role tool settings. Codex receives skills plus the common role catalog; native Codex subagent configuration is not generated in this version.

Role definitions are authoritative in `ai/source/agents/*.json`. Keep the explanatory agent catalog aligned when changing a role's responsibilities. Claude read-only teammates deny direct Write/Edit tools while inheriting available read, shell, browser, and MCP tools. Bash access is not a technical read-only restriction; role instructions and configured permissions govern its use.

Bugbot Autofix stays disabled. Context7 is recommended per developer but remains a local platform activation; generation does not install or authenticate it. Generation also does not install other plugins, authenticate services, or activate/schedule the Sentry monitor. `scripts/ai/sentry-readonly.mjs` and `scripts/ai/context7-status.mjs` remain maintained utilities rather than generated files.

## Manual sections and skill routing

`ai/source/manual/project-manual.md` indexes the separate `manual-*.md` section templates and preserves the existing baseline. `manual-routing.md` maps tasks to reading requirements. Each active source skill carries its own required/conditional section paths; regenerate to deliver these to all platforms. Keep the map and skills aligned; generator tests verify required mappings and section references. Unknown template content must not be promoted to approved guidance without the meeting-first process.

## Verification and recovery

`pnpm ai:check` checks source structure, role references, known documentation links, paths, the absence of root/platform CLAUDE.md, and output drift. `pnpm ai:test` exercises updates, deletion, conflicts, and repeatability in disposable directories.

For concurrent implementation work, create an isolated Git checkout with `pnpm ai:worktree:add -- <branch>` from the repository root. The checkout is placed beside the repository under `../worktrees/<branch>`. This helper does not remove worktrees or branches; see `docs/ai/workflows.md` for task-record and parallel-editing rules.

If a generated file was edited, preserve the desired change in its source and review its diff. Back up the conflicting output elsewhere, remove only that exact output, and regenerate. Outputs are no longer in Git: do not use Git restore on them. If the manifest is missing but existing outputs retain their generator marker, run `node ai/generator/generate.mjs --restore`; it rebuilds the manifest and refreshes only generator-marked outputs. It refuses unmarked files and never owns personal MCP or permission settings. Never reset the repository or delete whole platform directories; they may contain personal settings.

For source deletion/renaming, preview first. Unmodified obsolete output is removed automatically; edited obsolete output blocks generation. Commit before restructuring so previous versions remain recoverable in Git.

The GitLab validation job rejects tracked AI outputs, generates from source in its checkout, then runs drift checks and generator tests on pipelines allowed by the existing workflow. These checks verify files, not instruction loading or authentication in developers' tools. Complete the checks in `docs/ai/platform-capabilities.md` separately. For Claude, AGENTS.md support depends on client version, session mode, and settings; confirm it in `/context`.
