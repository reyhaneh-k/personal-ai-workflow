# Context7 Activation and Use

Context7 is the preferred optional lookup service for current third-party library and framework documentation. Developers should generally activate it in the AI platform they currently use. Activating it in every installed platform is unnecessary.

Context7 is not a Personal product-knowledge source. It cannot override approved requirements, designs, private API contracts, repository behavior, local types, or the versions installed by this project.

## Decision flow

```text
Need external library behavior?
        |
        v
Identify the installed library version
        |
        v
Is Context7 enabled and connected in this platform?
        | no ----------------------> official versioned web documentation
        v yes
Is request capacity available?
        | no/blocked/unavailable --> official versioned web documentation
        v yes
Run a narrow version-matched Context7 lookup
        |
        v
Relevant evidence returned?
        | no ----------------------> official versioned web documentation
        v yes
Use and cite the retrieved evidence
```

“Capacity” means Context7 request allowance, not model tokens. With an API key, `pnpm ai:context7-status` checks the read-only usage endpoint; Context7 documents that this usage check does not consume a request. With platform-managed OAuth and no API key available to the repository script, perform the intended narrow lookup and treat success as evidence only for that lookup. Never claim a numeric remainder without a usage response, dashboard value, or rate-limit headers.

## Before activation

1. Decide which current platform needs Context7: Codex, Cursor, or Claude Code.
2. Prefer the hosted HTTP MCP server unless local or organizational requirements call for the npm server.
3. Choose platform OAuth when supported, or create a Context7 API key for higher limits and deterministic usage checks.
4. Never commit an API key or paste it into repository documentation.
5. If using `.env.ai.local`, copy `.env.ai.example`, set `CONTEXT7_API_KEY`, and confirm the local file is ignored.

The repository environment file supports the capacity script. It does not automatically authenticate every editor MCP connection. Configure the platform connection separately using its authentication storage or environment-variable support.

## Codex

### Recommended plugin path

Context7 publishes a Codex plugin that connects the hosted MCP server and starts an OAuth login:

```text
codex plugin marketplace add upstash/context7
codex plugin add context7@context7-marketplace
```

Start a new Codex thread after installation, then verify Context7 is enabled and its documentation tools are available.

### MCP-only alternative

Context7 also documents a local MCP setup:

```text
codex mcp add context7 -- npx -y @upstash/context7-mcp --api-key YOUR_API_KEY
codex mcp list
```

Keep the real key in local platform configuration or an approved environment mechanism; never write it into this repository. Prefer the plugin/OAuth path when it avoids a plaintext credential in local command configuration.

## Cursor

Open **Cursor Settings → Tools & MCP → New MCP Server** and add the hosted server. For a personal installation, prefer the global user configuration rather than committing a developer credential to the repository:

```json
{
  "mcpServers": {
    "context7": {
      "url": "https://mcp.context7.com/mcp",
      "headers": {
        "Authorization": "Bearer ${env:CONTEXT7_API_KEY}"
      }
    }
  }
}
```

Set `CONTEXT7_API_KEY` in the environment that launches Cursor. Cursor supports environment interpolation in MCP headers. If OAuth is used instead, complete the platform login and leave the header out. Restart Cursor after configuration, then inspect Context7 under **Tools & MCP** or run `agent mcp list` in Cursor CLI.

The ignored local `.cursor/mcp.json` on one machine is not team installation evidence. Each developer must verify their own connection.

## Claude Code

For a user-scoped hosted connection with an API key:

```text
claude mcp add --scope user --header "Authorization: Bearer YOUR_API_KEY" --transport http context7 https://mcp.context7.com/mcp
claude mcp list
```

Run `/mcp` inside Claude Code and confirm the server reports connected. Remove `--scope user` only when a deliberately project-scoped configuration is desired. Do not commit a real key in `.mcp.json`.

## Capacity check

When `CONTEXT7_API_KEY` is present in the process environment or `.env.ai.local`:

```text
pnpm ai:context7-status
```

The command reports only non-secret capacity information:

- whether a local API key was configured and authenticated, without claiming that platform OAuth is disabled;
- plan label;
- used and included requests;
- remaining included requests;
- reset time;
- `available`, `exhausted`, or `unknown` capacity; and
- whether the agent should use Context7, use official web documentation, or check platform-managed Context7 authentication when no local API key is available.

For paid plans, included requests may be followed by paid extra requests until the configured spending limit is reached. The script evaluates the usage response but does not authorize spending; organizational billing policy still applies.

## Agent lookup contract

All Personal teammates inherit the policy in `AGENTS.md`:

1. Inspect `package.json`, the lockfile, installed types, or runtime evidence to establish the library version.
2. Use Context7 only when external library documentation is needed.
3. Ask a narrow question. Include the Context7 library ID and installed version when known to avoid an unnecessary resolution call.
4. Do not request an entire documentation corpus when one API or behavior is needed.
5. If Context7 reports `401`, `402`, `429`, a connection failure, missing version coverage, or irrelevant evidence, stop retrying and switch to web search.
6. In web search, prefer the library owner's official versioned documentation, release notes, source repository, and standards documentation. Avoid blogs and aggregators when a primary source exists.
7. State the installed version, lookup path, sources used, and any mismatch or uncertainty.
8. Record Context7 as `tool: "context7"` in the monthly tool audit when telemetry is available; record the web switch as a fallback.

## Verification prompt

Use a harmless library already installed by Personal. Ask the agent to identify its installed version and answer one narrow API question. The result passes when it:

- identifies the version from repository evidence;
- uses Context7 without being explicitly reminded when capacity is available;
- switches to official web documentation when Context7 is unavailable or exhausted;
- identifies which path it used; and
- does not treat external documentation as a product requirement.

## Official references

- [Context7 MCP clients](https://context7.com/docs/resources/all-clients)
- [Context7 API and rate limits](https://context7.com/docs/api-guide)
- [Context7 usage endpoint](https://context7.com/docs/api-reference/usage/get-api-usage)
- [Cursor MCP configuration](https://cursor.com/docs/mcp)
- [Claude Code MCP configuration](https://code.claude.com/docs/en/mcp)
- [OpenAI MCP setup pattern](https://developers.openai.com/learn/docs-mcp)
