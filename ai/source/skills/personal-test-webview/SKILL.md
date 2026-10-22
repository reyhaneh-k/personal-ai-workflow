---
name: personal-test-webview
description: Independently test Personal frontend behavior inside the Android webview and its native bridge, with explicit emulator or device evidence.
---

# Test Personal Android webview behavior

## Manual context

For interactive browser execution in Cursor, read `docs/ai/cursor-browser.md` for setup, session/data preflight, evidence, and fallback handling. Use actual available capabilities; native browser checks do not establish cross-browser or Android WebView coverage.

Required sections: `docs/ai/manual-testing.md`, `docs/ai/manual-compatibility.md`.

Read these additional sections when their trigger applies:

- intended flow and roles: `docs/ai/manual-product.md`.
- bridge location or shared consumers: `docs/ai/manual-architecture.md`.
- responsive or visual behavior: `docs/ai/manual-design.md`.
- network and failure behavior: `docs/ai/manual-api.md`.
- persisted state: `docs/ai/manual-state.md`.
- authentication, permissions, or sensitive data: `docs/ai/manual-security.md`.
- Persian, RTL, keyboard, or formatting: `docs/ai/manual-localization.md`.
- interaction accessibility: `docs/ai/manual-accessibility.md`.
- webview telemetry: `docs/ai/manual-observability.md`.
- memory or loading constraints: `docs/ai/manual-performance.md`.

Follow the reading contract in `AGENTS.md`. The required and conditional lists above are authoritative for this skill. Consult `docs/ai/manual-routing.md` only for a mixed task or an impact not covered above. Record selected sections and material gaps in the context manifest.

## Inputs

Require the affected flow, confirmed bridge contract, Android application/build reference, frontend environment, supported webview/device matrix, test account/state, and acceptance criteria. If the Android application, emulator, device, or bridge specification is unavailable, report the affected checks as blocked rather than substituting desktop behavior.

## Workflow

1. Verify the frontend local-webview build path from current repository scripts and run its non-interactive build step where possible.
2. Classify evidence as desktop preview, Android emulator, or real Android device.
3. Separate webview purposes: test new container behavior and affected existing bridge/container behavior for regression protection. Cover applicable navigation/back handling, bridge method availability and payloads, authentication/session behavior, storage, downloads/uploads, permissions, deep links, lifecycle/resume, keyboard/viewport changes, offline/network failures, and external-link handling.
4. Confirm the browser fallback when the bridge is absent if the affected code supports one.
5. Inspect sanitized console, network, bridge, and Sentry evidence without changing device or application configuration.
6. Record Android version, webview version, app build, device/emulator, viewport/orientation, steps, expected result, actual result, and evidence.
7. Mark every scenario passed, failed, blocked, not run, or not applicable and identify its purpose as new behavior, regression, or both. A desktop local-webview preview is build evidence, not native-container verification.

Return findings first, then the device matrix, bridge scenarios, evidence, coverage gaps, and status. Do not edit frontend, Android, or test code in this role.
