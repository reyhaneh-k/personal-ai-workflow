# Platform Capability Checklist

Use these statuses: `repository-ready`, `installed`, `authenticated`, `verified`, `planned`, `blocked`, or `not-required`. Never commit tokens or personal machine paths.

## Repository capabilities

- [x] Generation preserves developer-owned MCP/permission files, including migration from old manifests.
- [x] Explicit additive Cursor Figma MCP setup is available.
- [ ] Figma connection authenticated and approved node access verified in each developer's client.
- [ ] Browser test origins approved for the task; enterprise controls configured and tested where available.

- [x] Native Cursor Browser workflows are routed through relevant testing, implementation, debugging, and audit skills; see `docs/ai/cursor-browser.md`.
- [ ] Cursor Browser availability and action approvals verified in the installed client.
- [ ] Browser smoke checks completed with the actual local app, safe test session, screenshots, console, and separately verified network capture.
- [ ] Required browser/device matrix gaps and enterprise origin restrictions recorded.

- [x] `personal-canvas-report` packages report triggers, required inputs, stable layouts, data-source routing, units, sorting, and refresh rules across native skill copies.

- [x] Cursor Canvas layouts and evidence rules are routed from task/report skills; generation does not activate rendering or publishing.

- [x] Shared rules for all three platforms exist in generated `AGENTS.md`.
- [x] Canonical nested `AGENTS.md` sources can generate directory-scoped instructions without owning neighboring files.
- [ ] Nested `AGENTS.md` discovery and root-to-nearest precedence verified in each installed platform/version before use.
- [x] Canonical source, generator, and validation commands exist under `ai/`.
- [x] Codex skills exist independently in `.agents/skills/`.
- [x] Cursor uses shared `AGENTS.md`; the redundant core rule is removed.
- [x] Cursor skills exist independently in `.cursor/skills/`.
- [x] Cursor agents exist in `.cursor/agents/`.
- [x] Cursor Agent Review setup and task sequence are documented.
- [x] Independent `personal-peer-review` exists separately from Cursor Agent Review and Bugbot.
- [x] Cursor Bugbot review rules exist.
- [x] Generated local Bugbot configuration specifies Autofix disabled; remote configuration/consumption is not verified.
- [x] Claude instructions exist in shared `AGENTS.md`; no CLAUDE.md is generated.
- [x] Claude skills exist independently in `.claude/skills/`.
- [x] Claude agents exist in `.claude/agents/`.
- [x] Read-only Sentry utility exists in `scripts/ai/sentry-readonly.mjs`.
- [x] Figma export fallback is documented.
- [x] Figma and Sentry require a human-visible MCP/file/API choice and capacity report.
- [x] SCM MR/PR-link workflow is documented (host from `PROJECT.md`).
- [x] Read-only context audit checks generated hashes, discovery candidates, duplicates, task skill/manual evidence, teammates, and MCP evidence.
- [x] Privacy-safe monthly token usage schema, chart generator, and audit skill exist.
- [x] Developer token-optimization practices and monthly experiment loop are documented.
- [x] Separate routine/admin AI environment templates and a non-disclosing validator exist.
- [x] Independent unit-test verifier, browser E2E tester, and webview tester roles exist (webview conditional on `PROJECT.md`).
- [x] Testing levels and testing purposes are modeled separately; regression checks are selected at every applicable level.
- [x] The verifier requires a level-purpose matrix and independently executes established unit/integration checks.
- [x] Runtime debugger role and diagnosis-first skill exist for difficult frontend defects.
- [x] Feature delivery, TDD, and UI validation skills are generated for all platforms; existing debug and peer-review skills support persistent use. Cursor activation and handoff instructions are documented.
- [x] Native Cursor Design Mode is documented and routed through implementation, Figma, feature-delivery, and UI-validation skills; no extra plugin or simulated mode is generated.
- [x] Context7 activation, capacity-aware lookup, official-web fallback, and verification are documented for all three platforms.
- [ ] Add and approve the first application unit tests; Vitest is configured but no application test files are currently established.
- [ ] Define and approve application integration-test boundaries, locations, fixtures, mocks, and commands.
- [ ] Decide whether to adopt a committed browser E2E harness; no Playwright or Cypress project setup is currently established.
- [ ] If `PROJECT.md` enables `webview`: confirm emulator/real-device access and the authoritative native bridge contract.

## Per-developer Codex setup

- [ ] Open the repository from the correct local path.
- [ ] Confirm repository skills are discovered.
- [ ] Activate Context7 for Codex and verify a version-matched library lookup.
- [ ] Verify Context7 request capacity through `pnpm ai:context7-status`, the dashboard, response evidence, or a successful targeted lookup.
- [ ] Confirm Figma connector authentication if using it.
- [ ] Confirm whether the installed Figma MCP exposes current remaining usage or only plan/seat identity.
- [ ] Confirm Sentry MCP authentication and allowed read tools if using it.
- [ ] Configure `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, and `SENTRY_PROJECT` locally.
- [ ] Verify browser access for frontend testing.
- [ ] Run the context audit and capture live instruction/skill/tool evidence exposed by Codex.
- [ ] Copy only the required AI environment template; verify the `.local` copy is ignored before adding credentials.

## Per-developer Cursor setup

Evidence notes use statuses from the top of this file. Items marked verified below were confirmed during the Cursor multi-project hardening pass (generate + failClosed hook recovery + Read/Shell). Client UI items remain for each developer to complete in their installed Cursor.

- [ ] Verify `/personal-canvas-report` discovery and render a report twice from changed sample evidence; confirm stable section/column order and accurate counts, units, filters, and unknown states.

- [ ] Verify native Canvas and `/canvas` discovery; render a small overview with non-sensitive sample evidence and check source references, filters, and unknown states.
- [ ] Reopen and refresh a saved view from changed evidence; verify stale results are not presented as current. Check sharing availability separately only if needed.
- [ ] Verify Canvas Design Mode/context reports if used; mark native behavior verified only after exercising it in the installed client.

- [x] Open the repository root in Cursor. (verified: this workspace)
- [x] Confirm `AGENTS.md`, `.cursor/skills`, and `.cursor/agents` are discovered. (verified: `pnpm ai:generate` emits them; agent session loads `AGENTS.md` and skill directory)
- [x] Confirm glob-scoped Cursor rules generate from `ai/platform-overrides/cursor/rules/*.mdc` (`project-profile`, `route-files`, `locales`) without Always Apply duplicates of `AGENTS.md`.
- [x] Confirm sensitive-access hook fails open on empty/malformed stdin and still denies known secret paths (`pnpm ai:hook:test` / `pnpm ai:test`).
- [ ] Follow `docs/ai/cursor-modes.md`: select each of the five working methods from the native skill directory; confirm **Use as Mode** is available and its badge appears. Record installed version and surface if unavailable.
- [ ] Use a harmless planning-only example and a follow-up to verify persistent instructions, then exit the mode and verify the badge is removed. Do not infer a context reset or independent review.
- [ ] Verify whether native Debug Mode can coexist with a pinned skill; otherwise use native Debug Mode with `personal-debug` attached. Record actual behavior rather than assuming compatibility.
- [ ] Enable Cursor Agent Review **Auto-Run on Agent Finish** with Quick as the automatic default.
- [ ] Verify automatic Agent Review on a harmless local test diff; verify `/agent-review` can run manually.
- [ ] Confirm the human-facing Review changes diff remains a manual accept/reject checkpoint.
- [ ] Connect the repository (SCM host from `PROJECT.md`) to Bugbot when using Bugbot.
- [ ] Confirm Bugbot reads `.cursor/BUGBOT.md` and `.cursor/config/bugbot.yaml`.
- [ ] Activate Context7 for Cursor and verify a version-matched library lookup.
- [ ] Verify Context7 request capacity through `pnpm ai:context7-status`, the dashboard, response evidence, or a successful targeted lookup.
- [ ] Configure Sentry environment variables locally (only when `PROJECT.md` enables `sentry`).
- [ ] Confirm Figma and Sentry MCP availability, authentication, and quota visibility if using them (respect `figma` / `sentry` flags).
- [ ] Verify browser and terminal permissions.
- [ ] Follow `docs/ai/cursor-design-mode.md` to open a local test route and verify native Design Mode availability; record client version/surface and whether the intended skill remains active or attached.
- [ ] Exercise a scoped visual refinement, inspect its source diff and rendered result, then return to normal browsing to check interactions. Confirm a findings-only request leaves application files unchanged. Mark unavailable native features as blocked rather than verified.
- [ ] Verify Cursor Debug Mode is available and run one safe local instrumentation/reproduction/cleanup exercise with `personal-debug`.
- [ ] Run the context audit; review identical duplicate skill candidates before relying on skill selection.
- [ ] Inspect the context ring before/after mode activation; use it as occupancy evidence, not billed usage. Compare actual usage and task quality separately when auditing modes.

### Recommended Cursor task loop (token + reliability)

`intake → one mode/skill → implement → Quick Agent Review → /personal-reviewer → verifier`. See `docs/ai/cursor-review.md` and `docs/ai/token-optimization.md`.

## Per-developer Claude Code setup

- [ ] Install Claude Code.
- [ ] Start Claude Code from the repository root.
- [ ] Confirm `AGENTS.md`, `.claude/skills`, and `.claude/agents` are discovered. Inspect `/context`; check the client version, ancestor instructions, and settings if missing.
- [ ] Activate Context7 for Claude Code and verify a version-matched library lookup.
- [ ] Verify Context7 request capacity through `pnpm ai:context7-status`, the dashboard, response evidence, or a successful targeted lookup.
- [ ] Configure Sentry environment variables locally.
- [ ] Confirm Figma and Sentry MCP availability, authentication, and quota visibility if using them.
- [ ] Configure an approved browser tool when browser automation is required.
- [ ] Run the context audit using `/context`, `/agents`, and `/mcp` as live evidence sources.

## Shared external decisions

- [ ] Verify the meeting-record and standalone AI-only MR/PR checks on the SCM host in `PROJECT.md` using `docs/ai/governance.md`; confirm required pipelines and branch protections. Repository checks alone do not establish enforcement.
- [ ] Confirm allowed Figma MCP, REST, and export paths and credential owner (when `figma` is on).
- [ ] Confirm allowed Sentry MCP, REST, and sanitized-export paths (when `sentry` is on).
- [ ] Confirm Sentry organization, project, environments, read-only token owner, and retention rules (when `sentry` is on).
- [ ] Confirm Sentry-monitor cadence and notification destination (when `sentry` is on).
- [ ] Confirm SCM project URL, default target branch, and MR/PR template.
- [ ] Confirm authoritative API documentation location and authentication.
- [ ] If `webview` is on: confirm required real-device and webview test matrix.

## Activation gate for monthly token reporting

- [ ] Confirm which products are measured; keep subscription/workspace and API datasets distinct.
- [ ] Confirm official export or read-only API access for each platform.
- [ ] Confirm private raw-export and generated-report storage outside Git.
- [ ] Confirm credential owner, retention period, report audience, timezone, and month boundary.
- [ ] Define completed-task and quality measures so lower token totals are not mistaken for improvement.
- [ ] Produce and review one manual report before scheduling monthly collection.

## Activation gate for the Sentry monitor

- [ ] Read-only Sentry token is configured outside the repository.
- [ ] Organization and project slugs are confirmed.
- [ ] Production environment name is confirmed.
- [ ] Lookback window and cadence are approved.
- [ ] Alert threshold and meaningful-change definition are approved.
- [ ] Notification destination and human owner are confirmed.
- [ ] A manual dry run produces redacted output.
- [ ] the designated engineering owner approves continuous monitoring activation.
