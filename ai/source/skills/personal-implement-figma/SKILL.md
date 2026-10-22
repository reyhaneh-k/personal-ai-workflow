---
name: personal-implement-figma
description: Implement an approved Personal frontend design from a specific Figma node or supplied design exports.
---

# Implement a Figma design

## Manual context

For interactive browser execution in Cursor, read `docs/ai/cursor-browser.md` for setup, session/data preflight, evidence, and fallback handling. Use actual available capabilities; native browser checks do not establish cross-browser or Android WebView coverage.

Required sections: `docs/ai/manual-design.md`, `docs/ai/manual-coding.md`, `docs/ai/manual-localization.md`, `docs/ai/manual-accessibility.md`.

Read these additional sections when their trigger applies:

- behavior or journey decisions: `docs/ai/manual-product.md`.
- routes or shared consumers: `docs/ai/manual-architecture.md`.
- server-backed states: `docs/ai/manual-api.md`.
- query/store changes: `docs/ai/manual-state.md`.
- restricted UI or sensitive data: `docs/ai/manual-security.md`.
- responsive and webview requirements: `docs/ai/manual-compatibility.md`.
- visual and interaction verification: `docs/ai/manual-testing.md`.
- Cursor visual refinement or Design Mode input: `docs/ai/cursor-design-mode.md`. Use the selected running UI as current-state evidence and retain the approved Figma node/export as the target; existing integration preflight still applies.
- assets, fonts, or motion: `docs/ai/manual-performance.md`.

Follow the reading contract in `AGENTS.md`. The required and conditional lists above are authoritative for this skill. Consult `docs/ai/manual-routing.md` only for a mixed task or an impact not covered above. Record selected sections and material gaps in the context manifest; never treat template prompts as approved rules. Read the relevant task-record, readiness, impact, and completion sections of `docs/ai/workflows.md`.

## Required inputs

- feature objective and acceptance criteria;
- Figma file and node URL, or approved exports for every affected breakpoint;
- required component states and interactions;
- affected route, user roles, and Android webview applicability.

## Integration preflight

Read `docs/ai/integrations.md`. Before retrieving Figma data, show the human-visible preflight and ask whether to use MCP, supplied files/exports, or the read-only REST API unless the task already selects one. Estimate the MCP calls needed and report capacity as sufficient, insufficient, or unknown with its basis. A plan/seat ceiling is not remaining capacity. Do not call a data-reading MCP tool before the choice.

If MCP is selected, use the smallest available identity/quota check, then retrieve only the affected nodes and states. If remaining capacity is unknown, say so. On unavailable access, insufficient capacity, or a rate-limit response, stop MCP requests, report the evidence, and use only the fallback the developer approved. Report the source actually used in the final result.

## Workflow

1. Confirm the design source and record its version or export date.
2. Perform the selected access path and retrieve only the relevant nodes, states, assets, and breakpoint evidence.
3. Inspect existing Personal components, tokens, typography, icons, layouts, and responsive patterns before adding anything new.
4. Identify missing loading, empty, error, disabled, success, partial, focus, hover, and responsive states. Ask about material omissions instead of inventing them.
5. Produce an implementation and impact checklist before editing.
6. Implement the smallest coherent change using existing project conventions.
7. Build and reconcile the level-purpose matrix from `docs/ai/manual-testing.md`. Add applicable unit/integration coverage and identify new-behavior and regression journeys separately for browser or webview testing.
8. Compare the implementation against the approved design at each affected breakpoint and reconcile the checklist.
9. Hand the result to independent review and platform verification.

Do not treat a full-page screenshot as proof of measurements or interaction behavior. Never commit Figma credentials.
