# Personal AI Cursor Plugin

This package provides the Personal AI AI workflow as a portable Cursor Plugin. It contains generated skills, specialist agents, and approved Cursor rules only. It intentionally does not include MCP servers, permissions, credentials, Bugbot configuration, or personal Cursor settings.

## Local development

1. Run `pnpm ai:generate` in the Personal AI repository.
2. Copy this generated directory to `~/.cursor/plugins/local/personal-ai-workflow`.
3. Reload Cursor and confirm the plugin appears in **Customize**.

Do not use a symlink: Cursor only loads local-plugin symlinks whose targets remain inside its local-plugin directory. Re-copy this directory after an AI-source update.

For a team or public distribution, put this package in a Git repository and publish it through the applicable Cursor marketplace workflow. Review the package before publishing and do not add secrets or developer-specific configuration.
