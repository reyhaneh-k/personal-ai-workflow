# Cursor review workflow

Cursor has three separate review surfaces. Keep their evidence and responsibilities distinct.

Source-only checkout note: run `pnpm ai:generate` for local review files. Ignored Bugbot files are not available to the hosted repository integration; its configuration and disabled Autofix must be verified separately. Local or CI generation is not evidence that hosted Bugbot consumed these instructions.

| Review | Scope | Trigger | Responsibility |
| --- | --- | --- | --- |
| Review changes | Local task diff | Human opens the completed task diff | Human accepts, rejects, or requests changes. Keep this manual. |
| Agent Review / Find Issues | Local changes | Automatically after an agent finishes, or manually with `/agent-review` | Fast automated self-review before independent peer review. |
| Bugbot | Open merge request | Repository integration | Automated MR review with repository context. Autofix remains disabled. |

The independent `personal-peer-review` teammate remains a fourth, separate review. It verifies the requirement and actual diff rather than merely repeating automated findings.

## Per-developer setup

1. Open Cursor settings and locate Agent Review.
2. Enable **Auto-Run on Agent Finish**.
3. Select **Quick** as the automatic default.
4. Keep the human-facing **Review changes** step manual.
5. Confirm the workspace discovers `.cursor/BUGBOT.md`; Cursor Agent Review and Bugbot use these Personal review priorities.
6. Make a harmless local test diff, finish an agent task, and verify that Agent Review runs and produces inspectable findings.
7. Record the capability as verified in the developer's onboarding evidence. Do not commit personal Cursor settings.

Cursor may move the setting between releases. Search Cursor settings for **Agent Review** rather than relying on a permanent menu path.

## Review depth

- Use **Quick** automatically for ordinary tasks.
- Run `/agent-review` with **Deep** review for sensitive, wide-reaching, high-risk, or difficult changes.
- Do not automatically run Deep review after every task; it adds latency and token usage without proportional value for small changes.
- If the automatic review did not run, trigger `/agent-review` manually and report that fallback.

## Required sequence for Cursor implementation tasks

1. The implementing agent finishes and runs its own relevant tests.
2. Cursor automatically runs Quick Agent Review against the local changes.
3. The developer examines the findings and the Review changes diff, addressing or explicitly dismissing findings with a reason.
4. `personal-peer-review` independently reviews the requirement and actual diff.
5. `personal-test-verifier` independently runs unit tests and required checks.
6. Applicable browser E2E and Android webview specialists run.
7. The developer opens the MR using the prepared link.
8. Bugbot reviews the MR; Autofix remains disabled.

For non-Cursor platforms, skip only the Cursor Agent Review step. The independent peer review, verification, platform testing, and MR review requirements remain applicable.

## Why no repository stop hook

Do not add a Cursor `stop` hook merely to submit `/agent-review`. The native Auto-Run setting is the authoritative mechanism for this feature. A follow-up hook can consume extra tokens, review its own review, or create a loop unless it maintains additional state and guards. Reconsider a hook only if the native feature is unavailable and the team explicitly chooses the additional complexity.

## Official references

- [Cursor Agent Review](https://prod.cursor.com/docs/agent/agent-review)
- [Cursor agent hooks](https://cursor.com/docs/hooks)
- [Cursor diff review](https://docs.cursor.com/en/agent/review)
