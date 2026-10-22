import test from 'node:test';
import assert from 'node:assert/strict';
import { checkChange, isProtected } from './check-proposal.mjs';

const projectUrl = 'https://gitlab.example/team/web';
const description = [
  'AI-Proposal: https://gitlab.example/team/web/-/issues/42',
  'AI-Meeting: https://gitlab.example/team/web/-/issues/42#note_123',
  'AI-Reason: Correct the cache invalidation review procedure.',
  'AI-Validation: Generator checks and regression scenarios pass.',
  'AI-Rollback: Revert the dedicated change and regenerate all outputs.'
].join('\n');
const valid = { paths: ['ai/source/instructions.md','AGENTS.md'], projectUrl, description };

test('ordinary frontend and dependency changes do not need an AI proposal', () => {
  assert.equal(checkChange({ paths: ['src/page.tsx'] }).required, false);
  assert.equal(checkChange({ paths: ['package.json'], beforePackage:{dependencies:{a:'1'}},afterPackage:{dependencies:{a:'2'}} }).required, false);
});
test('generated copies and enforcement files are all protected', () => {
  for (const p of ['ai/source/a.md','.cursor/skills/x/SKILL.md','.claude/settings.json','.agents/skills/x/SKILL.md','.codex/config.toml','src/AGENTS.md','docs/CODEOWNERS','.gitlab-ci.yml','.gitlab/merge_request_templates/AI_change.md','docs/ai/governance.md','scripts/ai/sentry-readonly.mjs','.env.ai.example','.env.ai-admin.example'])
    assert.equal(isProtected(p), true, p);
});
test('a complete proposal passes format checks without claiming approval', () => {
  assert.equal(checkChange(valid).required, true);
});

test('AI onboarding and ignore changes can accompany an AI-only migration', () => {
  assert.equal(checkChange({ ...valid, paths: ['ai/README.md', 'README.md', '.gitignore'] }).required, true);
  assert.equal(checkChange({ paths: ['README.md', '.gitignore'] }).required, false);
  assert.throws(() => checkChange({ ...valid, paths: ['ai/README.md', '.gitignore', 'src/app.tsx'] }), /dedicated/);
});

test('a named-owner decision does not substitute for the meeting record', () => {
  assert.throws(() => checkChange({ ...valid, description: description.replace('AI-Meeting:', 'AI-Decision:') }), /AI-Meeting/);
});

test('nested overrides and empty fields cannot bypass checks', () => {
  for (const p of ['src/AGENTS.override.md','CLAUDE.local.md','src/.cursor/rules/override.mdc','src/.cursorrules'])
    assert.equal(isProtected(p), true, p);
  assert.throws(() => checkChange({ ...valid, description:description.replace('AI-Reason: Correct the cache invalidation review procedure.','AI-Reason:') }), /AI-Reason/);
});
test('missing, duplicate, placeholder, and wrong-project references fail', () => {
  for (const desc of ['', description.replace('42#note_123','42'), description.replace('AI-Reason: Correct the cache invalidation review procedure.','AI-Reason: TODO'), description + '\nAI-Proposal: duplicate', description.replaceAll('/team/web/-/issues/','/team/other/-/issues/')])
    assert.throws(() => checkChange({ ...valid, description: desc }));
});
test('AI changes cannot be bundled with product code or renamed out of scope', () => {
  assert.throws(() => checkChange({ ...valid, paths:['AGENTS.md','src/renamed.md'] }), /dedicated/);
  assert.throws(() => checkChange({ ...valid, paths:['ai/source/a.md','src/page.tsx'] }), /dedicated/);
});
test('only AI script edits are permitted in package.json within AI MRs', () => {
  const beforePackage = { name:'web', scripts:{build:'vite build','ai:check':'old'}, dependencies:{a:'1'} };
  const afterPackage = { ...beforePackage, scripts:{...beforePackage.scripts,'ai:check':'new'} };
  assert.equal(checkChange({ ...valid, paths:['package.json'], beforePackage,afterPackage }).required,true);
  assert.throws(() => checkChange({ ...valid, paths:['AGENTS.md','package.json'],beforePackage,afterPackage:{...afterPackage,dependencies:{a:'2'}} }), /only ai:/);
  assert.throws(() => checkChange({ ...valid, paths:['AGENTS.md','package.json'],beforePackage,afterPackage:null }), /only ai:/);
});
test('credentials and query parameters are rejected in issue links', () => {
  assert.throws(() => checkChange({ ...valid,description:description.replace('https://gitlab.example/team/web/-/issues/42\n','https://user:secret@gitlab.example/team/web/-/issues/42\n') }));
  assert.throws(() => checkChange({ ...valid,description:description.replace('issues/42\n','issues/42?token=x\n') }));
});
