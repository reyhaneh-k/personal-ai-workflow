import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// Inspect the index so staged additions are rejected too, including obsolete outputs.
const root = fileURLToPath(new URL('../../', import.meta.url));
const tracked = execFileSync('git', ['ls-files', '-z', '--',
  ':(glob)**/AGENTS.md', 'ai/generated-manifest.json', 'docs/ai', '.agents', '.cursor', '.claude'],
{ cwd: root, encoding: 'utf8' }).split('\0').filter(Boolean);
if (tracked.length) {
  console.error('AI outputs/settings must remain local and untracked:\n' + tracked.join('\n'));
  process.exitCode = 1;
} else {
  console.log('Source-only AI tracking verified.');
}
