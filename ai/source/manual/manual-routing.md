# Manual reading map

## Reading contract

Follow `docs/ai/reading-contract.md`. Use this map only for mixed tasks, unmapped impacts, or AI-system maintenance. Required and capability-conditional readings belong to each source skill. The catalog below is rendered from those lists; in a source-only checkout inspect `ai/source/skills/` directly.

## Skill and task map

<!-- SKILL_READING_TABLE -->

## Cross-cutting impact triggers

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
| Text, layout direction, translation keys, numbers, currency, or dates. | [ Localization and formatting ](manual-localization.md) |
| Interactive UI, keyboard/focus behavior, forms, semantics, or an accessibility audit. | [ Accessibility and inclusive interaction ](manual-accessibility.md) |
| Selecting a test matrix or handling browser/native-container differences. | [ Browsers, devices, and webviews ](manual-compatibility.md) |
| Planning checks, adding tests, reviewing coverage, or claiming completion. | [ Testing and completion evidence ](manual-testing.md) |
| Production investigations, logging, analytics, or monitoring. | [ Sentry, analytics, and operational evidence ](manual-observability.md) |
| Performance audits or changes to loading, rendering, bundles, or resource use. | [ Performance and resource budgets ](manual-performance.md) |
| Preparing/reviewing an MR or assessing a release. | [ MR preparation, release, and rollback ](manual-delivery.md) |
| Changes to AI instructions, skills, adapters, or routing | `docs/ai/governance.md` plus the affected section(s) |

Task-specific requirements, Figma nodes, API contracts, source code, and test results are still necessary. A manual section explains conventions; it is not a substitute for current task evidence.

## Filling the templates

Edit `ai/source/manual/manual-*.md`, not generated copies. For each section, supply approved guidance, reviewed examples, authoritative source/version, and unresolved questions. A code pattern is observed evidence until adopted as a convention. Record the team-meeting reference before adopting permanent guidance and use a standalone AI-only MR. Validate sources without writing outputs. Generate platforms only when explicitly requested; see `ai/README.md`.
