---
name: personal-debug
description: Diagnose a difficult reproducible Personal frontend defect from runtime evidence before applying and verifying a targeted fix.
---

# Debug a Personal frontend defect

Use this workflow for defects whose cause is unclear from the available error and code, including race conditions, timing problems, intermittent regressions, memory or performance symptoms, and failures that need runtime state. Use `personal-fix-bug` instead for a straightforward defect with an established cause.

## Manual context

For interactive browser execution in Cursor, read `docs/ai/cursor-browser.md` for setup, session/data preflight, evidence, and fallback handling. Use actual available capabilities; native browser checks do not establish cross-browser or Android WebView coverage.

Required sections: `docs/ai/manual-product.md`, `docs/ai/manual-architecture.md`, `docs/ai/manual-testing.md`.

Read these additional sections when their trigger applies:

- implementing the targeted fix: `docs/ai/manual-coding.md`.
- browser or device reproduction: `docs/ai/manual-compatibility.md`.
- network failures: `docs/ai/manual-api.md`.
- cache, persisted state, or store behavior: `docs/ai/manual-state.md`.
- authentication, private data, or sensitive runtime values: `docs/ai/manual-security.md`.
- Sentry or production logs: `docs/ai/manual-observability.md`.
- timing, rendering, memory, or resource symptoms: `docs/ai/manual-performance.md`.
- visual or interaction behavior: `docs/ai/manual-design.md` and `docs/ai/manual-accessibility.md`.

Follow the reading contract in `AGENTS.md`. The required and conditional lists above are authoritative for this skill. Consult `docs/ai/manual-routing.md` only for a mixed task or an impact not covered above. Record selected sections and material gaps in the context manifest; never treat template prompts as approved rules. Read the relevant task-record, readiness, impact, and completion sections of `docs/ai/workflows.md`.

## Required inputs

- expected and actual behavior;
- exact reproduction steps and affected environment;
- browser, device, webview, user state, and data prerequisites when relevant;
- available errors, stack traces, screenshots, Sentry evidence, or failing tests;
- permission and a safe way to reproduce when the flow touches sensitive or production data.

Ask for material missing information instead of inventing a reproduction or expected behavior.

## Cursor execution contract

This skill also serves as the persistent Personal debugging playbook. **Use as Mode** pins its instructions where the installed Cursor surface supports it; pinning does not activate native Debug Mode. Preserve native Debug Mode for runtime instrumentation. If the client cannot combine the two, use native Debug Mode with this skill attached and refresh it after lost context. Keep hypotheses, reproduction evidence, and temporary-instrumentation cleanup state in the task record across follow-ups; do not restart an unchanged investigation.

On Cursor, run this workflow in native **Debug Mode**. Start it with `/debug` followed by the defect and an instruction to use `personal-debug`, or select Debug from the mode picker before submitting the task. The `personal-debugger` teammate and this skill provide Personal-specific procedure; they do not activate or simulate Cursor Debug Mode.

If a Cursor session is not in Debug Mode, do not begin runtime instrumentation. Return a compact transfer prompt that includes the confirmed inputs and tells the developer to restart in Debug Mode. Project instructions still apply inside Debug Mode.

On another platform, follow the same evidence-driven loop with its available runtime, browser, test, and logging tools. State the actual tools used and never claim Cursor Debug Mode ran elsewhere.

## Workflow

1. Confirm this needs runtime debugging. Route a simple, already-understood defect to `personal-fix-bug` to avoid unnecessary instrumentation and token use.
2. Reproduce the baseline failure, or record exactly why reproduction is blocked.
3. Trace the smallest relevant runtime path and write multiple falsifiable hypotheses.
4. Add minimal temporary instrumentation that distinguishes those hypotheses. Do not log credentials, tokens, personal data, financial values, or unnecessarily large payloads.
5. Give the human exact reproduction steps and wait for the requested run when human interaction is required.
6. Analyze the captured runtime evidence and reject unsupported hypotheses. Separate observed facts, inference, and remaining uncertainty.
7. Identify the root cause before changing product behavior. If evidence is still insufficient, refine instrumentation and reproduce again.
8. Apply the narrowest durable fix supported by the evidence. Build the level-purpose matrix from `docs/ai/manual-testing.md` and add a regression scenario at the lowest level that reliably reproduces the failure, plus higher-level coverage required by its boundary.
9. Repeat the original reproduction and relevant adjacent scenarios. Run proportionate unit, static, browser, and build checks.
10. Remove every temporary log, probe, debug server call, flag, and artifact. Inspect the final diff specifically for leftover instrumentation and sensitive output.
11. Reconcile the final result with the hypotheses and report root cause, evidence, fix, verification, removed instrumentation, untested cases, and residual risk.

Do not change code merely because a hypothesis sounds plausible. A completed debugging task requires runtime evidence or an explicit statement that runtime confirmation remains blocked.
