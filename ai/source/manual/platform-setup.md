# AI Platform Setup

Before starting an AI session after cloning or pulling AI-source changes, run `node ai/generator/generate.mjs` and `node ai/generator/generate.mjs --check`. Outputs are ignored, not committed. Edit sources under `ai/`; see `ai/README.md` for mappings and recovery.

Remote Bugbot cannot read ignored local configuration. Generated Bugbot files support local availability only until a service-side configuration/publishing arrangement is separately verified. CI generation does not configure the hosted bot.

All platforms use shared `AGENTS.md`. Skills and native agents are generated as independent copies from `ai/source/`. See `ai/README.md`. No platform depends on another platform's skill directory; no CLAUDE.md is generated.

Optional nested instructions are generated from `ai/source/scoped-instructions/<scope>/instructions.md` to `<scope>/AGENTS.md`. They add narrow directory guidance and must remain compatible with the root contract. Verify hierarchical discovery in the installed platform; generated presence alone does not prove the client loaded it.

## Codex

### Repository files

- `AGENTS.md`
- `.agents/skills/<skill>/SKILL.md`

### Planned plugins and connections

| Capability | Method | Requirement |
| --- | --- | --- |
| Current third-party docs | Context7 MCP or plugin | Recommended per developer; see `docs/ai/context7.md` |
| Figma | Authenticated MCP/connector, read-only REST, or supplied export | Per-task human choice and capacity preflight |
| Sentry | Read-only MCP, repository REST utility, or sanitized export | Per-task human choice and capacity preflight |
| GitLab | MR link, later `glab` or REST | No plugin required initially |
| Browser testing | Native Codex browser when available | Per developer/runtime |
| Security audit | Codex Security plugin | Optional later; not a replacement for review |

Codex uses `.agents/skills/` and the common role catalog; Cursor/Claude teammate files are not native Codex agents.

## Cursor

Figma remote MCP setup: `docs/ai/figma-mcp.md`. The optional `node ai/generator/setup-figma.mjs` command adds only a missing connection. Personal MCPs, permissions, and other additional platform files are not generator-owned.

For native browser support, follow `docs/ai/cursor-browser.md`. No external browser MCP installation is required. Verify availability, approvals, session state, console/network evidence, and the local smoke checklist per developer; no browser permissions or enterprise controls are changed by generation.

For multi-turn work, follow `docs/ai/cursor-modes.md`: select feature delivery, TDD, debugging, UI validation, or extended peer review through **Use as Mode** where supported. Generated skills are repository-ready; activation, persistence, and native Debug compatibility must be verified in each developer's installed client. Mode changes do not create independent reviewers.

### Repository files

- `AGENTS.md` (shared core; no duplicated always-on Cursor rule)
- `.cursor/skills/<skill>/SKILL.md`
- `.cursor/agents/<agent>.md`
- `.cursor/BUGBOT.md`
- `.cursor/config/bugbot.yaml`

### Portable Personal plugin

`pnpm ai:generate` also builds an ignored plugin package at `ai/generated/cursor-plugin/`. It contains the generated Personal skills, agents, and approved rules as the `personal-ai-workflow` Cursor Plugin. It deliberately excludes personal settings, MCP connections, credentials, permissions, and Bugbot configuration.

To test it locally, copy that generated directory to `~/.cursor/plugins/local/personal-ai-workflow`, reload Cursor, then confirm its components in **Customize**. Do not symlink the repository directory: Cursor only loads local-plugin symlinks that resolve inside its local-plugin folder. Re-copy the package after an AI-source change. Marketplace or team distribution is a separate reviewed publishing decision; see [Cursor's plugin documentation](https://cursor.com/docs/plugins).

### Planned plugins and connections

| Capability | Method | Requirement |
| --- | --- | --- |
| Local automated review | Cursor Agent Review | Enable Auto-Run on Agent Finish; Quick default; manual Deep for high-risk work |
| Independent peer review | `personal-peer-review` | Run after local Agent Review and human finding triage |
| MR review | Cursor Bugbot for the GitLab repository | Enable repository integration; usage may be billed; Autofix disabled |
| Current third-party docs | Context7 MCP | Recommended per developer; see `docs/ai/context7.md` |
| Figma | Authenticated MCP, read-only REST, or supplied export | Per-task human choice and capacity preflight |
| Sentry | Read-only MCP, repository REST utility, or sanitized export | Per-task human choice and capacity preflight |
| Browser testing | Cursor browser capability or project tooling | Per developer/runtime |
| Runtime debugging | Cursor native Debug Mode with `personal-debug` | Use `/debug` or select Debug before submitting the investigation |
| Visual refinement | Cursor native Design Mode with existing implementation/validation skills | Follow `docs/ai/cursor-design-mode.md`; confirm local client support |
| Interactive reports | Cursor Canvas and its built-in `/canvas` skill | Follow `docs/ai/cursor-canvas.md`; verify rendering locally; sharing is separate |

Follow `docs/ai/cursor-review.md` for the complete sequence. Agent Review, Review changes, `personal-peer-review`, and Bugbot are separate stages. Generated local YAML requests disabled Autofix; verify remote settings independently. Automated findings require human or independent-agent evaluation before fixes are accepted.

For a difficult reproducible defect, start a fresh Cursor Debug Mode context and ask it to use `personal-debug`. Debug Mode supplies Cursor's hypothesis, instrumentation, runtime-log, reproduction, and targeted-fix loop; the Personal skill supplies repository context, evidence rules, privacy constraints, verification, cleanup, and teammate handoff. A custom teammate cannot switch an existing Cursor Agent conversation into Debug Mode by itself.

## Claude Code

### Repository files

- `AGENTS.md` (requires a supported Claude Code version and session)
- `.claude/skills/<skill>/SKILL.md`
- `.claude/agents/<agent>.md`

### Planned plugins and connections

| Capability | Method | Requirement |
| --- | --- | --- |
| Current third-party docs | Context7 MCP | Recommended per developer; see `docs/ai/context7.md` |
| Figma | Authenticated MCP, read-only REST, or supplied export | Per-task human choice and capacity preflight |
| Sentry | Read-only MCP, repository REST utility, or sanitized export | Per-task human choice and capacity preflight |
| GitLab | MR link, later `glab` or REST | No plugin required initially |
| Browser testing | Approved MCP/browser tool or project tooling | Per developer/runtime |

Claude does not load skill or agent definitions from `.agents/` or `.cursor/` as part of the Personal contract.

## Developer onboarding rule

Developers must complete `docs/ai/platform-capabilities.md` locally before relying on an integration. A checked-in configuration file proves repository support, not installation, authentication, authorization, or connectivity on a developer's machine.

Activate Context7 only in the platform or platforms the developer currently uses; installing it everywhere is unnecessary. Follow `docs/ai/context7.md`, keep credentials in platform authentication storage or approved local environment configuration, and verify the connection from a fresh session.

For REST and reporting credentials, copy `.env.ai.example` or the restricted `.env.ai-admin.example` to its `.local` counterpart and follow `docs/ai/credentials.md`. Do not place platform-managed MCP OAuth credentials in these files.

## Context audit

Run `pnpm ai:context-audit -- --platform <codex|cursor|claude> --repository-only` to verify generated hashes and repository discovery candidates without reading or changing personal settings. Use the `personal-context-audit` skill to add live evidence from the target platform, an active task skill, loaded manual sections, and enabled or used MCP integrations. A repository-only result cannot prove what a running editor session loaded.

Cursor officially discovers compatible skill locations in addition to `.cursor/skills/`. Because Personal generates independent copies for each platform, the audit reports these as identical duplicate discovery candidates; it does not remove them or assume they consumed full prompt context.

## Verify instruction discovery

Open a fresh session after changing guidance. Confirm the loaded instructions include the designated engineering owner's ownership and the platform routing from AGENTS.md.

In Claude Code, inspect memory files with `/context`. AGENTS.md discovery depends on installed version, session mode, Project instructions settings, and ancestor CLAUDE.md/CLAUDE.local.md files. Update or configure the client if needed; do not create a CLAUDE.md fallback.

Cursor may discover compatible skill directories too. Confirm the selected skill is the native .cursor copy. Bugbot remains separately configured.

## Official references

- [Codex instruction discovery](https://developers.openai.com/codex/guides/agents-md)
- [Claude Code memory and AGENTS.md](https://code.claude.com/docs/en/memory)
- [Cursor rules](https://cursor.com/docs/rules)
- [Cursor skills](https://cursor.com/docs/skills)
- [Claude Code skills](https://code.claude.com/docs/en/skills)
- [Context7 MCP clients](https://context7.com/docs/resources/all-clients)
