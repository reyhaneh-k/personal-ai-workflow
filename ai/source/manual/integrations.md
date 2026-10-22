# Integration Strategy

MCP, approved REST APIs, local CLIs, and supplied files/exports are alternative access paths. Figma and Sentry do not have a silent default: the developer chooses the path for the task after a human-visible preflight. All access is read-only unless a human explicitly authorizes a specific write.

Local REST and reporting credentials follow `docs/ai/credentials.md`. Platform-managed MCP OAuth remains in the platform's authentication storage rather than the repository environment files.

## Human-visible source preflight

Before the first provider-data request, unless the developer already selected a source in the task, report:

```md
## Integration preflight
- Target: Figma | Sentry
- Need: exact nodes, issues, events, or release evidence required
- Estimated MCP calls: number or range
- MCP status: available/authenticated | unavailable | unknown
- MCP capacity: sufficient | insufficient | unknown
- Capacity basis: exposed remaining/reset data, published entitlement only, or unavailable
- Alternatives: supplied files/exports and/or read-only REST API
- Recommendation: MCP | files/export | API
- Fallback: ask whether an automatic fallback is allowed for this task
```

Ask the developer whether to use MCP. Do not access provider data before the choice. If they choose MCP, perform the smallest available read-only capability/quota check before content retrieval. A check must not be described as exact unless the provider exposes current remaining usage and reset data.

Estimate the calls required for the current task. Capacity is `sufficient` only when known remaining capacity covers that estimate; it is `insufficient` when known remaining capacity does not. A published plan/seat ceiling without current usage is `unknown`, not sufficient. If the client or server does not expose quota metadata, say so.

If MCP is unavailable, unauthenticated, insufficient, or becomes rate-limited:

1. tell the developer what was observed, including retry/reset information when exposed;
2. do not loop or repeatedly probe;
3. use the developer-approved file/export or read-only API fallback; if fallback was not pre-authorized, ask first;
4. state the source actually used, its version/freshness, and any evidence that could not be retrieved.

MCP and REST budgets are separate unless provider documentation establishes otherwise. Check and report the chosen fallback's own limits. Never infer capacity from a successful call alone.

## Figma

For remote MCP connection setup without replacing personal platform settings, use `docs/ai/figma-mcp.md`. Setup is separate from the per-task access choice below.

Available paths are an authenticated Figma MCP supported by the current client, read-only REST access, or supplied node-specific exports. Paid MCP access is not required.

For MCP, use an identity/entitlement tool such as `whoami` only after the developer selects MCP. Figma documents plan/seat call ceilings, and `whoami` is exempt from read-tool limits, but published documentation does not establish a standard tool that reports the caller's current remaining MCP calls. Unless the connected client exposes current usage, report remaining capacity as unknown. Batch node retrieval and stop on the first rate-limit response.

For REST, current limits vary by endpoint tier, seat, plan, resource, and token type. A `429` supplies retry/plan information; a normal response is not proof of remaining capacity. Store credentials outside the repository, record the design version/export date, minimize requests, and never infer missing states.

Required task evidence: node URL or exports, relevant breakpoints, component states, interactions, typography, spacing, assets, and responsive notes.

Official references:

- [Figma MCP rate limits and access](https://developers.figma.com/docs/figma-mcp-server/rate-limits-access/)
- [Figma REST rate limits](https://developers.figma.com/docs/rest-api/rate-limits/)

## Sentry

Available paths are an authenticated read-only Sentry MCP, supplied sanitized exports, or `scripts/ai/sentry-readonly.mjs` with `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, and `SENTRY_PROJECT` configured through the routine AI environment profile or the process environment.

Use only read tools from an MCP. A hosted or client-specific MCP may not expose underlying rate-limit headers or a quota tool; report capacity as unknown when it does not. Do not use MCP tools that resolve, assign, comment, create, update, or delete.

Sentry REST limits are endpoint-specific. API responses expose maximum, remaining, reset, concurrent maximum, and concurrent remaining values in headers; the repository utility reports these without exposing the token. Avoid polling, request compact lists first, and retrieve event details only for selected issues.

The Sentry monitor uses `personal-investigate-sentry` and `personal-release-health`. It cannot be activated until credentials, environment, cadence, and notification behavior are configured.

Official reference: [Sentry API rate limits](https://docs.sentry.io/api/ratelimits/)

## API documentation

Use, in order: versioned OpenAPI, committed generated schemas, approved internal export, then a specific authenticated endpoint document. Do not reverse-engineer undocumented behavior from request names.

## Context7

Developers are generally recommended to activate Context7 in the AI platform they currently use. It supplies current third-party library and framework documentation; it is not an authority for Personal product requirements, approved designs, Figma behavior, private API contracts, repository behavior, or installed types. Installation remains per developer and is not required for tasks that do not need external library documentation.

For a library-dependent question:

1. identify the installed package and version from the manifest, lockfile, local types, or runtime evidence;
2. determine whether Context7 is enabled and connected in the current platform;
3. when `CONTEXT7_API_KEY` is configured, run `pnpm ai:context7-status` to check the current request allowance without printing the key;
4. if capacity is available, query Context7 narrowly and request documentation matching the installed version;
5. if authenticated through platform OAuth and no separate API key is available for the usage check, make the intended narrow lookup rather than a wasteful probe; success is capacity evidence for that lookup only;
6. if Context7 is disabled, unauthenticated, exhausted, rate-limited, unavailable, lacks the library/version, or returns insufficient evidence, use web search against official versioned library documentation and other primary sources;
7. report whether Context7 or web search supplied the evidence and note any version mismatch.

Context7 quotas are request allowances, not model tokens. Do not claim remaining capacity when neither the usage endpoint, dashboard, response headers, nor a successful request establishes it. Do not retry a rate-limited request repeatedly. Record Context7 calls, returned-context tokens when measurable, failures, and web fallbacks in the tool-usage audit.

See `docs/ai/context7.md` for activation and verification on Codex, Cursor, and Claude Code.

## GitLab

The default workflow prepares a human-opened MR creation link. Remote MR review may later use `glab` or a narrowly scoped read-only token. No agent may push, create, approve, merge, deploy, or enable auto-merge by default.

## Browser and webview testing

Use each platform's approved browser capability or project test tooling for browser checks. Android webview behavior that depends on the native bridge requires an emulator or real-device test; desktop browser success is not sufficient evidence.

See `docs/ai/platform-setup.md` and `docs/ai/platform-capabilities.md` for platform ownership and status.
