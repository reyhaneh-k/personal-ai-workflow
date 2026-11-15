# Task Workflow and Checklists

## Task record

Every implementation task maintains this record in the conversation, ticket, or approved task file:

```md
# Task

## Request
- Type:
- Objective:
- Human feature owner:
- Acceptance criteria:

## Worktree
- Path: main checkout | absolute isolated-worktree path
- Branch:
- Base revision:

## Sources
- Product:
- Design:
- API:
- Code:
- Production evidence:
- Manual sections consulted (paths and relevant revisions/evidence):
- Conditional sections selected and why:
- Material manual gaps and answers:

## Questions and answers

## Context manifest
- Working method / active mode (or none; state whether client activation is verified):
- Primary skill:
- Always-on instructions:
- Required manual sections:
- Conditional manual sections and trigger reasons:
- Task-specific sources:
- Code scope inspected:
- Integrations and tools actually used:
- Context explicitly excluded as irrelevant:
- Missing or unknown context:

## Readiness
- Status: ready | blocked
- Missing information:
- Explicit assumptions approved by the human:

## Impact checklist

## Implementation plan

## Testing level-purpose matrix

## Completion reconciliation

## Required platform testing
```

The context manifest records what informed the work; it is not a request to copy document bodies or complete logs into the task record. Use paths, revisions, node or operation identifiers, focused evidence references, and short reasons. Update it when the scope expands, a new source is used, or an initially selected source proves irrelevant.

## Parallel worktrees

Use a separate Git worktree only when concurrent work will edit files or needs a clean, independent branch. Read-only research, code exploration, review, and one-shot checks normally stay in the main checkout or an isolated agent context.

Create a worktree from the repository root with `pnpm ai:worktree:add -- <branch>`. It creates the branch when needed and places the checkout at `../worktrees/<branch>`. To choose a base explicitly, use `pnpm ai:worktree:add -- <branch> --base <ref>`. The command refuses an existing target path and validates the branch name; it never removes worktrees or branches.

Record the worktree path, branch, and base revision in the task record. Give concurrent editors different worktrees, avoid overlapping changes, use separate development-server ports and emulator/device state, and inspect canonical sources in each checkout. Native outputs require an explicit generation request under `ai/README.md`. Review each branch and merge or discard it deliberately; do not merge unreviewed agent changes because they were isolated.

For persistent working methods, follow `docs/ai/cursor-modes.md`. Keep one task record across turns and distinguish the active mode from the task skill. At a phase transition, preserve the current diff/revision, acceptance criteria, tests, and gaps before exiting or replacing the mode in the client. Switching the same conversation from implementation to review remains self-review; use a fresh reviewer context for independent review. Mode selection is not required for small tasks and does not automatically launch teammates.

## Before implementation

### Context readiness

- [ ] Task type is classified.
- [ ] Objective and acceptance criteria are testable.
- [ ] Human feature owner is known.
- [ ] Product source is identified.
- [ ] Design source is identified or explicitly not required.
- [ ] API source is identified or explicitly not required.
- [ ] Existing code patterns have been inspected.
- [ ] Required and impact-triggered manual sections from the selected skill(s) have been read.
- [ ] Context manifest identifies selected, used, excluded, missing, and unknown context without embedding large source bodies.
- [ ] Material conflicts and missing information have been queried; template prompts were not treated as policy.
- [ ] No unapproved product assumptions remain.

### Change impact

- [ ] Routes and navigation
- [ ] Shared components and design system
- [ ] API operations and schemas
- [ ] Query keys, cache invalidation, and refetches
- [ ] Client state and persistence
- [ ] Authentication and authorization
- [ ] Loading, empty, partial, error, retry, and success states
- [ ] Localization, layout direction, and date/number formatting (only when `PROJECT.md` `localization` is on)
- [ ] Responsive layouts
- [ ] Browser-specific behavior
- [ ] Native webview bridge and container compatibility (only when `PROJECT.md` `webview` is on)
- [ ] Accessibility and keyboard behavior
- [ ] Performance and bundle impact
- [ ] Analytics, telemetry, and Sentry context (Sentry only when `PROJECT.md` `sentry` is on)
- [ ] Unit, integration, and manual tests
- [ ] Documentation, release, monitoring, and rollback implications

Mark each item applicable, not applicable with a reason, blocked, or planned. Read capability flags from `PROJECT.md` before assuming optional domains apply.

## During implementation

- Keep the checklist synchronized with discoveries.
- Do not silently broaden scope.
- Record unrelated defects separately.
- Escalate product decisions to the feature owner.
- Escalate repository, access, merge, and release decisions to the designated engineering owner.

## After implementation

Record what completed, changed from plan, was newly discovered, remains unverified, requires follow-up, and still carries risk. Recheck manual-section selection against the final diff; read any newly relevant sections and resolve material gaps before claiming verification.

Use `docs/ai/manual-testing.md` for the authoritative testing-level/purpose matrix, evidence statuses, and completion requirements. The implementer owns task tests; the verifier independently executes applicable checks. Role boundaries and allowed handoffs come from `ai/source/agents/*.json`.

For Cursor implementation tasks, follow `docs/ai/cursor-review.md`: run Quick Agent Review automatically after the implementing agent finishes, let the developer inspect and triage its findings and the local diff, then run the independent `personal-peer-review` teammate before `personal-test-verifier`. Use manual Deep Agent Review for sensitive or wide-reaching changes. Bugbot runs later on the opened MR and does not replace any earlier stage.

For a difficult reproducible defect whose cause depends on runtime state, use `personal-debugger` before ordinary implementation. Cursor investigations must begin in native Debug Mode using `/debug` or the mode picker. The debugger records hypotheses and runtime evidence, applies only a supported targeted fix, repeats the reproduction, and removes all temporary instrumentation before handoff. Use `personal-fix-bug` directly when the cause is already established and instrumentation would add no value.

Use `personal-e2e-tester` only for affected browser journeys and `personal-webview-tester` only when `PROJECT.md` enables webview and native-container behavior is affected. These specialists supplement core unit verification; they do not take test ownership away from the implementer.

## Platform test matrix

At minimum consider:

- the supported browsers and versions verified from `PROJECT.md` and current repository configuration; ask when that support decision is missing;
- small phone, large phone, tablet, desktop, and wide desktop when applicable;
- standard browser, webview (when enabled), and installed/PWA-like behavior when affected;
- signed-out, signed-in, and restricted users as applicable;
- empty, normal, and large data sets;
- slow response, offline/network failure, and server errors;
- localization / layout direction / long translations when `localization` is on; keyboard-only navigation when interactive UI is affected.

Use the statuses from `docs/ai/manual-testing.md`; identify remaining human checks separately. Consult a project compatibility checklist only when it exists and applies.

## Continuous Sentry monitoring

Apply only when `PROJECT.md` enables `sentry`. The Sentry monitor is separate from implementation. Each run records only a sanitized summary and compares it with the previous summary. It alerts only for new issues, regressions, meaningful volume changes, release correlations, or platform clusters. It must remain paused until every activation gate in `docs/ai/platform-capabilities.md` is complete.
