---
name: personal-tdd
description: Follow a test-first red-green-refactor cycle when a Personal implementation task calls for TDD across multiple turns.
---

# Test-driven implementation

Use when the developer chooses TDD. In Cursor this skill can be pinned with **Use as Mode** instead of feature-delivery mode. It supplements the applicable implementation skill; it does not preload every testing workflow or create a separate test author.

## Manual context

Required sections: `docs/ai/manual-coding.md`, `docs/ai/manual-testing.md`.

Follow `AGENTS.md` and the relevant readiness, task-record, impact, and completion sections of `docs/ai/workflows.md`. Load the current platform's applicable implementation skill (`personal-implement-task`, `personal-implement-figma`, `personal-integrate-api`, `personal-fix-bug`, or `personal-refactor`) and its required/conditional sections. For an unmapped impact consult `docs/ai/manual-routing.md`. Reuse unchanged readings; record the active working method and primary task skill separately.

## Inputs and persistent loop

Start with testable acceptance criteria, scope, relevant code, and an established runnable test command. Inspect the current test setup rather than assuming the manual's baseline is still current. If fixtures, conventions, or a necessary harness are missing, surface the concrete gap and resolve it; do not install a new framework or invent a project convention just to produce a green result.

1. Pick one observable behavior and the lowest testing level that can reliably exercise it. Classify its purpose, including affected existing behavior.
2. Write the focused test and run it before changing the implementation. Confirm the failure demonstrates the missing behavior or defect; a broken import, failed environment, or zero collected tests is not a valid red result.
3. Implement the smallest coherent change that makes that same test pass. Do not weaken an agreed assertion to conceal a defect.
4. Refactor when useful while preserving behavior, then rerun affected tests. If no refactor is needed, proceed to the next behavior.
5. Expand coverage to integration, E2E, or WebView only when the changed boundary requires it. Keep test setup failures and unexecuted scenarios explicit.

Do not retrofit a claim of TDD onto code written before its tests. Report any interrupted cycle or justified exception and the evidence actually obtained.

## Completion and handoff

Report the tests and commands demonstrating red, green, and any refactor checks; reconcile the implementation checklist and level-purpose/platform matrices. Include blockers and residual regressions. The implementer remains responsible for tests; independent review and the `personal-test-verifier` role still follow the existing workflow. Use the frontend implementer's next-teammate route from `docs/ai/agents.md`. Exit or replace the active mode at the phase boundary through the client; a recommendation alone does not activate another mode or teammate.
