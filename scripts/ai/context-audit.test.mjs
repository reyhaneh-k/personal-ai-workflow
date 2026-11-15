import assert from 'node:assert/strict';
import { cp, mkdtemp, mkdir, readFile, rm, unlink, writeFile, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { auditContext, formatMarkdown } from './context-audit.mjs';
import { generate } from '../../ai/generator/generate.mjs';
import { trackingViolations } from '../../ai/generator/check-tracking.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

async function fixture(t, generated = false) {
  const root = await mkdtemp(path.join(tmpdir(), 'personal-context-test-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  for (const dir of ['ai/source', 'ai/platform-overrides', 'scripts/ai'])
    await cp(path.join(repo, dir), path.join(root, dir), { recursive: true });
  await cp(path.join(repo, 'PROJECT.md'), path.join(root, 'PROJECT.md'));
  if (generated) await generate(root);
  return root;
}

test('source-only audit validates sources without claiming native discovery or writing outputs', async (t) => {
  const root = await fixture(t);
  await mkdir(path.join(root, '.cursor'), { recursive: true });
  await writeFile(path.join(root, '.cursor/permissions.json'), '{"keep":"personal"}');
  for (const platform of ['codex', 'cursor', 'claude']) {
    const report = await auditContext(root, { platform, repositoryOnly: true });
    assert.equal(report.repository.status, 'source-only');
    assert.equal(report.result, 'healthy');
    assert.deepEqual(report.skills.discovered, []);
    assert.ok(report.skills.sourceAvailable.includes('personal-fix-bug'));
    assert.match(formatMarkdown(report), /not proof of runtime loading/);
  }
  for (const file of ['AGENTS.md', 'ai/generated-manifest.json', '.agents/skills/personal-fix-bug/SKILL.md'])
    await assert.rejects(access(path.join(root, file)), { code: 'ENOENT' });
  assert.equal(await readFile(path.join(root, '.cursor/permissions.json'), 'utf8'), '{"keep":"personal"}');
});

test('repository audit verifies generated files and exposes Cursor duplicate discovery candidates', async (t) => {
  const root = await fixture(t, true);
  const report = await auditContext(root, { platform: 'cursor', repositoryOnly: true });
  assert.equal(report.repository.status, 'current');
  assert.equal(report.result, 'warning');
  assert.ok(report.skills.duplicates.some((item) => item.name === 'personal-fix-bug' && item.kind === 'identical'));
});

test('missing ownership manifest with partial generated output is invalid', async (t) => {
  const root = await fixture(t, true);
  await unlink(path.join(root, 'ai/generated-manifest.json'));
  const report = await auditContext(root, { platform: 'codex', repositoryOnly: true });
  assert.equal(report.result, 'invalid');
  assert.match(report.invalid.join(), /manifest missing while generated outputs exist/);
});

test('audit detects canonical source changes even when output hashes match the old manifest', async (t) => {
  const root = await fixture(t, true);
  const file = path.join(root, 'ai/source/instructions.md');
  await writeFile(file, await readFile(file, 'utf8') + '\nA new source instruction.\n');
  const report = await auditContext(root, { platform: 'codex', repositoryOnly: true });
  assert.equal(report.result, 'invalid');
  assert.match(report.invalid.join(), /AGENTS.md is out of date with canonical sources/);
});

test('source-only task audit rejects missing required manual evidence', async (t) => {
  const root = await fixture(t);
  const report = await auditContext(root, {
    platform: 'codex', activeSkill: 'personal-prepare-mr',
    runtime: { evidenceSource: 'fixture: canonical source read directly', agentsLoaded: false },
  });
  assert.equal(report.result, 'invalid');
  assert.deepEqual(report.activeTask.missingManualSections, ['docs/ai/manual-delivery.md']);
  assert.equal(report.activeTask.basis, 'canonical-source');
});

test('source-only audit rejects broken canonical references', async (t) => {
  const root = await fixture(t);
  await unlink(path.join(root, 'ai/source/manual/manual-testing.md'));
  const report = await auditContext(root, { platform: 'claude', repositoryOnly: true });
  assert.equal(report.result, 'invalid');
  assert.match(report.invalid.join(), /Canonical source validation failed/);
});

test('audit rejects edited outputs and retired generator-marked remnants without a manifest', async (t) => {
  const generatedRoot = await fixture(t, true);
  await writeFile(path.join(generatedRoot, 'AGENTS.md'), 'Edited output');
  assert.equal((await auditContext(generatedRoot, { platform: 'codex', repositoryOnly: true })).result, 'invalid');
  const sourceRoot = await fixture(t);
  await mkdir(path.join(sourceRoot, 'docs/ai'), { recursive: true });
  await writeFile(path.join(sourceRoot, 'docs/ai/retired-manual.md'), '<!-- GENERATED from an old source -->');
  const report = await auditContext(sourceRoot, { platform: 'codex', repositoryOnly: true });
  assert.equal(report.result, 'invalid');
  assert.match(report.invalid.join(), /retired-manual.md/);
});

test('task audit accepts explicit runtime and manual evidence in a generated checkout', async (t) => {
  const root = await fixture(t, true);
  const agents = await readFile(path.join(root, 'AGENTS.md'), 'utf8');
  const crypto = await import('node:crypto');
  const agentsHash = crypto.createHash('sha256').update(agents.replace(/\r\n/g, '\n')).digest('hex');
  const repository = await auditContext(root, { platform: 'codex', repositoryOnly: true });
  const report = await auditContext(root, {
    platform: 'codex', activeSkill: 'personal-prepare-mr', manualSections: ['docs/ai/manual-delivery.md'],
    runtime: { evidenceSource: 'test fixture', agentsLoaded: true, agentsHash, discoveredSkills: repository.skills.discovered },
  });
  assert.equal(report.result, 'healthy');
  assert.deepEqual(report.activeTask.missingManualSections, []);
});

test('UI and Figma localization readings are required only when the project enables localization', async (t) => {
  const root = await fixture(t);
  for (const skill of ['personal-ui-validation', 'personal-implement-figma']) {
    const base = skill === 'personal-ui-validation'
      ? ['manual-design', 'manual-testing', 'manual-compatibility', 'manual-accessibility']
      : ['manual-design', 'manual-coding', 'manual-accessibility'];
    for (const flag of ['off', 'on']) {
      await writeFile(path.join(root, 'PROJECT.md'), '| localization | ' + flag + ' | |\n');
      const options = { platform: 'codex', activeSkill: skill, manualSections: base.map(name => 'ai/source/manual/' + name + '.md'), runtime: { evidenceSource: 'fixture: source read directly', agentsLoaded: false, discoveredSkills: [] } };
      const report = await auditContext(root, options);
      assert.equal(report.activeTask.requiredManualSections.includes('docs/ai/manual-localization.md'), flag === 'on');
      assert.equal(report.result, flag === 'on' ? 'invalid' : 'healthy');
      if (flag === 'on') {
        const complete = await auditContext(root, { ...options, manualSections: [...options.manualSections, 'ai/source/manual/manual-localization.md'] });
        assert.equal(complete.result, 'healthy');
      }
    }
  }
});

test('tracking permits only the five maintained Cursor policy files', () => {
  const maintained = ['.cursor/permissions.json', '.cursor/sandbox.json', '.cursor/hooks.json', '.cursor/hooks/guard-sensitive-access.mjs', '.cursor/hooks/post-edit-guidance.mjs'];
  assert.deepEqual(trackingViolations(maintained), []);
  const local = ['AGENTS.md', '.cursor/mcp.json', '.cursor/hooks/arbitrary.mjs', '.cursor/skills/personal-fix-bug/SKILL.md', '.claude/settings.json', 'docs/ai/workflows.md'];
  assert.deepEqual(trackingViolations([...maintained, ...local]), local);
});

test('Codex task readings use the enabled scoped copy rather than a disabled root copy', async (t) => {
  const root = await fixture(t, true);
  const file = path.join(root, 'src/.agents/skills/selected/SKILL.md');
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, '---\nname: personal-prepare-mr\ndescription: Scoped preparation.\n---\nRequired sections: `docs/ai/manual-testing.md`.\n');
  const report = await auditContext(root, {
    platform: 'codex', workingDirectory: 'src', activeSkill: 'personal-prepare-mr', manualSections: ['docs/ai/manual-testing.md'],
    runtime: { evidenceSource: 'fixture: effective selector order', agentsLoaded: true, codex: {
      skillConfig: [{ name: 'personal-prepare-mr', enabled: false }, { path: file, enabled: true }],
    } },
  });
  assert.deepEqual(report.invalid, []);
  assert.deepEqual(report.activeTask.requiredManualSections, ['docs/ai/manual-testing.md']);
  assert.equal(report.teammates.paths.length, 8);
  assert.equal(report.codex.skills.items.find((item) => item.name === 'personal-project-orientation').implicitInvocation, false);
});
