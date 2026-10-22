# Figma MCP setup

## Connection

Figma recommends the remote endpoint `https://mcp.figma.com/mcp`; it does not require the desktop app. Desktop MCP is an alternative with plan/seat prerequisites. Check current eligibility and usage limits rather than promising unrestricted free access. See [Figma MCP guide](https://help.figma.com/hc/en-us/articles/32132100833559-Guide-to-the-Figma-MCP-server) and [remote setup](https://help.figma.com/hc/en-us/articles/35281350665623-Figma-MCP-collection-How-to-set-up-the-Figma-remote-MCP-server).

## Cursor

1. Inspect existing user/project MCP connections first. Reuse a working Figma connection rather than adding duplicates.
2. Run `node ai/generator/setup-figma.mjs` to add a missing project connection. The script does not contact Figma, erase existing servers, replace permissions, or authenticate.
3. Open Cursor's MCP settings, enable the connection as needed, and complete its sign-in/authorization flow. Never put OAuth tokens into tracked sources.
4. Confirm tools are available; with the developer's selected MCP access path, verify access using an approved node link. Keep connection, authentication, file access, and remaining capacity as separate statuses.

For manual setup, merge this entry into the existing `mcpServers` object, not over the entire file:

```json
{
  "figma": {
    "url": "https://mcp.figma.com/mcp"
  }
}
```

If the file uses comments or an existing `figma` name points elsewhere, the setup script stops without changing it. Resolve the choice manually; keep the developer's other MCPs and preferences. The remote URL is a service endpoint, not a browser origin allowlist entry.

## Other platforms

Use the current platform's supported remote MCP setup or existing Figma connection with the same endpoint. Do not copy Cursor JSON into another platform's configuration. Repository generation neither replaces personal settings nor establishes authentication in Codex or Claude. Follow the client-specific instructions linked from Figma's guide.

## Task workflow and limits

Follow `docs/ai/integrations.md` before design access: ask MCP versus export/API unless already selected, report capacity honestly, and use only the approved fallback. Installing a connection is not permission to fetch arbitrary designs.

The Personal frontend flow uses design evidence read-only. Figma also exposes write capabilities; connection does not authorize creating/editing designs, uploading UI, or changing sharing. Keep those outside normal implementation scope unless specifically requested.

- [ ] Connection present in the actual client.
- [ ] Authentication completed by the developer.
- [ ] Approved file/node access verified.
- [ ] Capacity established or explicitly unknown.
- [ ] Export/API fallback agreed for the task.
