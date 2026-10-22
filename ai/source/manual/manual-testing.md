# Testing and completion evidence

Status: PARTIAL — the level-versus-purpose model and evidence contract are adopted; project-specific test locations, fixtures, and full runnable suites are not yet established.

Read when: Planning checks, adding tests, reviewing coverage, or claiming completion.

## Contents

- [Two-axis testing model](#two-axis-testing-model)
- [Testing levels](#testing-levels)
- [Testing purposes](#testing-purposes)
- [Required level-purpose matrix](#required-level-purpose-matrix)
- [Test strategy by change type](#test-strategy-by-change-type)
- [Fixtures and test conventions](#fixtures-and-test-conventions)
- [Commands and environments](#commands-and-environments)
- [Evidence and completion](#evidence-and-completion)
- [Evidence and open questions](#evidence-and-open-questions)

## Two-axis testing model

Testing **level** and testing **purpose** are separate decisions.

- Level identifies the technical scope being exercised: unit, integration, browser E2E, or Android webview.
- Purpose identifies why the check exists: new behavior, regression protection, acceptance verification, defect reproduction, or another task-specific objective.
- Regression testing is not a separate level. A regression check can exist at every applicable level.
- Do not require every level for every task. Select the smallest set that gives reliable evidence for the changed behavior and affected boundaries.
- Prefer durable automated regression coverage at the lowest reliable level. Add higher-level coverage when the defect or risk depends on integration, navigation, browser behavior, or the native container.

## Testing levels

| Level | Scope | Primary responsibility | Current repository status |
| --- | --- | --- | --- |
| Unit | An isolated function, hook, component behavior, formatter, validator, or other bounded unit | Implementer writes it; test verifier independently runs it | Vitest is configured, but application unit tests are not yet established |
| Integration | Interactions across components, hooks, stores, router, query/cache, API adapters, persistence, or other boundaries | Implementer writes it; test verifier independently runs it | No approved integration-test convention or established application suite yet |
| Browser E2E | A complete user journey in a supported browser | E2E tester executes it; implementer may add harness tests when a harness is approved | Platform browser testing is available; no committed Playwright/Cypress harness is established |
| Android webview | Frontend behavior that depends on the Android container or native bridge | Webview tester executes it with emulator or real-device evidence | Requires the confirmed bridge contract and device/emulator access |

Static checks, builds, linting, type checks, screenshots, and code review provide useful evidence but are not substitutes for these behavioral levels.

## Testing purposes

At each applicable level, classify the purpose of every scenario:

- **New behavior:** proves the requested behavior or acceptance criterion.
- **Regression protection:** proves affected existing behavior still works or preserves a previously fixed defect.
- **Defect reproduction:** demonstrates the failure before a fix and the same scenario passing afterward.
- **Acceptance verification:** connects an acceptance criterion to observable evidence; it may reuse a new-behavior or regression scenario.
- **Non-functional verification:** covers accessibility, performance, security, localization, compatibility, or observability when the task requires it.

One test may serve more than one purpose, but its purposes must be stated rather than inferred from its filename.

## Required level-purpose matrix

Every implementation task must plan and reconcile this matrix. Add rows for distinct scenarios when one level contains materially different coverage.

| Level | New behavior | Regression | Automated? | Status | Evidence or reason |
| --- | --- | --- | --- | --- | --- |
| Unit | applicable / not applicable | applicable / not applicable | yes / no | passed / failed / blocked / not run / not applicable | Test file and command, or reason |
| Integration | applicable / not applicable | applicable / not applicable | yes / no | passed / failed / blocked / not run / not applicable | Test file and command, or reason |
| Browser E2E | applicable / not applicable | applicable / not applicable | harness / agent browser / manual / no | passed / failed / blocked / not run / not applicable | Journey, browser, and evidence, or reason |
| Android webview | applicable / not applicable | applicable / not applicable | harness / emulator / device / manual / no | passed / failed / blocked / not run / not applicable | Build/device/bridge evidence, or reason |

`Not applicable` requires a concrete scope reason. `Not run` means the check was applicable but was not executed. `Blocked` requires the blocking dependency or access. Neither status is a pass.

## Test strategy by change type

For each task, choose levels using the changed behavior, affected boundaries, failure risk, and reproducibility—not a fixed quota.

- Pure deterministic logic normally needs unit coverage for new behavior and affected regressions.
- Component, hook, router, store, query/cache, API-adapter, or persistence interactions normally need integration coverage in addition to focused unit coverage where useful.
- Complete navigation, authentication, transaction-like, or multi-step user journeys normally need browser E2E evidence.
- Native bridge, lifecycle, permission, back-navigation, download/upload, deep-link, or container-only behavior needs Android webview evidence; desktop browser emulation is insufficient.
- A bug fix needs a regression scenario at the lowest level that reliably reproduces it, plus any higher level required by the failure boundary.

- Approved guidance: the level-versus-purpose model above.
- Project-specific examples: **TODO**

## Fixtures and test conventions

To document: Test locations, naming, mocks, network simulation, deterministic data, and sensitive-data restrictions.

- Approved guidance: **TODO**
- Source or reviewed example: **TODO**

## Commands and environments

To document: Read-only test commands, interactive versus run modes, environment prerequisites, and CI equivalents.

- Approved guidance: **TODO**
- Source or reviewed example: **TODO**

## Evidence and completion

Completion evidence includes the reconciled level-purpose matrix, acceptance-criterion mapping, exact executed commands, selected files/scenarios, environment, results, and unresolved gaps.

- Approved guidance: use passed, failed, blocked, not run, and not applicable exactly as defined above; never infer that unexecuted testing passed.
- Source or reviewed example: **TODO**

## Evidence and open questions

- Authoritative source and version/revision: **TODO**
- Decision or meeting reference for adopted guidance: **TODO**
- Unresolved questions and affected tasks: **TODO**

The adopted model and evidence contract above are active guidance. Remaining TODO prompts are not project policy. Preserve unknown project-specific conventions; do not fill them by guessing. If missing guidance materially affects the task, ask for it before implementing that part. Other sections being unfinished is not itself a blocker. Task-specific answers do not silently become permanent manual rules.
