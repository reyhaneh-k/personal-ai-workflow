import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { auditContext, formatMarkdown } from './context-audit.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

test('repository-only audit verifies generated files and exposes Cursor duplicate discovery candidates', async () => {
  const report = await auditContext(repo, { platform: 'cursor', repositoryOnly: true });
  assert.equal(report.repository.status, 'current');
  assert.equal(report.result, 'warning');
  assert.ok(report.skills.duplicates.some((item) => item.name === 'personal-fix-bug' && item.kind === 'identical'));
  assert.match(formatMarkdown(report), /Duplicate candidates/);
});

test('task audit rejects missing required manual evidence', async () => {
  const report = await auditContext(repo, {
    platform: 'codex',
    activeSkill: 'personal-prepare-mr',
    runtime: { evidenceSource: 'test fixture', agentsLoaded: true, discoveredSkills: ['personal-prepare-mr'] },
  });
  assert.equal(report.result, 'invalid');
  assert.deepEqual(report.activeTask.missingManualSections, ['docs/ai/manual-delivery.md']);
});

test('task audit accepts explicit runtime and manual evidence', async () => {
  const agents = await readFile(path.join(repo, 'AGENTS.md'), 'utf8');
  const crypto = await import('node:crypto');
  const agentsHash = crypto.createHash('sha256').update(agents.replace(/\r\n/g, '\n')).digest('hex');
  const repository = await auditContext(repo, { platform: 'codex', repositoryOnly: true });
  const report = await auditContext(repo, {
    platform: 'codex',
    activeSkill: 'personal-prepare-mr',
    manualSections: ['docs/ai/manual-delivery.md'],
    runtime: {
      evidenceSource: 'test fixture', agentsLoaded: true, agentsHash,
      discoveredSkills: repository.skills.discovered, enabledMcp: [], usedMcp: [], contextSources: ['AGENTS.md'], usedContextSources: ['AGENTS.md'],
    },
  });
  assert.equal(report.result, 'healthy');
  assert.deepEqual(report.activeTask.missingManualSections, []);
});
