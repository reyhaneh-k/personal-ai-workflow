import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// Deliberately maintained repository policy; other platform settings stay local.
const maintainedCursorPolicy = new Set([
  '.cursor/permissions.json', '.cursor/sandbox.json', '.cursor/hooks.json',
  '.cursor/hooks/guard-sensitive-access.mjs', '.cursor/hooks/post-edit-guidance.mjs',
]);

export function trackingViolations(files) {
  return files.filter((file) => !maintainedCursorPolicy.has(file));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  // Inspect the index so staged additions are rejected too, including obsolete outputs.
  const root = fileURLToPath(new URL('../../', import.meta.url));
  const tracked = trackingViolations(execFileSync('git', ['ls-files', '-z', '--',
    ':(glob)**/AGENTS.md', 'ai/generated-manifest.json', 'docs/ai', '.agents', '.cursor', '.claude', '.codex'],
  { cwd: root, encoding: 'utf8' }).split('\0').filter(Boolean));
  if (tracked.length) {
    console.error('AI outputs/settings must remain local and untracked:\n' + tracked.join('\n'));
    process.exitCode = 1;
  } else {
    console.log('Source-only AI tracking verified.');
  }
}
