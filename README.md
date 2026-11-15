# Personal AI Workflow

A private, reusable AI-workflow template for software repositories. It supplies shared instructions, specialist roles, skills, Cursor plugin packaging, and safety checks for Codex, Cursor, and Claude Code.

Generation is opt-in. Keep this checkout source-only unless a human explicitly requests generated platform files. Agents must not regenerate files automatically after inspection, source edits, installation, or worktree creation. The commands below are available for deliberate manual use.

Start by filling in [PROJECT.md](PROJECT.md). The canonical configuration lives in `ai/source/` and `ai/platform-overrides/`; generated platform files are local-only and must not be edited directly.

Requires Node.js 20.12 or later. No packages are required for generation or verification.

```sh
node ai/generator/generate.mjs
node ai/generator/generate.mjs --check
node --test ai/generator/generate.test.mjs
```

Use `npm run ai:generate`, `pnpm ai:generate`, or the equivalent package-manager command if preferred. See [ai/README.md](ai/README.md) for source layout, validation, recovery, Cursor plugin testing, and worktree guidance.

Cursor's repository-level local-agent policy is documented in [CURSOR_SANDBOXING.md](CURSOR_SANDBOXING.md).

Cursor subagent model tiers are defined in `ai/platform-overrides/cursor/adapter.json`: standard Composer 2.5 for complex reasoning roles and the faster Composer 2.5 default for bounded verification and monitoring work.

## Copy into another repository

1. Copy this workflow into the target repository (or start from this template).
2. Fill in [PROJECT.md](PROJECT.md) (identity, SCM host, verification commands, and capability flags).
3. Run `pnpm ai:generate` (or `node ai/generator/generate.mjs`).
4. Confirm Cursor discovers `AGENTS.md`, `.cursor/skills/`, and `.cursor/agents/`.
5. Disconnect unused MCP servers so their tool schemas do not consume context.

Optional domains (localization, webview, sentry, figma) stay off until their `PROJECT.md` flags are on. Skill and agent IDs keep the `personal-*` prefix. A portable Cursor plugin package is optional; copy-per-repo is the primary path.
