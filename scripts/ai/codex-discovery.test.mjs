import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm, symlink, realpath } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { inspectCodexContext, validateCodexEvidence } from './codex-discovery.mjs';

async function fixture(t) {
  const parent = await realpath(await mkdtemp(path.join(tmpdir(), 'personal-codex-discovery-')));
  t.after(() => rm(parent, { recursive: true, force: true }));
  const root = path.join(parent, 'repo');
  await mkdir(root);
  return { parent, root };
}
async function put(root, relative, text) {
  const file = path.join(root, relative);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, text);
  return file;
}
const skill = (name, body = 'Workflow') => '---\nname: ' + name + '\ndescription: A bounded workflow.\n---\n' + body;

test('instruction candidates honor overrides, empty files, fallback names, and working-directory ancestry', async (t) => {
  const { root } = await fixture(t);
  await put(root, 'AGENTS.md', 'Root rules');
  await put(root, 'AGENTS.override.md', 'Override rules');
  await put(root, 'src/AGENTS.override.md', '');
  await put(root, 'src/TEAM.md', 'Team rules');
  await mkdir(path.join(root, 'src/feature'));
  await put(root, 'other/AGENTS.md', 'Unrelated');
  const report = await inspectCodexContext(root, { workingDirectory: 'src/feature', evidence: { fallbackFilenames: ['TEAM.md'] } });
  assert.deepEqual(report.instructions.chain.map((item) => path.relative(root, item.path)), ['AGENTS.override.md', path.join('src', 'TEAM.md')]);
  assert.deepEqual(report.instructions.shadowed.map((item) => path.relative(root, item.path)), ['AGENTS.md']);
  assert.equal(report.scope.globalInstructions, 'not-inspected');
});

test('instruction limit counts UTF-8 bytes and identifies truncated and excluded candidates', async (t) => {
  const { root } = await fixture(t);
  await put(root, 'AGENTS.md', 'ééé');
  await put(root, 'src/AGENTS.md', 'Tail');
  const report = await inspectCodexContext(root, { workingDirectory: 'src', evidence: { maxInstructionBytes: 5 } });
  assert.equal(report.instructions.limit, 5);
  assert.equal(report.instructions.byteLimitReached, true);
  assert.equal(report.instructions.chain[0].bytes, 6);
  assert.equal(report.instructions.chain[0].includedBytes, 5);
  assert.equal(report.instructions.chain[1].includedBytes, 0);
});

test('skills follow only the active ancestry and ordered enable/disable selectors', async (t) => {
  const { root } = await fixture(t);
  const first = await put(root, '.agents/skills/first/SKILL.md', skill('shared', 'Root version'));
  const second = await put(root, 'src/.agents/skills/second/SKILL.md', skill('shared', 'Feature version'));
  await put(root, 'unrelated/.agents/skills/third/SKILL.md', skill('unrelated'));
  const report = await inspectCodexContext(root, { workingDirectory: 'src', evidence: {
    skillConfig: [{ name: 'shared', enabled: false }, { path: second, enabled: true }],
  } });
  assert.deepEqual(report.skills.items.map(({ path, enabled }) => [path, enabled]), [[first, false], [second, true]]);
  assert.equal(report.skills.duplicates[0].kind, 'conflicting');
});

test('user discovery is opt-in and configuration inspection reports presence without leaking contents', async (t) => {
  const { root, parent } = await fixture(t);
  const userHome = path.join(parent, 'user');
  await put(userHome, '.codex/AGENTS.md', 'Global rules');
  await put(userHome, '.codex/TEAM.md', 'Not a global fallback');
  await put(userHome, '.agents/skills/global/SKILL.md', skill('global-skill'));
  await put(root, '.codex/config.toml', 'api_key = "never-return-this-value"');
  await put(root, '.codex/agents/reviewer.toml', 'name = "reviewer"');
  await put(root, '.codex/rules/commands.rules', '# Present, not claimed effective');
  const local = await inspectCodexContext(root, { userHome, codexHome: path.join(userHome, '.codex') });
  assert.deepEqual(local.instructions.chain, []);
  assert.deepEqual(local.skills.items, []);
  assert.equal(local.teammates.paths.length, 1);
  assert.equal(local.configuration.rulesPresent.length, 1);
  assert.equal(local.configuration.effectiveValues.projectTrust, 'unknown');
  assert.doesNotMatch(JSON.stringify(local), /never-return-this-value/);
  const global = await inspectCodexContext(root, { userHome, codexHome: path.join(userHome, '.codex'), includeUser: true, evidence: { fallbackFilenames: ['TEAM.md'] } });
  assert.equal(global.instructions.chain.length, 1);
  assert.equal(global.instructions.shadowed.length, 0);
  assert.equal(global.skills.items[0].name, 'global-skill');
});

test('runtime instruction paths are compared to candidates without being invented', async (t) => {
  const { root } = await fixture(t);
  const file = await put(root, 'AGENTS.md', 'Rules');
  assert.equal((await inspectCodexContext(root)).instructions.runtimeChainMismatch, null);
  assert.equal((await inspectCodexContext(root, { evidence: { loadedInstructionPaths: [file] } })).instructions.runtimeChainMismatch, false);
  assert.equal((await inspectCodexContext(root, { evidence: { loadedInstructionPaths: [] } })).instructions.runtimeChainMismatch, true);
  const child = await put(root, 'src/AGENTS.md', 'Scoped rules');
  assert.equal((await inspectCodexContext(root, { workingDirectory: 'src', evidence: { loadedInstructionPaths: [child, file] } })).instructions.runtimeChainMismatch, true);
});

test('linked skill directories work within scope, exclude external targets, and terminate cycles', async (t) => {
  const { root, parent } = await fixture(t);
  const target = path.join(root, 'shared');
  await put(target, 'bounded/SKILL.md', skill('linked-skill'));
  await put(parent, 'external/extra/SKILL.md', skill('external-skill'));
  await mkdir(path.join(root, '.agents/skills'), { recursive: true });
  try {
    await symlink(target, path.join(root, '.agents/skills/link'), 'junction');
    await symlink(target, path.join(target, 'cycle'), 'junction');
    await symlink(path.join(parent, 'external'), path.join(root, '.agents/skills/outside'), 'junction');
  } catch (error) { if (['EPERM', 'EACCES', 'ENOTSUP'].includes(error.code)) { t.skip('Host denies creating test links'); return; } throw error; }
  const local = await inspectCodexContext(root);
  assert.deepEqual(local.skills.items.map((item) => item.name), ['linked-skill']);
  assert.equal(local.skills.skippedLinks.length, 1);
  const extended = await inspectCodexContext(root, { followExternalLinks: true });
  assert.deepEqual(extended.skills.items.map((item) => item.name).sort(), ['external-skill', 'linked-skill']);
});

test('discovery rejects out-of-repository working directories and unsafe evidence', async (t) => {
  const { root, parent } = await fixture(t);
  await assert.rejects(inspectCodexContext(root, { workingDirectory: parent }), /inside the audited repository/);
  for (const evidence of [{ fallbackFilenames: ['../private'] }, { maxInstructionBytes: -1 },
    { skillConfig: [{ name: 'x', path: path.join(root, 'SKILL.md'), enabled: false }] },
    { skillConfig: [{ path: 'relative', enabled: true }] }, { api_key: 'secret' }])
    assert.throws(() => validateCodexEvidence(evidence));
});
