import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { getContext7Status, interpretContext7Usage } from './context7-status.mjs';

test('interprets free and paid Context7 request capacity', () => {
  const available = interpretContext7Usage({ plan:'free', usageResetsAt:'2026-11-01T00:00:00.000Z', member:{ requests:412, includedInPlan:1000 }, teamspace:{ extraCostUsd:0, spendingLimitUsd:null } });
  assert.equal(available.remainingIncludedRequests, 588);
  assert.equal(available.recommendation, 'context7');
  const exhausted = interpretContext7Usage({ plan:'free', usageResetsAt:'2026-11-01T00:00:00.000Z', member:{ requests:1000, includedInPlan:1000 }, teamspace:{ extraCostUsd:0, spendingLimitUsd:null } });
  assert.equal(exhausted.capacity, 'exhausted');
  assert.equal(exhausted.recommendation, 'official-web');
  const paid = interpretContext7Usage({ plan:'pro', usageResetsAt:'2026-11-01T00:00:00.000Z', member:{ requests:2500, includedInPlan:2000 }, teamspace:{ extraCostUsd:2.5, spendingLimitUsd:50 } });
  assert.equal(paid.capacity, 'available');
  const paidExhausted = interpretContext7Usage({ plan:'pro', usageResetsAt:'2026-11-01T00:00:00.000Z', member:{ requests:2500, includedInPlan:2000 }, teamspace:{ extraCostUsd:50, spendingLimitUsd:50 } });
  assert.equal(paidExhausted.capacity, 'exhausted');
});

test('checks usage without exposing the Context7 API key', async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), 'personal-context7-'));
  const previous = process.env.CONTEXT7_API_KEY;
  t.after(async () => { if (previous === undefined) delete process.env.CONTEXT7_API_KEY; else process.env.CONTEXT7_API_KEY = previous; await rm(root, { recursive:true, force:true }); });
  delete process.env.CONTEXT7_API_KEY;
  await writeFile(path.join(root, '.env.ai.local'), 'CONTEXT7_API_KEY=ctx7sk-secret-value\n');
  let authorization;
  const result = await getContext7Status({ root, fetchImpl: async (_url, options) => {
    authorization = options.headers.Authorization;
    return { ok:true, status:200, json:async () => ({ plan:'free', usageResetsAt:'2026-11-01T00:00:00.000Z', member:{ requests:10, includedInPlan:1000 }, teamspace:{ extraCostUsd:0, spendingLimitUsd:null } }) };
  } });
  assert.equal(authorization, 'Bearer ctx7sk-secret-value');
  assert.equal(result.recommendation, 'context7');
  assert.doesNotMatch(JSON.stringify(result), /secret-value/);
});

test('defers to platform Context7 status when no local API key is configured', async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), 'personal-context7-'));
  const previous = process.env.CONTEXT7_API_KEY;
  t.after(async () => { if (previous === undefined) delete process.env.CONTEXT7_API_KEY; else process.env.CONTEXT7_API_KEY = previous; await rm(root, { recursive:true, force:true }); });
  delete process.env.CONTEXT7_API_KEY;
  assert.equal((await getContext7Status({ root })).recommendation, 'check-platform-context7');
});
