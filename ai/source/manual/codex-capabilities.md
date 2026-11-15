# Codex capabilities and activation

The sources support current local Codex conventions. Capability support, local file presence, client discovery, and verified runtime behavior are separate states. Generation remains opt-in. This guide does not install plugins, authenticate, grant permissions, trust hooks, schedule jobs, or publish anything.

## Source-only bootstrap

In a fresh source-only chat, explicitly ask Codex to read `ai/source/instructions.md`, `ai/source/manual/reading-contract.md`, and the relevant source skill. Files under `ai/source/` are not native discovery locations. Do not interpret a healthy source audit as activation. Generate native files only on an explicit request and verify them in the intended client.

## Instructions and discovery

Codex checks the user scope under `CODEX_HOME` (default `~/.codex`) and then the repository-to-working-directory chain. At each directory it selects the first nonempty `AGENTS.override.md`, `AGENTS.md`, or configured fallback filename. Later guidance takes precedence. The combined instruction limit defaults to 32 KiB; capture effective `project_doc_max_bytes` and `project_doc_fallback_filenames` when customized. Our authoring policy still requires narrower instructions to preserve security and release boundaries; filesystem precedence alone does not enforce that policy. [Official instruction discovery](https://learn.chatgpt.com/docs/agent-configuration/agents-md)

Skills are discovered from `.agents/skills` along the repository ancestry and from user, admin, system, and plugin sources. Native Codex supports linked skill folders; our generator deliberately rejects linked sources/outputs for portable ownership safety. The auditor follows links inside its inspected scope, handles cycles, and reports excluded external targets. `--include-user` opts into inspecting global instruction and user-skill files; `--follow-external-links` separately authorizes following linked skill targets outside the repository. Admin/system/plugin discovery requires client evidence rather than guessed filesystem paths. [Official skills](https://learn.chatgpt.com/docs/build-skills)

## Native agents and skill metadata

- Source role JSON renders to `.codex/agents/<role>.toml`. Agents inherit the parent model, permissions, provider, and MCP connections unless supported model settings are explicitly overridden in the Codex adapter. Read-only is a role contract, not a separate permission sandbox. Supported feature overrides may disable capabilities; they cannot widen parent permissions.
- Delegate isolated work only when the human or applicable instructions request delegation. Pass scope, acceptance criteria, boundaries, and expected evidence. Keep editors in separate worktrees when necessary. `/subagents` inspects local CLI agent activity; a handoff recommendation does not launch an agent.
- Each Codex skill receives `agents/openai.yaml`. Author optional UI, invocation, or MCP-dependency metadata in `ai/platform-overrides/codex/skill-metadata.json`; generated YAML uses the JSON-compatible YAML subset. The unfinished orientation skill is explicitly excluded from implicit invocation. A declared dependency does not prove authentication or authorize its use.
- Use `/skills` or `$skill-name` in Codex CLI/IDE. Verify positive and negative trigger prompts in the installed surface and record any skill-list truncation warnings. Effective `skills.config` can disable a skill by path or name; the last matching selector wins. Do not increase context budgets without evidence.

[Custom agents](https://learn.chatgpt.com/docs/agent-configuration/subagents#custom-agents), [skill invocation and metadata](https://learn.chatgpt.com/docs/build-skills#optional-metadata)

## Configuration, trust, and access

Personal configuration lives in `~/.codex/config.toml`; trusted projects may add `.codex/config.toml`. Requirements constrain defaults, and CLI overrides and configuration layers affect effective settings. Do not assume a project file wins over managed requirements. Untrusted projects skip their local `.codex/` configuration, hooks, and rules. Keep personal keys and provider credentials outside tracked files. [Configuration and precedence](https://learn.chatgpt.com/docs/config-file/config-basic)

Record the installed client/version, trust state, selected profile, effective approval policy, filesystem scope, network state, configuration sources, and managed constraints. Inspect `/debug-config` locally when supported, but provide only sanitized values to the audit; never paste an entire config dump. The auditor lists config/hook/rule filenames without reading private config contents. It accepts a whitelisted `runtime.codex` evidence object and otherwise labels effective values unknown.

Choose either legacy `sandbox_mode`/`sandbox_workspace_write` or beta permission profiles; do not mix them. Existing legacy settings can override a profile. Account for Windows and managed-machine enforcement when verifying actual access. Inactive examples under `ai/platform-overrides/codex/examples/` illustrate the two alternatives and are never copied into active configuration. [Permissions](https://learn.chatgpt.com/docs/permissions)

Command `.rules` control allow/prompt/forbid decisions for commands outside the sandbox; they are not prose like Cursor `.mdc` rules. Review narrow prefixes and test match/non-match scenarios with `codex execpolicy check`. Do not turn broad shell wrappers into an allowlist. [Command rules](https://learn.chatgpt.com/docs/agent-configuration/rules)

## Workflow and integration map

| Capability | Use in this workflow | Activation and evidence |
| --- | --- | --- |
| Planning and skills | Intake, feature delivery, TDD, debugging, review | Select the appropriate skill; maintain one task record |
| Custom agents | Coordinator, implementer, reviewer, verifiers | Generate only on request; confirm discovery; delegate only when requested |
| Local review | `codex review` or an independent review chat | Record exact base/head; self-review is distinct from independent review |
| Worktrees and parallel work | Isolate concurrent editors | Use the app's worktree support or the maintained helper; record branch/base and keep generated output opt-in |
| Resume/fork and context | Continue or branch investigations | Use native chat/CLI controls; preserve task decisions and avoid copying full history |
| MCP and plugins | Current docs, Figma, Sentry, SCM, browser tools | Inspect available tools; explicitly install/connect only when requested; retain capability flags and source-selection rules |
| OpenAI Developers | OpenAI API/Agents SDK work | Optional specialist plugin; project workflow rules still apply |
| Codex Security | Authorized local security investigation | Optional plugin or CLI; verify findings; scans do not replace permissions or peer review |
| Web and browser tools | Documentation and affected user journeys | Use actual available capabilities; preserve safe test data and distinguish browser/device coverage |
| Hooks | Selected lifecycle validation or advisory context | Explicitly configure and trust exact hooks; verify event/failure behavior; no generation or duplicate review loop |
| Memory | Durable, verified project knowledge | Inspect actual client availability and sources; exclude secrets and transient evidence; keep authoritative decisions in sources |
| Scheduled automations | Explicitly requested recurring work | Configure through the app; define owner, cadence, access, and destination; task tracking alone does not authorize a recurring job |
| Noninteractive/CI | Repeatable audits, review, structured output | Use `codex exec` with bounded permissions; test exit codes and output schema; no implicit release or generation authority |
| Cloud/remote work | Approved environments and remote execution | Verify environment-specific tools, secrets, network, and policy; local config is not proof of remote enforcement |

Hooks from multiple active sources run together rather than replacing one another. Non-managed hooks require review/trust; trust can change after updates. A repository hook is not an admin-enforced security boundary. Do not bypass hook trust or modify persistent settings merely to unblock a task. [Hooks](https://learn.chatgpt.com/docs/hooks)

Plugins package capabilities and connections; skills remain the workflow authoring format. Use supported portable packaging for future distribution, not Cursor-specific manifests copied into Codex. Installation, marketplace registration, publishing, external writes, and authentication remain separate authorized operations. [Plugin packaging](https://developers.openai.com/plugins/build/plugins)

## Runtime audit evidence

Run a repository audit without accessing personal settings:

```sh
node scripts/ai/context-audit.mjs --platform codex --repository-only
node scripts/ai/context-audit.mjs --platform codex --repository-only --working-directory src/features
```

Use an existing directory; the second line is illustrative. Add `--include-user` only when user-scope inspection is intended. Supply `--codex-home <path>` only with that option. External skill links require `--follow-external-links` unless their targets are inside the explicitly inspected repository or user-skill-directory scope.

The optional `codex` object in a temporary runtime JSON file accepts only:

- `fallbackFilenames`, `maxInstructionBytes`: effective instruction settings, when known.
- `loadedInstructionPaths`: actual loaded paths from client evidence, not filesystem inference.
- `skillConfig`: effective ordered selectors, each with exactly one absolute `path` or `name` and a boolean `enabled`.
- `projectTrust`, `approvalPolicy`, `sandboxMode`, `permissionProfile`, `networkAccess`: sanitized effective states. Approval-policy values are `on-request`, `never`, `granular`, or `unknown`; network is `enabled`, `disabled`, or `unknown`.
- `configurationSources`: source filenames/labels only, never their full contents.

Omitted fields stay unknown or use explicitly labeled discovery defaults. Filesystem candidates are not a reconstruction of unknown managed configuration or proof of runtime loading. For current keys and feature availability, use the [configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference) and [CLI reference](https://learn.chatgpt.com/docs/cli/reference).
