# Token Optimization in the Personal AI Flow

This guide explains how developers and AI teammates should reduce unnecessary token use while preserving correctness, review quality, and delivery speed. Token count is an efficiency signal, not the product goal.

## The flow at a glance

```text
Small shared rules
        ↓
Choose one task skill
        ↓
Load only required and triggered manual sections
        ↓
Confirm missing inputs before implementation
        ↓
Use narrow searches, reads, and tool results
        ↓
Implement, verify, and hand off a compact task record
        ↓
Review monthly usage against quality and completed work
```

## What the repository already optimizes

### Small always-on context

`AGENTS.md` contains only shared rules that apply broadly. Detailed procedures live in skills and documentation that are loaded when relevant. Do not move specialist instructions into `AGENTS.md` merely to make them more visible.

### One primary skill per operation

Choose the most specific skill for the requested operation. Combine skills only when the task genuinely contains multiple operations. Loading every skill or asking an agent to study every document increases context without improving the decision.

### Selective manual reading

Each skill declares its required sections and conditional triggers directly. Read those sections, then add only sections triggered by the actual scope. Do not load `docs/ai/manual-routing.md` merely to repeat the active skill; use the map only for mixed tasks, unmapped impacts, or AI-system maintenance. Reuse a section already present and unchanged in the current context; reload it after a relevant edit, handoff, or lost context.

Selective reading does not mean incomplete work. The agent must still inspect all affected code, requirements, designs, API contracts, and test evidence needed for the task.

### Questions before expensive work

Use task intake to identify missing product decisions, Figma states, API behavior, permissions, environments, and acceptance criteria before implementation. One focused clarification is usually cheaper than implementing and reverting an assumption.

Group related questions. Do not ask for information that can be established safely from the repository or an approved source.

### Deterministic scripts for repeated work

Use repository scripts for generation, context validation, Sentry reads, and token reports instead of repeatedly describing or recreating the procedure in chat. Scripts should return compact structured output and keep credentials outside the repository.

### Explicit handoffs

The final task record and **Next teammate** block carry conclusions, evidence, open questions, and the recommended next role. A teammate should receive the compact record and required artifacts—not the entire conversation copied into a new prompt.

## Developer checklist

### Before a task

- State the objective, task type, acceptance criteria, and affected platform.
- Provide direct references: issue, Figma node, API operation, product decision, error, or MR.
- Choose one primary skill from `docs/ai/commands.md`.
- Load the skill's required manual sections and only the conditional sections that apply.
- Skip `docs/ai/README.md` unless the task is project orientation or AI-system maintenance.
- Load `docs/ai/workflows.md` only for intake, implementation, debugging, verification, or an explicit skill requirement.
- Start the compact context manifest; record references and reasons rather than copying source bodies.
- Run `personal-context-audit` when discovery, duplicated skills, MCP tools, or loaded instructions are uncertain.
- Resolve material unknowns before broad implementation begins.

### During a task

- Search for symbols and paths before reading large files.
- Read the smallest useful range; expand only when dependencies require it.
- Prefer summaries, diffs, diagnostics, and targeted test output over complete logs.
- Avoid reopening unchanged files or repeating already-established project facts.
- Keep the context manifest synchronized when a source, code area, integration, or manual section becomes relevant or is deliberately excluded.
- Keep stable instructions and tool definitions unchanged when practical so platforms that support prompt caching can reuse them.
- Use MCP only when it is the selected and useful source. Disconnect or avoid unused servers whose tool definitions consume context.
- Do not impose fixed tool-call or tool-output budgets that can prevent an agent from completing a legitimate investigation. Record available tool telemetry in the monthly audit and optimize demonstrated waste rather than hypothetical use.
- Use a teammate only for an independent responsibility that justifies fresh context. Do not duplicate the same investigation across agents without a reason.
- Stop retry loops when the evidence is unchanged; report the blocker or choose a documented fallback.

### After a task

- Reconcile the checklist against the final diff rather than rereading unrelated documentation.
- Run targeted verification first, then broader checks in proportion to impact.
- Record decisions, evidence, unresolved risks, and relevant manual sections compactly.
- Recommend at most one next teammate; do not start it automatically.
- Add reusable guidance to the AI source only after it becomes a verified team decision. Do not preserve one-off chat history as permanent context.

## Platform-specific checks

### Codex

- Keep shared instructions stable and concise.
- Use the repository skill that matches the task; do not paste its full content into the request.
- Treat account limit percentages as capacity information, not historical token measurements.
- For API-backed agents, preserve stable prompt prefixes and inspect reported input, cached-input, output, and reasoning usage when available.

### Cursor

- Keep a persistent working mode only for its relevant phase; follow `docs/ai/cursor-modes.md`. Load specialist skills on demand and reuse unchanged manual context. Exiting a mode does not guarantee deletion of earlier context.
- Inspect the context ring for occupancy by category; this is not a billing report. Record mode/client details in optimization experiments and compare actual task usage with quality outcomes, without adding tool-call limits.
- Confirm which same-name skill Cursor selected. Cursor may discover the independent `.cursor`, `.agents`, and `.claude` copies in this repository.
- Identical discovered copies are a context-audit warning, not proof that their full bodies were loaded or billed multiple times.
- Use Team Analytics or Admin API evidence when available instead of estimating tokens from message count.
- Keep Bugbot focused on the MR diff and its review rules; do not attach unrelated project history.
- Use Cursor Agent Review Quick for automatic post-task review. Reserve Deep review for sensitive, wide-reaching, or high-risk changes, and do not duplicate the same review through a `stop` hook.

### Claude Code

- Use `/context` to inspect what occupies the current context and `/mcp` to inspect connected server cost when supported by the installed client.
- Load task skills on demand. A custom teammate can receive a fresh, isolated context; pass only the task record and necessary evidence.
- Use `/usage` for session evidence where available. Do not treat a session snapshot as complete monthly team usage.

## What not to do

- Do not preload the whole project manual “just in case.”
- Do not paste generated files, complete logs, lockfiles, or large API specifications when a path, diff, schema, or focused excerpt is enough.
- Do not repeat the same rules in `AGENTS.md`, every skill, every teammate, and the task prompt.
- Do not use multiple agents for work that is sequential, tiny, or dependent on the same full context.
- Do not choose a smaller model or lower reasoning level solely to reduce tokens when the task requires deeper analysis.
- Do not interpret cached tokens as free, estimated usage as exact, or missing provider data as zero.
- Do not optimize a single task in isolation if it creates more defects, review cycles, or developer effort.

## Monthly improvement loop

Generate the private report described in `docs/ai/token-usage.md`. Compare complete months using stable sources and examine:

- total, uncached-input, cache-read, output, and reasoning tokens;
- tokens and cost per completed task;
- exact versus estimated coverage;
- tool calls, returned-context tokens, failures, fallbacks, and single-tool attributed usage when available;
- task mix and model mix;
- retries, failed attempts, review findings, escaped defects, and cycle time.

Choose one change for the next period. Examples include narrowing a skill's required reading, removing duplicated instructions, batching related reads, improving intake inputs, shortening routine output, or reserving expensive models for tasks that benefit from them. Record the expected benefit and guardrail metric, then keep or revert the change based on the next comparable report.

## Optimization proposal template

```text
Observed evidence:
Likely cause:
Proposed single change:
Expected token or cost effect:
Quality and delivery guardrails:
Measurement period:
Result and decision:
```

Never claim that a change improved the flow from token totals alone. The result must include quality or throughput evidence.
