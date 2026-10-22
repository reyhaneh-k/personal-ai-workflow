# Project AI Manual

## Contents

- [How to use this manual](#how-to-use-this-manual)
- [Section templates](#section-templates)
- [Product scope](#product-scope)
- [Verified technical baseline](#verified-technical-baseline)
- [Main source areas](#main-source-areas)
- [Existing commands](#existing-commands)
- [Supported browser baseline](#supported-browser-baseline)
- [Cross-cutting concerns](#cross-cutting-concerns)
- [Current gaps requiring human decisions](#current-gaps-requiring-human-decisions)

## How to use this manual

This is the manual's index, not a document every skill must load in full. Keep `AGENTS.md` mandatory and use the skill's manual-context block to select subject files. Consult [the reading map](manual-routing.md) only for mixed tasks, an impact absent from the skill, or AI-system maintenance.

**Read `PROJECT.md` first** for product identity, SCM host, verification commands, and capability flags (`localization`, `webview`, `sentry`, `figma`). The sections below are **templates**. Fill them with reviewed guidance for this repository through the meeting-first, standalone AI-only change process. Keep missing answers explicit. Do not invent stack, path, or integration facts that contradict `PROJECT.md`.

## Section templates

| Section | Content to supply | When |
| --- | --- | --- |
| [Product, domain, and behavior](manual-product.md) | Feature intent, domain terms, user-visible behavior, or business rules. | Always when product behavior matters |
| [Architecture, navigation, and dependencies](manual-architecture.md) | Locating a change, identifying consumers, routing, or changing boundaries. | Structural or routing work |
| [Coding structure and conventions](manual-coding.md) | Writing, reviewing, or restructuring application code. | Implementation and review |
| [Design system and Figma translation](manual-design.md) | Visual UI, components, styling, interactions, or responsive behavior. | When `figma` is on or UI design applies |
| [API contracts and networking](manual-api.md) | Endpoints, network adapters, request/response models, or error handling. | API-related work |
| [Server state, client state, and persistence](manual-state.md) | Queries, mutations, caches, stores, or persisted data. | State-related work |
| [Authentication, permissions, and privacy](manual-security.md) | Identity, permissions, sensitive data, storage, or production evidence. | Auth or privacy-sensitive work |
| [Localization and formatting](manual-localization.md) | Text, layout direction, translation keys, numbers, currency, or dates. | When `localization` is on |
| [Accessibility and inclusive interaction](manual-accessibility.md) | Interactive UI, keyboard/focus behavior, forms, semantics, or an accessibility audit. | Interactive UI |
| [Browsers, devices, and webviews](manual-compatibility.md) | Selecting a test matrix or handling browser/native-container differences. | Compatibility work; webview subsections only when `webview` is on |
| [Testing and completion evidence](manual-testing.md) | Planning checks, adding tests, reviewing coverage, or claiming completion. | Verification |
| [Sentry, analytics, and operational evidence](manual-observability.md) | Production investigations, logging, analytics, or monitoring. | When `sentry` is on or observability applies |
| [Performance and resource budgets](manual-performance.md) | Performance audits or changes to loading, rendering, bundles, or resource use. | Performance work |
| [MR/PR preparation, release, and rollback](manual-delivery.md) | Preparing/reviewing a merge request or assessing a release. | Delivery; follow SCM host in `PROJECT.md` |

## Product scope

Copy from `PROJECT.md` and keep this section short:

- Immediate product scope: _(from PROJECT.md purpose)_
- Out of scope for this repository: _(list explicitly)_
- Optional integrations enabled: localization / webview / sentry / figma — _(match PROJECT.md flags)_

## Verified technical baseline

Document only facts verified in **this** repository. Prefer `package.json` and the lockfile for versions. Example placeholders (replace or delete):

- Languages / frameworks:
- Bundler, router, server state, client state:
- Styling / design system:
- Test runners:
- Observability (only if `sentry` is on):

## Main source areas

Fill paths that exist in this project. Delete rows that do not apply.

| Path | Responsibility |
| --- | --- |
| _(e.g. `src/routes/`)_ | |
| _(e.g. `src/components/`)_ | |
| _(e.g. `locales/`)_ | Only if `localization` is on |
| _(bridge / webview paths)_ | Only if `webview` is on |

## Existing commands

List standard verification and quality commands from `PROJECT.md`. Agents must distinguish checking from fixing. Do not run mutating quality commands during a read-only review.

| Command | Purpose | Important behavior |
| --- | --- | --- |
| _(e.g. `pnpm test`)_ | | |

## Supported browser baseline

Record the project's supported browsers/devices when known. This is a build-support baseline, not proof that every feature was manually tested on every platform. Add webview/device matrix rows only when `webview` is on.

## Cross-cutting concerns

Evaluate when relevant and when the matching `PROJECT.md` flag is on:

- Localization, layout direction, and formatting (`localization`)
- Desktop, tablet, and phone layouts
- Native webview bridge and container behavior (`webview`)
- Authentication and private/public route boundaries
- Loading, empty, partial, error, and retry states
- Cache invalidation and refetch behavior
- Sentry / telemetry impact (`sentry`)
- Accessibility and keyboard operation
- Design-system and Figma consistency (`figma`)

## Current gaps requiring human decisions

Track open decisions here (examples):

- Canonical product overview and glossary
- Approved component and naming conventions beyond existing code evidence
- Authoritative API documentation location
- Device / webview matrix (if `webview` is on)
- SCM project URL, default branch, and MR/PR template
- Minimum test expectations by task type
- Analytics-event ownership and naming policy
- Definition of high-risk changes

Until these are decided, an agent must identify the missing item and ask when it materially affects the task.
