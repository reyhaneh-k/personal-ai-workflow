# Personal AI Automated Review Rules

These priorities are used by Cursor Agent Review for local changes and by Bugbot for merge requests. The two services remain separate review stages.

Review only the submitted diff and behavior it can affect. Use `AGENTS.md`, `docs/ai/project-manual.md`, and the linked task requirement as context.

Prioritize findings that can cause:

- incorrect product behavior or unmet acceptance criteria;
- regressions in shared components, routes, authentication, or financial flows;
- API contract mismatches, unsafe retries, stale cache, or missing invalidation;
- crashes or broken behavior in the Android webview;
- incorrect RTL, Persian localization, Jalali/date, or monetary formatting;
- inaccessible keyboard, focus, label, or screen-reader behavior;
- browser incompatibility with the production `browserslist` baseline;
- exposure of tokens, credentials, PII, or sensitive Sentry data;
- missing error, loading, empty, disabled, partial, or success states;
- tests that do not exercise the behavior they claim to protect.

For each finding:

1. Point to the smallest relevant changed range.
2. Explain the concrete failing scenario and user impact.
3. Distinguish confirmed defects from questions or unverified risks.
4. Suggest the smallest remediation direction without rewriting the feature.

Do not report formatting preferences already enforced by tooling. Do not require unrelated refactors. Do not treat missing speculative abstractions as defects.
