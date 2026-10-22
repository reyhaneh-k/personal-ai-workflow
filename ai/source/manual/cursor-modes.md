# Personal working modes

## Contents

- [Choose a mode](#choose-a-mode)
- [Activate and switch in Cursor](#activate-and-switch-in-cursor)
- [Native Design Mode](#native-design-mode)
- [Start a task](#start-a-task)
- [Handoffs and independence](#handoffs-and-independence)
- [Context and token usage](#context-and-token-usage)
- [Maintenance and verification](#maintenance-and-verification)

## Choose a mode

When the chosen workflow needs interactive Cursor testing, use `docs/ai/cursor-browser.md`. Browser access is a tool capability, not another persistent mode or an independent reviewer.

A Personal mode is a skill used as a persistent working method. Keep one Personal mode active for the current phase and invoke task skills only when needed. It does not create a separate teammate, grant permissions, schedule work, or retain knowledge permanently. The following are Personal recommendations; actual client support must be verified locally.

| Working method / skill | Use when | Task skills and references loaded as needed |
| --- | --- | --- |
| `personal-feature-delivery` | A frontend feature spans multiple turns | Intake, ordinary implementation, Figma, API integration, scoped refactoring |
| `personal-tdd` | The developer chooses test-first implementation | The applicable implementation skill and testing manual; use instead of delivery mode |
| `personal-debug` | A defect requires runtime evidence | Existing debugging workflow; preserve Cursor native Debug Mode |
| `personal-ui-validation` | UI checks span screens, states, or platforms | Browser E2E, Android WebView, accessibility, and selected manual sections |
| `personal-peer-review` | Reviewing a large diff through several turns | Existing peer-review procedure; ordinary reviews can remain one-shot |

Orientation remains an empty placeholder. MR-link preparation, release health, bounded Sentry investigations, test verification, individual audits, and manual updates normally remain one-shot operations. Choose a mode for sustained work, not as an extra mandatory step for every small task. `personal-test-verifier` is a teammate role using the `personal-verify-task` skill.

## Activate and switch in Cursor

In a supported Cursor Agents Window or CLI, open `/`, select the native `.cursor/skills/` entry, and choose **Use as Mode** (or `Alt+Enter` on Windows). Verify its badge. Ordinary `Enter` attaches a skill to one message; the mode keeps its instructions present across turns until exited. See [Cursor prompting](https://cursor.com/docs/agent/prompting) and [skill modes](https://cursor.com/docs/skills#using-a-skill-as-a-custom-mode).

Before changing phases, finish the compact task record, exit the old mode through the client, select the next method, and verify the badge. If the control is absent, record the client/surface limitation and attach the skill explicitly for the task; do not claim persistence. Reattach after context loss when necessary.

Cursor's native Ask, Plan, Agent, and Debug workflows have their own client behavior. A custom skill does not turn those controls on or guarantee that they compose in every client surface. Use native Plan/Ask for a planning-only request. For difficult defects, preserve native Debug Mode and attach `personal-debug` if a pinned custom mode cannot coexist with it. Read-only text in a review skill is behavioral guidance, not a tool-permission restriction.

No client activation is performed by generating these files. Compatible skill directories may also be discovered; verify the selected native copy in the local context audit. Other platforms receive independent copies of the same workflows as ordinary skills; no Cursor-style persistent-mode support is assumed there.

## Native Design Mode

For visual refinement, use `docs/ai/cursor-design-mode.md` alongside the current Personal skill. Native Design Mode targets the running interface; **Use as Mode** keeps a skill's working instructions active. Verify each separately in the installed client. Continue using feature delivery for implementation or UI validation for a findings-only pass. A Figma task still uses its approved design source and integration preflight.

## Start a task

After activating feature delivery, send an outcome and the available evidence. For example:

```text
Implement the card-management screen.
Product: @<requirement file>
Design: <approved Figma node or supplied export>
API: @<contract file>
Acceptance: <observable criteria>
Verification targets: <required browsers/devices, or ask the agent to propose them>
Use personal-implement-figma for the UI and personal-integrate-api for the API work.
```

Replace placeholders with real references; missing material decisions become focused questions. Let the agent find relevant code when the developer does not know its location. Invoke the specific skill through the picker when explicit attachment is useful; it need not become a second persistent mode.

The mode maintains readiness, impact checks, testing, and completion discipline. The task skill supplies specialist procedure and manual routing. Keep one task record in the conversation, ticket, or approved file using `docs/ai/workflows.md`; do not copy every reference into it. Maintain Figma/Sentry source-choice and capacity checks from `docs/ai/integrations.md` and the Context7 policy from `AGENTS.md`.

## Handoffs and independence

A mode change does not clear the conversation or make its author an independent reviewer. Use a fresh reviewer context for independent review and supply the requirement, diff/base/revision, relevant source references, test evidence, and unresolved gaps. Verify claims from the actual diff; a same-chat pass is self-review.

At any handoff record the current phase, primary skill, completed checks, remaining gaps, and minimal evidence for the next role. Mode instructions and teammate recommendations do not launch agents or authorize messages. Keep the existing next-teammate routes in `docs/ai/agents.md` and Cursor review sequence in `docs/ai/cursor-review.md`; avoid adding duplicate reviews just because another mode exists. Successful verification may end with `none`.

## Cursor subagents

Use a subagent when a phase needs isolated context, independent evidence, or can run in parallel with another non-overlapping phase. Personal's generated `.cursor/agents/` files are project subagents, not merely prompt templates. Invoke one explicitly with `/personal-reviewer`, `/personal-debugger`, `/personal-test-verifier`, `/personal-e2e-tester`, or `/personal-webview-tester`, or ask Cursor to use the named subagent naturally. Cursor can also choose a matching custom subagent from its description.

Delegate only a self-contained packet: objective, requirement or acceptance criteria, exact revision/diff, affected paths or scenario, constraints, and expected result. Use the built-in Explore and Browser subagents for codebase reconnaissance and browser interaction that would otherwise fill the main context. Run independent read-only review and verification work in parallel when useful; do not run concurrent editors against the same checkout. Request isolated worktrees when parallel implementation is genuinely necessary, then review and integrate each result deliberately.

Subagents have separate context windows and return a summary to the parent. They do not inherit the whole conversation, and they do not make their result independent merely by using a different name—independence still requires a fresh review context and evidence from the actual diff. A `Next teammate` recommendation remains a human-controlled handoff, not an automatic launch.

## Context and token usage

For a substantial phase result, use `docs/ai/cursor-canvas.md` to present the record, findings, or testing matrix interactively. Canvas is an output surface, not another persistent mode; keep authoritative records synchronized.

Keep the persistent skill small and reuse unchanged readings already in context. Load only the selected specialist skills and their applicable manual sections. Existing shared manual files provide detailed references; they need not be duplicated into mode folders. Do not repeat the entire mode or manual in each prompt.

Exit a mode when its phase ends. This removes the persistence request, but does not promise to erase prior messages or reclaim a specific token amount. The context ring shows current occupancy by category, including rules, skills, tool catalogs, and conversation; it is not a monthly billing meter. [Cursor context usage](https://cursor.com/docs/agent/prompting#context-usage)

For `docs/ai/token-usage.md` audits, compare like-for-like tasks with actual usage evidence and quality results. Note the mode/client used in experiment notes; do not invent token counts or assume a mode guarantees savings. This adds no tool-call caps.

## Maintenance and verification

Edit the three new workflow skills plus the existing debug and peer-review skills in `ai/source/skills/`; generate independent native copies with `pnpm ai:generate`. Manual routes are tracked in `docs/ai/manual-routing.md`. No separate mode registry or automatic phase-switching hook is required.

Use `pnpm ai:check` and `pnpm ai:test` for repository checks. Locally verify skill discovery, activation badge, behavior over a follow-up, exit, and native Debug compatibility using the checklist in `docs/ai/platform-capabilities.md`. Repository validation cannot prove that Cursor has loaded or activated a mode.
