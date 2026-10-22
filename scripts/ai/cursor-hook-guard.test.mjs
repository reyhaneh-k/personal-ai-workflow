import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const hook = '.cursor/hooks/guard-sensitive-access.mjs';

function run(input) {
  const result = spawnSync(process.execPath, [hook], {
    input: JSON.stringify(input),
    encoding: 'utf8'
  });
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout);
}

test('sensitive-access hook denies real secrets but permits templates and ordinary commands', () => {
  assert.equal(run({ file_path: 'config/.env.production' }).permission, 'deny');
  assert.equal(run({ command: 'Get-Content ~/.ssh/id_ed25519' }).permission, 'deny');
  assert.equal(run({ file_path: '.env.example' }).permission, 'allow');
  assert.equal(run({ command: 'node ai/generator/generate.mjs --check' }).permission, 'allow');
});
