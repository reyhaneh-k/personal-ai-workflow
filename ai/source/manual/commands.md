# AI Command Catalog

For interactive Cursor checks, use `@browser` with the existing Personal skill; see [Cursor Browser](cursor-browser.md). Example: "Use personal-test-e2e with @browser to verify this journey on the supplied local URL, using the agreed test account and acceptance criteria; report console/network findings and untested platforms." Supply the real URL, journey, criteria, safe data/state, and required matrix. For visual checks choose `personal-ui-validation`; for runtime defects use `personal-debug` in native Debug Mode. This does not add a custom browser slash command.

Workflows are generated from `ai/source/skills/` as independent copies under `.agents/skills/`, `.cursor/skills/`, and `.claude/skills/`. Run `pnpm ai:generate` after editing source.

Slash notation below names workflows. Use the tool's native skill invocation or picker (for example `$personal-fix-bug` in Codex). A skill definition is not a scheduled job.

For sustained work, use [Personal working modes](cursor-modes.md). Cursor can pin a skill with **Use as Mode**; the same workflows remain ordinary skills on other platforms. Reuse `personal-debug` and `personal-peer-review` for extended sessions rather than creating duplicate mode aliases.

For visual feedback on the running app, use native [Cursor Design Mode](cursor-design-mode.md) with the existing implementation, Figma, or UI-validation skill. It has no additional Personal slash command; a visual selection supplies task evidence without replacing the selected workflow.

| Command | Purpose | Minimum inputs | Manual reading |
| --- | --- | --- | --- |
| `/personal-canvas-report` | Create/refresh a consistent interactive report | Report type or clear intent, task record/report evidence, revision/window; refresh intent | `docs/ai/cursor-canvas.md`; source skill readings only if fresh analysis is required |
| `/canvas` (Cursor built-in) | Present a substantial Personal result interactively | Relevant task workflow and its record/report evidence | `docs/ai/cursor-canvas.md` and native rendering instructions |
| `/personal-project-orientation` | Reserved placeholder; no workflow yet | None | Reserved; no reading workflow |
| `/personal-context-audit` | Verify repository AI files and collect platform evidence about loaded context | Platform; optional active skill and runtime evidence | Platform setup, capability checklist, and `docs/ai/token-optimization.md`; no product-manual reading |
| `/personal-token-usage-audit` | Generate monthly token charts and evidence-based efficiency suggestions | Canonical private usage export and output directory | `docs/ai/token-usage.md` and `docs/ai/token-optimization.md`; no product-manual reading |
| `/personal-task-intake` | Establish context, questions, impact, and readiness | Objective, type, acceptance criteria or product reference | Required + triggered sections in the skill; [map](manual-routing.md) |
| `/personal-feature-delivery` | Maintain feature delivery across multiple turns | Outcome, criteria, feature owner, relevant sources; resolve intake gaps before edits | Mode sections plus selected implementation skill routing |
| `/personal-tdd` | Implement with a persistent red-green-refactor cycle | Testable criteria, scope, applicable implementation skill, runnable test setup | Coding/testing plus selected implementation skill routing |
| `/personal-ui-validation` | Validate UI across states and target platforms | Journey, criteria, approved visual source, runnable environment, browser/device access | Design, testing, compatibility, accessibility, localization plus triggered sections |
| `/personal-implement-task` | Implement approved ordinary frontend work | Ready intake and approved checklist | Required + triggered sections in the skill; [map](manual-routing.md) |
| `/personal-implement-figma` | Implement an approved design | Figma node/export, states, breakpoints, acceptance criteria | Required + triggered sections in the skill; [map](manual-routing.md) |
| `/personal-integrate-api` | Integrate a documented API operation | Contract, schemas, auth, errors, cache behavior | Required + triggered sections in the skill; [map](manual-routing.md) |
| `/personal-debug` | Investigate a difficult defect using runtime evidence and apply a targeted fix | Expected/actual behavior, exact reproduction, environment, evidence and safe test data | Required + triggered sections in the skill; [map](manual-routing.md) |
| `/personal-fix-bug` | Diagnose and fix a reproducible defect | Expected/actual behavior, reproduction, environment, evidence | Required + triggered sections in the skill; [map](manual-routing.md) |
| `/personal-refactor` | Refactor while preserving behavior | Objective, allowed scope, invariants, verification plan | Required + triggered sections in the skill; [map](manual-routing.md) |
| `/personal-peer-review` | Independently peer-review an MR or local diff without changing it | MR/diff, target branch, requirement, review scope, prior automated findings when available | Required + triggered sections in the skill; [map](manual-routing.md) |
| `/personal-verify-task` | Reconcile work and create the test matrix | Original checklist and final diff | Required + triggered sections in the skill; [map](manual-routing.md) |
| `/personal-test-e2e` | Independently exercise affected browser journeys | Acceptance criteria, runnable environment, journey, browser and user/data states | Required + triggered sections in the skill; [map](manual-routing.md) |
| `/personal-test-webview` | Independently verify Android webview and native bridge behavior | Acceptance criteria, bridge contract, Android build/device matrix, frontend environment | Required + triggered sections in the skill; [map](manual-routing.md) |
| `/personal-prepare-mr` | Prepare MR content and GitLab creation link | Source/target branch, title, summary, checks | Required + triggered sections in the skill; [map](manual-routing.md) |
| `/personal-investigate-sentry` | Investigate production evidence read-only | Issue/query, org, project, environment, time range | Required + triggered sections in the skill; [map](manual-routing.md) |
| `/personal-release-health` | Assess a release from build/deployment/Sentry evidence | Release, environment, window, baseline | Required + triggered sections in the skill; [map](manual-routing.md) |
| `/personal-accessibility-audit` | Audit an affected flow for accessibility defects | Route/component, states, target platforms | Required + triggered sections in the skill; [map](manual-routing.md) |
| `/personal-performance-audit` | Audit measurable performance behavior | Route/flow, build mode, profile, baseline | Required + triggered sections in the skill; [map](manual-routing.md) |
| `/personal-update-ai-manual` | Reconcile verified decisions into AI documentation | Evidence, recorded team-meeting agreement, affected platforms | Required + triggered sections in the skill; [map](manual-routing.md) |

Every implementation command begins with readiness and impact checks and ends with checklist reconciliation and platform testing. Missing product, design, API, permission, or release decisions must be queried rather than guessed.
