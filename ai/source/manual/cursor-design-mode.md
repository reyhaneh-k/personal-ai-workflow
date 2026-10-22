# Cursor Design Mode for Personal

## Contents

- [Open and use it](#open-and-use-it)
- [Choose the Personal workflow](#choose-the-personal-workflow)
- [Refine an interface](#refine-an-interface)
- [Verification and context](#verification-and-context)

## Open and use it

Design Mode is a visual input feature in Cursor's Agents Window browser. It supports element selection, multiple selections, drawing, and voice. Selected-element context includes source-related information and a screenshot; drawings capture a frozen viewport. See [Cursor Design Mode](https://cursor.com/docs/agent/design-mode).

Follow `docs/ai/cursor-browser.md` for the browser/session preflight. Reuse a matching running server; otherwise start the app with the repository's existing development command (`pnpm dev` in the current baseline). Open the reported local URL in that browser, navigate to the target route/state, and toggle Design Mode. The documented shortcuts are:

| Action | Windows | macOS |
| --- | --- | --- |
| Toggle Design Mode / return to browsing | Ctrl+Shift+D | Cmd+Shift+D |
| Select an area | Shift+drag | Shift+drag |
| Add element to chat | Ctrl+L | Cmd+L |
| Add element to input | Alt+click | Option+click |

These shortcuts apply in the browser context. Confirm availability in the installed client; generation does not enable the feature. If unavailable, use a focused screenshot, route, viewport, and component reference as task evidence. Do not describe that fallback as native Design Mode.

## Choose the Personal workflow

The following is Personal workflow guidance. Design Mode supplies visual targeting; the existing skills supply implementation and verification procedure. There is no extra `personal-design-mode` skill or simulated browser feature.

| Task | Workflow |
| --- | --- |
| Refine a running interface | `personal-implement-task`; keep `personal-feature-delivery` active for extended work where supported |
| Match an approved Figma design | `personal-implement-figma` with the design node/export plus the selected running UI |
| Inspect differences without editing | `personal-ui-validation`, with an explicit findings-only request |
| Investigate unclear runtime behavior | `personal-debug` through native Debug Mode |

Verify that the desired working skill is attached or active in the client. Design Mode's browser toggle is separate from **Use as Mode** for a skill; do not assume one activates the other or changes tool permissions.

Design Mode does not require retrieving Figma data to refine local UI. When a task does rely on Figma, keep the approved node/export as the target and follow `docs/ai/integrations.md` for access and capacity checks. The running interface is evidence of current behavior, not automatically the intended design. Resolve material conflicts with the feature owner using the existing source hierarchy; reuse decisions already supplied.

## Refine an interface

1. Record the route, viewport, locale/direction, user state, and intended result in the existing task record. Use test data suitable for captured screenshots and component properties.
2. Target the smallest relevant element or region and give the desired change. Include related elements when their relationship matters. Do not reattach the entire page history for every adjustment.
3. Before editing, identify the source component and shared consumers. Reuse approved tokens and patterns. A selected instance may come from a shared component; record whether the requested change applies locally or to all consumers, asking only when that choice materially changes the result.
4. Implement within the current task scope and maintain its impact checklist. Group related feedback; where edits overlap a shared component, reconcile the current diff before applying the next change. A visual prompt does not independently launch additional teammates.
5. Revisit the current rendered state after the edit. Re-select when navigation, layout, or code changes make earlier visual evidence stale. Return to normal browsing to exercise affected interactions.
6. Compare against the intended result, run applicable behavioral tests, reconcile the checklist, and follow the existing review/handoff workflow.

Example change request after selecting an element:

```text
Use personal-implement-task. Match this button's horizontal padding to the
existing secondary button token. Preserve its behavior and label.
Apply this only to this screen; check RTL and narrow phone layouts.
```

Example validation request:

```text
Use personal-ui-validation. Compare this selected region with the supplied
approved design export. Report differences and affected states only;
do not edit code during this pass.
```

An explicit request to fix a reported finding authorizes that scoped implementation; there is no additional approval round just for using Design Mode. Reconcile any genuinely new product decision first.

## Verification and context

For editing a report canvas rather than the running product, follow `docs/ai/cursor-canvas.md`. Canvas Design Mode changes presentation; its checkboxes and charts do not create product-test evidence.

Record the actual before/after evidence, tested build, and applicable browser/device scenarios. Include RTL, keyboard/focus behavior, responsive layout, and loading/error states when affected. Browser visual success does not establish Android WebView compatibility or replace unit/integration tests. Keep failed, blocked, and unexecuted checks explicit.

Maintain the same review sequence in `docs/ai/cursor-review.md`. Visual refinement and a same-chat validation pass are not independent approval.

For token audits, treat captured images and element details as task context. Targeted visual input may reduce clarification, but makes no guarantee about total cost. Use actual usage evidence and quality results in `docs/ai/token-usage.md`; add no tool-call limits. Prefer the developer's configured model unless a change is requested.

Complete the local Design Mode checks in `docs/ai/platform-capabilities.md`. Repository support is implemented; installed-client activation and behavior remain unverified until exercised there.
