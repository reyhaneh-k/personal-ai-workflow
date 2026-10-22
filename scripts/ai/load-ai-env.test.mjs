import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { loadAiEnv } from './load-ai-env.mjs';

test('loads only allowed routine values without exposing them in the result', async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), 'personal-ai-env-'));
  t.after(async () => { delete process.env.SENTRY_AUTH_TOKEN; delete process.env.SENTRY_ORG; delete process.env.SENTRY_PROJECT; await rm(root, { recursive: true, force: true }); });
  await writeFile(path.join(root, '.env.ai.local'), 'SENTRY_AUTH_TOKEN=secret-value\nSENTRY_ORG=personal\nSENTRY_PROJECT=web\n');
  const result = await loadAiEnv({ root, required: ['SENTRY_AUTH_TOKEN','SENTRY_ORG','SENTRY_PROJECT'] });
  assert.deepEqual(result.required, { SENTRY_AUTH_TOKEN:'configured', SENTRY_ORG:'configured', SENTRY_PROJECT:'configured' });
  assert.doesNotMatch(JSON.stringify(result), /secret-value/);
});

test('rejects client-exposed, unknown, and placeholder configuration', async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), 'personal-ai-env-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const file = path.join(root, '.env.ai.local');
  await writeFile(file, 'VITE_SECRET=nope\n');
  await assert.rejects(loadAiEnv({ root }), /client-exposed/);
  await writeFile(file, 'UNREVIEWED_TOKEN=nope\n');
  await assert.rejects(loadAiEnv({ root }), /unsupported names/);
  await writeFile(file, 'SENTRY_AUTH_TOKEN=changeme\n');
  await assert.rejects(loadAiEnv({ root, required:['SENTRY_AUTH_TOKEN'] }), /placeholder/);
});

test('admin profile keeps elevated variables separate and lets process environment win', async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), 'personal-ai-env-'));
  const previous = process.env.OPENAI_ADMIN_KEY;
  t.after(async () => { if (previous === undefined) delete process.env.OPENAI_ADMIN_KEY; else process.env.OPENAI_ADMIN_KEY = previous; await rm(root, { recursive: true, force: true }); });
  await writeFile(path.join(root, '.env.ai-admin.local'), 'OPENAI_ADMIN_KEY=file-value\n');
  process.env.OPENAI_ADMIN_KEY = 'process-value';
  const result = await loadAiEnv({ root, profile:'admin', required:['OPENAI_ADMIN_KEY'] });
  assert.equal(process.env.OPENAI_ADMIN_KEY, 'process-value');
  assert.equal(result.required.OPENAI_ADMIN_KEY, 'configured');
});
