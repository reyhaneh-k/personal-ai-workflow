# Cursor sandbox policy

This repository commits a conservative Cursor policy for local agents.

- `.cursor/sandbox.json` keeps sandboxed commands inside the workspace, requires approval to read outside it, and denies network access by default.
- `.cursor/permissions.json` allows safe inspection and validation work while sending installs, remote access, Git writes, secrets, background services, and destructive actions to approval.
- `.cursorignore` reduces accidental inclusion of secrets in AI context. It does **not** restrict terminal or MCP tools, so do not treat it as a security boundary.
- `.cursor/hooks.json` runs a fail-closed guard before file reads and shell commands. It blocks obvious secret and private-key paths; an edit hook reminds agents that generated guidance must be changed at its canonical source.

## Enable it in Cursor

Use Cursor 3.23 or later. In **Settings → Agents → Approvals & Execution**, select **Auto-review** and ensure sandboxing is enabled. Select **Workspace** for Read Access. Cursor merges this repository policy with any user or team policy; more restrictive settings win.

## When an exception is legitimate

Approve a specific action instead of broadening this policy. For example, a package install may need temporary network access, and a release may need a deliberate `git push`. Do not add secrets, home-directory paths, or permanent network allowlists to this repository without a clear, reviewed need.

For unattended Cloud Agents, configure their network, secrets, and repository permissions in Cursor's cloud settings as well. This local policy does not configure those cloud controls.

## Hook design

The hooks are intentionally small and dependency-free Node scripts under `.cursor/hooks/`. They do not run formatters, tests, downloads, or telemetry. Hooks run only in trusted workspaces; the project hook file is also supported by Cursor Cloud Agents once they have a writable environment. Keep changes to hook behavior reviewable because hooks can block agent work.
