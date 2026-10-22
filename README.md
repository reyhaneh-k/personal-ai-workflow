# Personal AI Workflow

A private, reusable AI-workflow template for software repositories. It supplies shared instructions, specialist roles, skills, Cursor plugin packaging, and safety checks for Codex, Cursor, and Claude Code.

Start by filling in [PROJECT.md](PROJECT.md). The canonical configuration lives in `ai/source/` and `ai/platform-overrides/`; generated platform files are local-only and must not be edited directly.

Requires Node.js 20.12 or later. No packages are required for generation or verification.

```sh
node ai/generator/generate.mjs
node ai/generator/generate.mjs --check
node --test ai/generator/generate.test.mjs
```

Use `npm run ai:generate`, `pnpm ai:generate`, or the equivalent package-manager command if preferred. See [ai/README.md](ai/README.md) for source layout, validation, recovery, Cursor plugin testing, and worktree guidance.
