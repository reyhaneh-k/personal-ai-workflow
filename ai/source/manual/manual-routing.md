# Manual reading map

## Reading contract

Follow `AGENTS.md` and mandatory readiness/impact checks for every task. Each active skill lists its required manual sections and conditional sections. Select a skill from `docs/ai/commands.md` even when the request does not name one. This map is a validation and exception reference, not routine task context: do not read it when one active skill already covers the task and its discovered impacts. Consult it for mixed skills, an impact not routed by the active skill, or AI-system maintenance.

- Read required sections before decisions or implementation that rely on them. Reuse them if already present and unchanged in the current context; refresh after a relevant edit, handoff, or lost context.
- Add every section triggered by the actual scope, evidence, consumers, or final diff, even if it was absent from the initial skill selection. For combined tasks use the union, without duplicate reads.
- Read selected section files completely; do not substitute their headings for their contents.
- An unfinished section is a list of questions, not policy. Ask when missing information materially affects the work. Record unaffected gaps without blocking unrelated work. Do not invent answers or silently fill the manual.
- Record section paths, relevant source revisions/evidence, missing answers, and applicability in the task record. Reconcile the selection against the final diff.
- The legacy baseline in `docs/ai/project-manual.md` is preserved as evidence, not a complete approved manual. Read its relevant baseline headings when stack, paths, scripts, or build support matter; verify against the current repo.
- `personal-project-orientation` stays empty and does not authorize bulk loading or implementation.

## Skill and task map

Required sections below are repeated inside each platform's native skill for direct use. Conditional triggers live in those skills and in the impact table below.

| Skill / task | Required manual sections |
| --- | --- |
| `personal-context-audit` | Repository AI setup and `docs/ai/token-optimization.md`; no product-manual section |
| `personal-canvas-report` | `docs/ai/cursor-canvas.md`; no product-manual section for presentation; source workflow readings only for fresh analysis |
| `personal-token-usage-audit` | `docs/ai/token-usage.md`, `docs/ai/token-optimization.md`; no product-manual section |
| `personal-task-intake` | `docs/ai/manual-product.md`, `docs/ai/manual-architecture.md` |
| `personal-feature-delivery` | `docs/ai/manual-product.md`, `docs/ai/manual-architecture.md`, `docs/ai/manual-coding.md`, `docs/ai/manual-testing.md` |
| `personal-tdd` | `docs/ai/manual-coding.md`, `docs/ai/manual-testing.md` |
| `personal-ui-validation` | `docs/ai/manual-design.md`, `docs/ai/manual-testing.md`, `docs/ai/manual-compatibility.md`, `docs/ai/manual-accessibility.md`, `docs/ai/manual-localization.md` |
| `personal-implement-task` | `docs/ai/manual-product.md`, `docs/ai/manual-architecture.md`, `docs/ai/manual-coding.md`, `docs/ai/manual-testing.md` |
| `personal-implement-figma` | `docs/ai/manual-design.md`, `docs/ai/manual-coding.md`, `docs/ai/manual-localization.md`, `docs/ai/manual-accessibility.md` |
| `personal-integrate-api` | `docs/ai/manual-api.md`, `docs/ai/manual-state.md`, `docs/ai/manual-security.md`, `docs/ai/manual-testing.md` |
| `personal-debug` | `docs/ai/manual-product.md`, `docs/ai/manual-architecture.md`, `docs/ai/manual-testing.md` |
| `personal-fix-bug` | `docs/ai/manual-product.md`, `docs/ai/manual-architecture.md`, `docs/ai/manual-testing.md` |
| `personal-refactor` | `docs/ai/manual-architecture.md`, `docs/ai/manual-coding.md`, `docs/ai/manual-testing.md` |
| `personal-peer-review` | `docs/ai/manual-coding.md`, `docs/ai/manual-testing.md`, `docs/ai/manual-delivery.md` |
| `personal-verify-task` | `docs/ai/manual-testing.md`, `docs/ai/manual-compatibility.md` |
| `personal-test-e2e` | `docs/ai/manual-testing.md`, `docs/ai/manual-compatibility.md` |
| `personal-test-webview` | `docs/ai/manual-testing.md`, `docs/ai/manual-compatibility.md` |
| `personal-prepare-mr` | `docs/ai/manual-delivery.md` |
| `personal-investigate-sentry` | `docs/ai/manual-observability.md`, `docs/ai/manual-security.md` |
| `personal-release-health` | `docs/ai/manual-delivery.md`, `docs/ai/manual-observability.md` |
| `personal-accessibility-audit` | `docs/ai/manual-accessibility.md`, `docs/ai/manual-design.md`, `docs/ai/manual-compatibility.md` |
| `personal-performance-audit` | `docs/ai/manual-performance.md`, `docs/ai/manual-architecture.md`, `docs/ai/manual-compatibility.md` |
| `personal-update-ai-manual` | This map, `docs/ai/governance.md`, and only the agreed sections |
| `personal-project-orientation` | Reserved; no reading workflow yet |

## Cross-cutting impact triggers

When a selected workflow uses Cursor's native browser, also read `docs/ai/cursor-browser.md`. This conditional integration guide does not replace the skill's required product-manual sections or require browser work for non-UI tasks.

These apply to any task, not just the obvious specialist skill. Check the initial scope and final diff; load the relevant section if a trigger applies.

| Impact or question | Section |
| --- | --- |
| Feature intent, domain terms, user-visible behavior, or business rules. | [ Product, domain, and behavior ](manual-product.md) |
| Locating a change, identifying consumers, routing, or changing boundaries. | [ Architecture, navigation, and dependencies ](manual-architecture.md) |
| Writing, reviewing, or restructuring frontend code. | [ Coding structure and conventions ](manual-coding.md) |
| Visual UI, components, styling, interactions, or responsive behavior. | [ Design system and Figma translation ](manual-design.md) |
| Endpoints, network adapters, request/response models, or error handling. | [ API contracts and networking ](manual-api.md) |
| Queries, mutations, caches, stores, or persisted data. | [ Server state, client state, and persistence ](manual-state.md) |
| Identity, permissions, sensitive data, storage, or production evidence. | [ Authentication, permissions, and privacy ](manual-security.md) |
| Text, layout direction, translation keys, numbers, currency, or dates. | [ Persian, RTL, and formatting ](manual-localization.md) |
| Interactive UI, keyboard/focus behavior, forms, semantics, or an accessibility audit. | [ Accessibility and inclusive interaction ](manual-accessibility.md) |
| Selecting a test matrix or handling browser/native-container differences. | [ Browsers, devices, and webviews ](manual-compatibility.md) |
| Planning checks, adding tests, reviewing coverage, or claiming completion. | [ Testing and completion evidence ](manual-testing.md) |
| Production investigations, logging, analytics, or monitoring. | [ Sentry, analytics, and operational evidence ](manual-observability.md) |
| Performance audits or changes to loading, rendering, bundles, or resource use. | [ Performance and resource budgets ](manual-performance.md) |
| Preparing/reviewing an MR or assessing a release. | [ MR preparation, release, and rollback ](manual-delivery.md) |
| Changes to AI instructions, skills, adapters, or routing | `docs/ai/governance.md` plus the affected section(s) |

Task-specific requirements, Figma nodes, API contracts, source code, and test results are still necessary. A manual section explains conventions; it is not a substitute for current task evidence.

## Filling the templates

Edit `ai/source/manual/manual-*.md`, not generated copies. For each section, supply approved guidance, reviewed examples, authoritative source/version, and unresolved questions. A code pattern is observed evidence until adopted as a convention. Record the team-meeting reference before adopting permanent guidance and use a standalone AI-only MR. Regenerate all platforms and validate the mapping after edits.
