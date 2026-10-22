---
name: personal-token-usage-audit
description: Generate monthly, privacy-safe token usage charts and improvement signals for Personal's Codex, Cursor, and Claude workflows from verified exports.
---

# Audit AI token usage

## Manual context

When presenting results in a Canvas, use the current platform's `personal-canvas-report` skill for the stable layout and formatting contract. Pass completed evidence to it; do not repeat this workflow solely for rendering.

This is an AI operations audit. Read `docs/ai/token-usage.md` and `docs/ai/token-optimization.md`; it does not require product-manual sections unless the human separately asks for product analysis.

1. Identify the product actually measured: Codex workspace, OpenAI API, Cursor, Claude Code subscription, or Anthropic API. Do not merge them merely because they use the same model family.
2. Prefer an official admin export or usage API. Never scrape private local chat history, prompts, source code, or credentials. Missing usage is unknown, not zero.
3. Convert only aggregate fields into the canonical schema in `docs/ai/token-usage.md`. Keep raw exports outside the repository and remove personal identifiers during conversion.
4. Label every record `exact` or `estimated`. Do not convert plan limits, remaining percentages, messages, requests, or credits into tokens unless the provider supplies a documented conversion for that record.
5. Run `node scripts/ai/token-usage-audit.mjs --input <canonical-file> --output <private-report-directory>`.
6. Review trends alongside completed tasks, quality, rework, defects, and cycle time. Recommend a small testable change; do not optimize for fewer tokens at the cost of worse outcomes.
7. Communicate coverage gaps and the next collection action. Do not upload reports or schedule collection without explicit authorization and configured read-only access.

For a Cursor report that benefits from interactive comparison, read `docs/ai/cursor-canvas.md` and render its monthly-usage view from the generated report/CSV/SVG outputs. Preserve exact/estimated and missing-data distinctions; retain those outputs and do not republish or recollect evidence solely for presentation.
