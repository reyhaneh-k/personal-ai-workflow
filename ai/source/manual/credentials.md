# AI Credentials and Local Environment

Personal AI scripts use explicit local environment profiles. These files are a developer convenience, not a team password vault or source of browser configuration.

## Files

| Committed template | Developer copy | Purpose |
| --- | --- | --- |
| `.env.ai.example` | `.env.ai.local` | Routine, narrow, preferably read-only integrations. |
| `.env.ai-admin.example` | `.env.ai-admin.local` | Elevated usage-reporting APIs on specifically authorized machines. |

Both local filenames match the repository's existing `*.local` ignore rule. Before adding a value, confirm `git check-ignore <file>` identifies it as ignored. Never force-add a local credential file.

Copy the relevant template, preserve its variable names, and fill only integrations the developer uses. The loader accepts a reviewed allowlist and rejects `VITE_` names, unknown variables, placeholders, symlinks, and missing required values. Existing process environment variables take precedence over file values.

## Credential placement

- Platform-managed MCP OAuth belongs in Codex, Cursor, or Claude's own authentication storage. Do not copy those tokens into these files.
- A local MCP server may use an environment variable only when its documented setup requires one and the name has been reviewed and added to the template and loader together.
- GitLab pipelines use masked/protected CI/CD variables, not either local file.
- Production application secrets do not belong in the AI profiles.
- Never use a `VITE_` prefix for a secret. Vite exposes those variables to client-side code.
- Prefer read-only, resource-scoped, expiring credentials. Rotate and revoke credentials when access changes or a device is lost.

## Routine variables

- Sentry REST fallback: `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`, optional `SENTRY_BASE_URL`.
- Figma REST fallback: `FIGMA_ACCESS_TOKEN`. This is separate from Figma MCP OAuth.
- Context7 when installed: `CONTEXT7_API_KEY` is optional for basic MCP access but provides authenticated higher limits and lets `pnpm ai:context7-status` inspect request capacity. Platform-managed OAuth remains in platform storage.
- GitLab read-only access when approved: `GITLAB_READ_TOKEN`, `GITLAB_PROJECT_ID`, optional `GITLAB_BASE_URL`.

Do not add a credential speculatively. A blank template entry is not evidence that an integration is installed, authenticated, or approved.

## Admin variables

`OPENAI_ADMIN_KEY`, `ANTHROPIC_ADMIN_KEY`, and `CURSOR_ADMIN_API_KEY` are reserved for usage collection by authorized reporting owners. Ordinary implementation, review, Figma, Sentry, and MCP work must not load the admin profile.

## Commands

Validate names without printing values:

```text
pnpm ai:env-check
pnpm ai:env-check -- --require SENTRY_AUTH_TOKEN --require SENTRY_ORG --require SENTRY_PROJECT
pnpm ai:env-check -- --profile admin --require OPENAI_ADMIN_KEY
pnpm ai:context7-status
```

The result contains only file status and `configured`, `missing`, or `placeholder` states. AI teammates must never read, display, summarize, paste, or include credential values in their context.

To add a new variable, update the appropriate example file, the allowlist in `scripts/ai/load-ai-env.mjs`, this document, and tests together. Keep the change limited to AI configuration.
