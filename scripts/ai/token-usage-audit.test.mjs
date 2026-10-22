import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { generateTokenAudit } from './token-usage-audit.mjs';

test('generates monthly summaries and charts from canonical usage', async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), 'personal-token-audit-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const input = path.join(root, 'usage.json'), output = path.join(root, 'report');
  await writeFile(input, JSON.stringify({ schemaVersion: 1, records: [
    { date:'2026-08-01', platform:'codex', measurement:'exact', source:'workspace export', uncached_input_tokens:800, cache_read_input_tokens:200, output_tokens:300, completed_tasks:2, cost_usd:1.2, tool:'repository-search', tool_calls:4, tool_result_tokens:180, tool_failures:0, tool_fallbacks:0 },
    { date:'2026-09-01', platform:'cursor', measurement:'estimated', source:'team export', uncached_input_tokens:1200, cache_read_input_tokens:100, output_tokens:500, completed_tasks:2, cost_usd:2.4, tool:'figma', tool_calls:3, tool_result_tokens:700, tool_failures:1, tool_fallbacks:1 },
  ] }));
  const result = await generateTokenAudit([input], output);
  assert.deepEqual(result.months, ['2026-08', '2026-09']);
  assert.match(await readFile(path.join(output, 'token-usage-report.md'), 'utf8'), /Tokens per completed task/);
  assert.match(await readFile(path.join(output, 'monthly-token-usage.svg'), 'utf8'), /Monthly AI token usage/);
  assert.match(await readFile(path.join(output, 'monthly-token-efficiency.svg'), 'utf8'), /Tokens per completed task/);
  assert.match(await readFile(path.join(output, 'monthly-tool-usage.svg'), 'utf8'), /Monthly tool-result context tokens/);
  assert.match(await readFile(path.join(output, 'monthly-tool-usage.csv'), 'utf8'), /figma,3,700,1,1/);
});

test('accepts tool-only telemetry without treating it as token usage', async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), 'personal-token-audit-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const input = path.join(root, 'usage.json'), output = path.join(root, 'report');
  await writeFile(input, JSON.stringify([{ date:'2026-09', platform:'claude', measurement:'exact', source:'tool log', tool:'sentry-api', tool_calls:5, tool_failures:1, tool_fallbacks:2 }]));
  await generateTokenAudit([input], output);
  assert.match(await readFile(path.join(output, 'token-usage-report.md'), 'utf8'), /sentry-api/);
  assert.match(await readFile(path.join(output, 'monthly-tool-usage.svg'), 'utf8'), /Monthly tool calls/);
});

test('rejects fields that could bypass the privacy-safe schema', async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), 'personal-token-audit-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const input = path.join(root, 'usage.json');
  await writeFile(input, JSON.stringify([{ date:'2026-09', platform:'claude', measurement:'exact', source:'test', input_tokens:10, email:'person@example.com' }]));
  await assert.rejects(generateTokenAudit([input], path.join(root, 'out')), /unsupported fields/);
});
