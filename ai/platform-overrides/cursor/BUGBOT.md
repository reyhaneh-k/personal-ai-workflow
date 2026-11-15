# Personal AI Automated Review Rules

These priorities are used by Cursor Agent Review for local changes and by Bugbot for merge requests. The two services remain separate review stages.

Review only the submitted diff and behavior it can affect. Use `PROJECT.md`, `AGENTS.md`, and the linked task requirement as context. Apply only verified project requirements and enabled capability flags.

Prioritize findings that can cause:

- incorrect product behavior or unmet acceptance criteria;
- regressions in shared components, routes, authentication, or financial flows;
- API contract mismatches, unsafe retries, stale cache, or missing invalidation;
- broken native-container behavior only when `PROJECT.md` enables webview, using its confirmed platform and bridge contract;
- incorrect locale, layout direction, date, or monetary formatting only when localization is enabled and the project requires it;
- inaccessible keyboard, focus, label, or screen-reader behavior;
- browser incompatibility with the verified project browser baseline (do not assume a `browserslist` exists);
- exposure of tokens, credentials, PII, or sensitive Sentry data;
- missing error, loading, empty, disabled, partial, or success states;
- tests that do not exercise the behavior they claim to protect.

For each finding:

1. Point to the smallest relevant changed range.
2. Explain the concrete failing scenario and user impact.
3. Distinguish confirmed defects from questions or unverified risks.
4. Suggest the smallest remediation direction without rewriting the feature.

Do not report formatting preferences already enforced by tooling. Do not require unrelated refactors. Do not treat missing speculative abstractions as defects.
