#!/usr/bin/env node

import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadAiEnv } from './load-ai-env.mjs'

try {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
  await loadAiEnv({ root, required: ['SENTRY_AUTH_TOKEN', 'SENTRY_ORG', 'SENTRY_PROJECT'] })
} catch (error) {
  console.error(error.message)
  process.exit(2)
}

const baseUrl = (process.env.SENTRY_BASE_URL || 'https://sentry.io').replace(/\/$/, '')
const token = process.env.SENTRY_AUTH_TOKEN
const org = process.env.SENTRY_ORG
const project = process.env.SENTRY_PROJECT

const [command = 'list-issues', identifier] = process.argv.slice(2)
const options = Object.fromEntries(
  process.argv.slice(4).reduce((pairs, value, index, values) => {
    if (value.startsWith('--')) pairs.push([value.slice(2), values[index + 1]])
    return pairs
  }, []),
)

const environment = options.environment || 'prod'
const period = options.period || '24h'
const limit = Math.min(Number(options.limit || 20), 50)

const paths = {
  'list-issues': `/api/0/projects/${encodeURIComponent(org)}/${encodeURIComponent(project)}/issues/`,
  'issue-detail': identifier && `/api/0/organizations/${encodeURIComponent(org)}/issues/${encodeURIComponent(identifier)}/`,
  'issue-events': identifier && `/api/0/organizations/${encodeURIComponent(org)}/issues/${encodeURIComponent(identifier)}/events/`,
  'event-detail': identifier && `/api/0/projects/${encodeURIComponent(org)}/${encodeURIComponent(project)}/events/${encodeURIComponent(identifier)}/`,
}

if (!paths[command]) {
  console.error('Usage: sentry-readonly.mjs list-issues|issue-detail|issue-events|event-detail [id] [--environment prod] [--period 24h] [--limit 20]')
  process.exit(2)
}

const url = new URL(paths[command], baseUrl)
if (command === 'list-issues' || command === 'issue-events') {
  url.searchParams.set('environment', environment)
  url.searchParams.set('statsPeriod', period)
  url.searchParams.set('per_page', String(limit))
}
if (command === 'list-issues') url.searchParams.set('query', options.query || 'is:unresolved')

const response = await fetch(url, {
  headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
})

const rateLimit = {
  limit: response.headers.get('x-sentry-rate-limit-limit'),
  remaining: response.headers.get('x-sentry-rate-limit-remaining'),
  resetUtcEpoch: response.headers.get('x-sentry-rate-limit-reset'),
  concurrentLimit: response.headers.get('x-sentry-rate-limit-concurrentlimit'),
  concurrentRemaining: response.headers.get('x-sentry-rate-limit-concurrentremaining'),
}
const knownRateLimit = Object.values(rateLimit).some(value => value !== null)
console.error(`Sentry API rate limit: ${knownRateLimit ? JSON.stringify(rateLimit) : 'unknown (headers not exposed)'}`)

if (!response.ok) {
  console.error(`Sentry request failed with HTTP ${response.status}.`)
  process.exit(1)
}

const redact = value => {
  if (Array.isArray(value)) return value.map(redact)
  if (!value || typeof value !== 'object') {
    if (typeof value !== 'string') return value
    return value
      .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[redacted-email]')
      .replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, '[redacted-ip]')
  }
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !['request', 'user', 'contexts', 'breadcrumbs'].includes(key))
      .map(([key, item]) => [key, redact(item)]),
  )
}

const data = redact(await response.json())
console.log(JSON.stringify(Array.isArray(data) ? data.slice(0, limit) : data, null, 2))
