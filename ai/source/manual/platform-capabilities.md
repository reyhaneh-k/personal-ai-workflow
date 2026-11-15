# Platform Capability Checklist

Use these statuses: `repository-ready`, `installed`, `authenticated`, `verified`, `planned`, `blocked`, or `not-required`. Never commit tokens or personal machine paths.

## Repository capabilities

Checked items describe maintained source support, not generated-file presence or verified client activation. Generation is opt-in.

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

- [x] Canonical shared rules can render to `AGENTS.md` on explicit request.
- [x] Canonical nested `AGENTS.md` sources can generate directory-scoped instructions without owning neighboring files.
- [ ] Nested `AGENTS.md` discovery and root-to-nearest precedence verified in each installed platform/version before use.
- [x] Canonical source, generator, and validation commands exist under `ai/`.
- [x] Codex skill sources can render independently to `.agents/skills/` on explicit request.
- [x] Cursor uses shared `AGENTS.md`; the redundant core rule is removed.
- [x] Cursor skill sources can render independently to `.cursor/skills/` on explicit request.
- [x] Cursor agent sources can render to `.cursor/agents/` on explicit request.
- [x] Cursor Agent Review setup and task sequence are documented.
- [x] Independent `personal-peer-review` exists separately from Cursor Agent Review and Bugbot.
- [x] Cursor Bugbot review rules exist.
- [x] Bugbot source configuration specifies Autofix disabled; remote configuration/consumption is not verified.
- [x] Claude instruction sources target shared `AGENTS.md`; no CLAUDE.md is generated.
- [x] Claude skill sources can render independently to `.claude/skills/` on explicit request.
- [x] Claude agent sources can render to `.claude/agents/` on explicit request.
- [x] Read-only Sentry utility exists in `scripts/ai/sentry-readonly.mjs`.
- [x] Figma export fallback is documented.
- [x] Figma and Sentry require a human-visible MCP/file/API choice and capacity report.
- [x] SCM MR/PR-link workflow is documented (host from `PROJECT.md`).
- [x] Read-only context audit checks generated hashes, discovery candidates, duplicates, task skill/manual evidence, teammates, and MCP evidence.
- [x] Developer context-efficiency practices are documented; formal monthly reporting is excluded.
- [x] Separate routine/admin AI environment templates and a non-disclosing validator exist.
- [x] Independent unit-test verifier, browser E2E tester, and webview tester roles exist (webview conditional on `PROJECT.md`).
- [x] Testing levels and testing purposes are modeled separately; regression checks are selected at every applicable level.
- [x] The verifier requires a level-purpose matrix and independently executes established unit/integration checks.
- [x] Runtime debugger role and diagnosis-first skill exist for difficult frontend defects.
- [x] Feature delivery, TDD, and UI validation skill sources support all platforms; existing debug and peer-review skills support persistent use. Cursor activation and handoff instructions are documented.
- [x] Native Cursor Design Mode is documented and routed through implementation, Figma, feature-delivery, and UI-validation skills; no extra plugin or simulated mode is generated.
- [x] Context7 activation, capacity-aware lookup, official-web fallback, and verification are documented for all three platforms.
- [ ] Add and approve the first application unit tests; identify the configured runner and current test files from repository evidence.
- [ ] Define and approve application integration-test boundaries, locations, fixtures, mocks, and commands.
- [ ] Verify whether a browser E2E harness exists before proposing one.
- [ ] If `PROJECT.md` enables `webview`: confirm emulator/real-device access and the authoritative native bridge contract.

## Per-developer Codex setup

Use `docs/ai/codex-capabilities.md`; checked source support is distinct from runtime activation.

- [ ] Record Codex version and app/CLI/IDE surface; verify current supported capabilities.
- [ ] Confirm explicit source-only bootstrap or explicitly requested generation; never infer native loading from a source audit.
- [ ] Inspect global/project/override instruction candidates, configured fallback names, working directory, byte limit, and actual loaded paths.
- [ ] Inspect effective config layers, selected profile, managed constraints, and project trust using sanitized client evidence.
- [ ] Verify approval policy, filesystem/network boundaries, and either legacy sandbox settings or permission profiles; do not mix them.
- [ ] Inspect enabled command rules and test their match/non-match cases; `.rules` govern execution, not prose instructions.
- [ ] Verify nested/user skill candidates, symlink scope, effective skill enablement, positive/negative trigger prompts, and any metadata truncation warnings.
- [ ] After requested generation, confirm native agents and skill UI/invocation metadata; verify inherited permissions and user model choices.
- [ ] Inspect configured hooks and their trust/enabled state; verify selected hooks without adding automatic generation or review loops.
- [ ] Verify needed plugins/MCP connections, worktrees, review, memory, and remote/cloud capabilities separately; schedule recurring work only when explicitly requested.

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

These are setup checks, not inherited runtime evidence. Generation is opt-in and native outputs are absent in a source-only checkout. Verify each client locally before claiming discovery or enabled hooks.

- [ ] Verify `/personal-canvas-report` discovery and render a report twice from changed sample evidence; confirm stable section/column order and accurate counts, units, filters, and unknown states.

- [ ] Verify native Canvas and `/canvas` discovery; render a small overview with non-sensitive sample evidence and check source references, filters, and unknown states.
- [ ] Reopen and refresh a saved view from changed evidence; verify stale results are not presented as current. Check sharing availability separately only if needed.
- [ ] Verify Canvas Design Mode/context reports if used; mark native behavior verified only after exercising it in the installed client.

- [ ] Open the repository root in Cursor.
- [ ] After explicitly requested generation, verify native instructions, skills, and agents in the actual client.
- [x] Confirm glob-scoped Cursor rules generate from `ai/platform-overrides/cursor/rules/*.mdc` (`project-profile`, `route-files`, `locales`) without Always Apply duplicates of `AGENTS.md`.
- [ ] Hooks are currently disabled in `.cursor/hooks.json`. If explicitly enabled, verify hook registration in the client and run `pnpm ai:hook:test`; script tests alone do not prove registration.
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

## Activation gate for the Sentry monitor

- [ ] Read-only Sentry token is configured outside the repository.
- [ ] Organization and project slugs are confirmed.
- [ ] Production environment name is confirmed.
- [ ] Lookback window and cadence are approved.
- [ ] Alert threshold and meaningful-change definition are approved.
- [ ] Notification destination and human owner are confirmed.
- [ ] A manual dry run produces redacted output.
- [ ] the designated engineering owner approves continuous monitoring activation.
