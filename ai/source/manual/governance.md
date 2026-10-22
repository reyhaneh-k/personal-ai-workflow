# AI change governance

## Contents

- [Policy](#policy)
- [Meeting-first proposals](#meeting-first-proposals)
- [Standalone merge requests](#standalone-merge-requests)
- [Checks and enforcement](#checks-and-enforcement)

## Policy

AI-file changes must first be discussed in a team meeting. No individual, including the designated engineering owner, is assigned ownership of AI policy. His existing repository/release role does not give him unilateral AI-policy approval authority.

Anyone may suggest improvements. Agents must not change their instructions during ordinary feature work. Discuss the proposal, record the team's outcome and agreed scope, then implement agreed changes in a standalone AI-only MR.

## Meeting-first proposals

1. Use the **AI_change_proposal** issue template to describe the problem, evidence, proposed behavior, affected files/platforms, validation, and rollback.
2. Discuss the proposal in a team meeting before implementation.
3. Record the meeting reference, participants, discussion summary, outcome, agreed scope, and open questions in an issue comment. Link meeting notes when available.
4. Implement only the agreed scope. Deferred, rejected, or unresolved proposals do not proceed.
5. Return material scope expansions to team discussion.

The record documents the team's agreement, not one person's permission. A proposal, checkbox, label, or agent recommendation is not evidence of a meeting. If the meeting outcome is missing, the agent asks for it and pauses implementation.

## Standalone merge requests

- Use a dedicated AI-change branch and the **AI_change** MR template.
- Never combine AI changes with application code, assets, translations, dependency updates, or unrelated project changes. Separate commits within one MR are not sufficient: use separate MRs.
- Commit canonical sources only, together with directly related AI generators, checks, and templates. Regenerate locally for verification; platform copies, generated documentation, and the local manifest must not be committed.
- Shared CI, ownership, root README, or ignore files may change only for the AI workflow in that MR. Reviewers must check line-level purpose; path checks alone cannot establish it.
- Link the proposal and meeting outcome, regenerate outputs, run checks, and document rollback.
- Review the final diff against the meeting agreement and follow the repository's normal review/merge requirements. This policy adds no named individual owner or special personal approval requirement.
- Merge only when the recorded scope matches, the MR stands alone, and required checks pass.

## Checks and enforcement

The policy covers `ai/`, shared instructions, platform configuration and generated copies, `docs/ai/`, `scripts/ai/`, and AI workflow files.

The `ai-validate` job checks generated output and runs tests. The `ai-change-proposal` MR job rejects mixed AI/application changes and requires:

- `AI-Proposal:` same-project GitLab issue URL.
- `AI-Meeting:` comment URL on that issue recording the team-meeting outcome and agreed scope.
- `AI-Reason:` concrete explanation.
- `AI-Validation:` concrete checks and outcomes.
- `AI-Rollback:` concrete reversal procedure.

Keep fields near the top of the MR description. The checker validates format, not whether a meeting occurred or what was agreed. Reviewers verify the linked record.

Path checks include nested instruction overrides, CI/ownership/templates, and both sides of renames. AI-sensitive changes cannot include unrelated paths. Changes to `ai:` package scripts require this process; an AI MR may change only those scripts in package.json, not dependencies or other settings. Ordinary application/dependency MRs do not require an AI proposal.

Local check against committed changes through HEAD:

```sh
node ai/governance/check-proposal.mjs --base <commit-sha> --description <local-description-file> --project-url https://gitlab.khasho.gold/personal/web
```

Missing diff evidence fails. This command does not examine uncommitted changes or contact GitLab.

### Current status

- Meeting-first instructions, templates, standalone-MR checks, and tests: implemented.
- No individual AI owner or active CODEOWNERS assignment has been configured.
- `ai/governance/CODEOWNERS.template` is optional and inactive. Activate only if the team separately agrees to review routing; it cannot replace a meeting.
- GitLab branch protections, required pipelines, and live rejection tests: unverified. No server settings were changed.

Repository CI is editable in a branch and is not a tamper-proof authorization gate. Local permissions cannot stop developers editing their own clones. Verify required pipelines and branch protections before calling this technically enforced. Test an AI-only MR with a meeting record, one missing that record, and a mixed AI/application MR.

The deployment pipeline uses bot commit-backs. Review bot access before changing branch protections to avoid bypass permissions or silently breaking deployment.
