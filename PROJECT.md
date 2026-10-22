# Project profile

Complete this file before tailoring the shared AI instructions. Keep sensitive information out of it. Agents treat this file as authoritative for product scope and optional capabilities.

## Identity

- Project name:
- Product or repository purpose:
- Primary languages, frameworks, and package manager:
- Human product owner:
- Human engineering and release owner:

## Source control and review

- SCM host: `gitlab` | `github` | `other` (pick one)
- Default target branch:
- Review process (MR/PR expectations):

## Environments and constraints

- Required environments, devices, accessibility, or security constraints:
- Standard verification commands:

## Capability flags

Set each flag to `on` or `off`. When `off`, skills and checklists mark that domain not applicable instead of assuming it exists.

| Flag | on/off | Notes (paths, hosts, or N/A) |
| --- | --- | --- |
| localization | off | e.g. locales path, RTL/LTR, locale codes |
| webview | off | e.g. bridge path, device matrix |
| sentry | off | e.g. org/project names only—no tokens |
| figma | off | e.g. file keys or design-system notes—no tokens |

## Stack snapshot (optional)

Document only verified facts for this copy of the workflow. Prefer `package.json` / lockfile for versions.

- UI framework:
- Bundler / router / state:
- Test runners:
- Notable path roots (routes, components, API, locales):

## Copy-per-repo checklist

1. Copy this workflow into the target repository (or start from this template).
2. Fill this `PROJECT.md`.
3. Soften or extend `ai/source/manual/` for enduring project practices.
4. Run `pnpm ai:generate` (or `node ai/generator/generate.mjs`).
5. Confirm Cursor discovers `AGENTS.md`, `.cursor/skills/`, and `.cursor/agents/`.
6. Disconnect unused MCP servers so their tool schemas do not consume context.

The workflow is intentionally adaptable. Update `ai/source/` to encode enduring practices, then regenerate local platform files. Skill and agent IDs keep the `personal-*` prefix as the workflow brand.
