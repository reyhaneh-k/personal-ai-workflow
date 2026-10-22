import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadAiEnv } from './load-ai-env.mjs';

const usageUrl = 'https://context7.com/api/v2/usage?days=1';

export function interpretContext7Usage(data) {
  if (!data || typeof data !== 'object' || !data.member || !data.teamspace)
    throw new Error('Context7 returned an unexpected usage response.');
  const plan = String(data.plan ?? 'unknown');
  const requests = Number(data.member.requests);
  const included = Number(data.member.includedInPlan);
  const extraCost = Number(data.teamspace.extraCostUsd);
  const rawLimit = data.teamspace.spendingLimitUsd;
  const spendingLimit = rawLimit === null ? null : Number(rawLimit);
  if (![requests, included, extraCost].every((value) => Number.isFinite(value) && value >= 0) ||
    (spendingLimit !== null && (!Number.isFinite(spendingLimit) || spendingLimit < 0)))
    throw new Error('Context7 returned invalid usage values.');
  const remainingIncludedRequests = Math.max(0, included - requests);
  let capacity = 'available';
  if (remainingIncludedRequests === 0) {
    if (plan === 'free') capacity = 'exhausted';
    else if (spendingLimit !== null && extraCost >= spendingLimit) capacity = 'exhausted';
  }
  return {
    apiKeyConfigured: true,
    apiKeyAuthenticated: true,
    plan,
    requestsUsed: requests,
    includedRequests: included,
    remainingIncludedRequests,
    resetAt: String(data.usageResetsAt ?? ''),
    paidCapacity: plan === 'free' ? 'not-applicable' : spendingLimit === null ? 'no-reported-limit' : capacity === 'available' ? 'available-within-limit' : 'limit-reached',
    capacity,
    recommendation: capacity === 'available' ? 'context7' : 'official-web',
  };
}

export async function getContext7Status({ root, fetchImpl = fetch }) {
  await loadAiEnv({ root, profile: 'routine' });
  const apiKey = process.env.CONTEXT7_API_KEY?.trim();
  if (!apiKey) return {
    apiKeyConfigured: false,
    apiKeyAuthenticated: false,
    capacity: 'unknown',
    recommendation: 'check-platform-context7',
    reason: 'CONTEXT7_API_KEY is not configured; platform OAuth may still work, but this script cannot verify its capacity.',
  };
  let response;
  try {
    response = await fetchImpl(usageUrl, {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    return { apiKeyConfigured: true, apiKeyAuthenticated: 'unknown', capacity: 'unknown', recommendation: 'official-web', reason: 'Context7 usage check was unavailable.' };
  }
  if (!response.ok) {
    const exhausted = response.status === 402 || response.status === 429;
    return {
      apiKeyConfigured: true,
      apiKeyAuthenticated: response.status === 401 ? false : 'unknown',
      capacity: exhausted ? 'exhausted' : 'unknown',
      recommendation: 'official-web',
      reason: `Context7 usage check returned HTTP ${response.status}.`,
    };
  }
  try { return interpretContext7Usage(await response.json()); }
  catch {
    return { apiKeyConfigured: true, apiKeyAuthenticated: 'unknown', capacity: 'unknown', recommendation: 'official-web', reason: 'Context7 returned an unexpected usage response.' };
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
  try { console.log(JSON.stringify(await getContext7Status({ root }), null, 2)); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
