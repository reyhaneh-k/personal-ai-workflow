# Personal AI Project Manual

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

The sections below are **templates awaiting project-specific content**. Their prompts do not establish conventions. Fill them with reviewed guidance and source references through the meeting-first, standalone AI-only change process. Keep missing answers explicit. Existing baseline notes below are preserved; confirm version-sensitive facts against the current repository before relying on them.

## Section templates

| Section | Content to supply |
| --- | --- |
| [Product, domain, and behavior](manual-product.md) | Feature intent, domain terms, user-visible behavior, or business rules. |
| [Architecture, navigation, and dependencies](manual-architecture.md) | Locating a change, identifying consumers, routing, or changing boundaries. |
| [Coding structure and conventions](manual-coding.md) | Writing, reviewing, or restructuring frontend code. |
| [Design system and Figma translation](manual-design.md) | Visual UI, components, styling, interactions, or responsive behavior. |
| [API contracts and networking](manual-api.md) | Endpoints, network adapters, request/response models, or error handling. |
| [Server state, client state, and persistence](manual-state.md) | Queries, mutations, caches, stores, or persisted data. |
| [Authentication, permissions, and privacy](manual-security.md) | Identity, permissions, sensitive data, storage, or production evidence. |
| [Persian, RTL, and formatting](manual-localization.md) | Text, layout direction, translation keys, numbers, currency, or dates. |
| [Accessibility and inclusive interaction](manual-accessibility.md) | Interactive UI, keyboard/focus behavior, forms, semantics, or an accessibility audit. |
| [Browsers, devices, and webviews](manual-compatibility.md) | Selecting a test matrix or handling browser/native-container differences. |
| [Testing and completion evidence](manual-testing.md) | Planning checks, adding tests, reviewing coverage, or claiming completion. |
| [Sentry, analytics, and operational evidence](manual-observability.md) | Production investigations, logging, analytics, or monitoring. |
| [Performance and resource budgets](manual-performance.md) | Performance audits or changes to loading, rendering, bundles, or resource use. |
| [MR preparation, release, and rollback](manual-delivery.md) | Preparing/reviewing an MR or assessing a release. |

The existing baseline follows. It is evidence to build from, not a substitute for filling the section templates.

## Product scope

- Immediate scope: this workflow frontend.
- Later possible scopes: Personal Android application and Personal dashboard application.
- Android-native work is outside this repository, but this web application contains Android webview integrations that may be affected by frontend changes.

## Verified technical baseline

From the current repository:

- React 19 and TypeScript
- Vite 8
- TanStack Router with file-based routes
- TanStack Query for server state
- Tailwind CSS 4
- Zustand for client state
- i18next and react-i18next for localization
- Vitest and Testing Library
- Sentry React integration
- Android webview bridge code
- RTL-oriented interface behavior

Treat `package.json` and the lockfile as authoritative for installed versions.

## Main source areas

| Path | Responsibility |
| --- | --- |
| `src/routes/` | File-based route definitions and route-local UI |
| `src/pages/` | Page-level implementations and feature sections |
| `src/components/ui/` | Reusable UI primitives |
| `src/components/shared/` | Shared product components |
| `src/components/modules/` | Larger domain modules |
| `src/network/` | HTTP infrastructure, operations, request models, and query logic |
| `src/stores/` | Zustand and other client-side stores |
| `src/hooks/` | Reusable React hooks |
| `src/providers/` | Application providers and cross-cutting React context |
| `src/services/` | Application services such as localization |
| `src/utils/` | Shared utilities, platform helpers, Android bridge, and third parties |
| `locales/` | Translation resources |

## Existing commands

| Command | Purpose | Important behavior |
| --- | --- | --- |
| `pnpm dev` | Start the Vite development server | Runs on port 3000 |
| `pnpm build` | Create a production build | May include environment-dependent integrations |
| `pnpm webview` | Build and preview local webview mode | Serves on port 8080 |
| `pnpm test` | Run Vitest | Confirm whether interactive or run mode is appropriate |
| `pnpm lint` | Run ESLint | Current script includes `--fix` and therefore mutates files |
| `pnpm format` | Run Prettier | Current script writes files |

Agents must distinguish checking from fixing. Do not run mutating quality commands during a read-only review.

## Supported browser baseline

The current `browserslist.production` declares:

- Chrome 90+
- Firefox 90+
- Edge 90+
- Safari 15+
- iOS 15+
- maintained browsers excluding Opera Mini

This is a build-support baseline, not proof that every feature has been manually tested on every platform.

## Cross-cutting concerns

Evaluate these when relevant:

- Persian text and RTL layout
- translation keys and long localized content
- desktop, tablet, and phone layouts
- Safari and iOS browser behavior
- Android webview bridge calls and feature availability
- authentication and private/public route boundaries
- loading, empty, partial, error, and retry states
- TanStack Query cache invalidation and refetch behavior
- analytics and telemetry impact
- Sentry error and trace context
- accessibility and keyboard operation
- monetary precision and formatting
- Jalali/Gregorian date behavior

## Current gaps requiring human decisions

- Canonical product overview and glossary
- Approved component and naming conventions beyond existing code evidence
- Authoritative API documentation location
- Required device and Android webview version matrix
- GitLab project URL, default branch, and MR template
- Minimum test expectations by task type
- Analytics-event ownership and naming policy
- Definition of high-risk frontend changes

Until these are decided, an agent must identify the missing item and ask when it materially affects the task.
