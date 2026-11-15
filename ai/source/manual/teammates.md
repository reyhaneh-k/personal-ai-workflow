# Teammates

Use these roles for isolated phases that need fresh context or independent evidence. Skill and agent IDs keep the `personal-*` prefix as the workflow brand; product scope comes from `PROJECT.md`. Recommend at most one next teammate; never auto-launch it.

## Role catalog

| Role | Mode | Primary skills | Typical next teammates |
| --- | --- | --- | --- |
| `personal-coordinator` | Read-only | `personal-task-intake` | `personal-frontend-implementer`, `personal-debugger` |
| `personal-frontend-implementer` | Write | `personal-implement-task` (and related implement skills when selected) | `personal-reviewer` |
| `personal-debugger` | Write (targeted fix only) | `personal-debug` | `personal-reviewer` |
| `personal-reviewer` | Read-only | `personal-peer-review` | `personal-frontend-implementer`, `personal-test-verifier` |
| `personal-test-verifier` | Read-only | `personal-verify-task` | `personal-frontend-implementer`, `personal-e2e-tester`, `personal-webview-tester` |
| `personal-e2e-tester` | Read-only | `personal-test-e2e` | `personal-frontend-implementer`, `personal-webview-tester` |
| `personal-webview-tester` | Read-only | `personal-test-webview` | `personal-frontend-implementer` |
| `personal-sentry-monitor` | Read-only | `personal-investigate-sentry`, related monitor skills | `personal-coordinator` |

### Boundaries

- Coordinator prepares readiness and impact; it does not implement.
- Implementer and debugger change code only within approved scope.
- Reviewer, verifiers, E2E, webview, and Sentry roles do not edit product code unless a human explicitly requests fixes.
- `personal-webview-tester` and webview skills apply only when `PROJECT.md` enables webview.
- `personal-sentry-monitor` and Sentry skills apply only when `PROJECT.md` enables Sentry.
- SCM-specific MR preparation follows the host declared in `PROJECT.md` (GitLab, GitHub, or other).

## Cursor built-ins

Generated Cursor agent files may list native `/` capabilities for that role. These are human-gated helpers, not automatic launches. Current mappings live in `ai/platform-overrides/cursor/agent-builtins.json` and are copied into each agent body at generate time:

| Agent | Cursor built-ins |
| --- | --- |
| `personal-coordinator` | `/create-subagent`, `/migrate-to-skills`, `/split-to-prs` |
| `personal-debugger` | `/cursor-blame`, `/shell` |
| `personal-e2e-tester` | `/shell`, `/canvas` |
| `personal-frontend-implementer` | `/shell`, `/sdk`, `/autopilot` |
| `personal-reviewer` | `/review`, `/review-bugbot`, `/review-security` |
| `personal-sentry-monitor` | `/automate`, `/loop`, `/canvas` |
| `personal-test-verifier` | `/shell`, `/canvas` |
| `personal-webview-tester` | `/shell`, `/canvas` |

Built-in Explore and Browser subagents may be used for reconnaissance and browser interaction without replacing the project roles above.

## Platform notes

| Platform | How teammates appear |
| --- | --- |
| Cursor | `.cursor/agents/` custom subagents; invoke with `/personal-<role>` or by name |
| Claude Code | `.claude/agents/` |
| Codex | No native agents directory; use this catalog plus available delegation |

See `docs/ai/cursor-modes.md` for persistent modes and `docs/ai/cursor-review.md` for the review sequence after implementation.
