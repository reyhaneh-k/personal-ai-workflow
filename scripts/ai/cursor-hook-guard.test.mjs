import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const hookPath = path.join(root, '.cursor/hooks/guard-sensitive-access.mjs');

function runHook(stdin) {
  const result = spawnSync(process.execPath, [hookPath], {
    cwd: root,
    encoding: 'utf8',
    input: stdin,
    timeout: 5000
  });
  return {
    status: result.status,
    stdout: result.stdout || '',
    stderr: result.stderr || '',
    error: result.error
  };
}

function parsePermission(stdout) {
  const payload = JSON.parse(stdout);
  return payload.permission;
}

describe('guard-sensitive-access hook', () => {
  it('denies known sensitive paths', () => {
    const cases = [
      { file_path: '/repo/.env' },
      { file_path: '/repo/.env.local' },
      { file_path: '/repo/credentials.json' },
      { file_path: '/repo/secrets.json' },
      { file_path: '/repo/id_rsa' },
      { file_path: '/repo/id_ed25519' },
      { file_path: '/repo/cert.pem' },
      { file_path: '/repo/private.key' },
      { file_path: '/repo/.ssh/config' },
      { file_path: '/repo/.aws/credentials' },
      { command: 'cat .env' },
      { command: 'cat private/secret.txt' }
    ];

    for (const input of cases) {
      const { status, stdout, error } = runHook(JSON.stringify(input));
      assert.equal(error, undefined, `unexpected spawn error for ${JSON.stringify(input)}`);
      assert.equal(status, 0, `expected exit 0 for ${JSON.stringify(input)}`);
      assert.equal(parsePermission(stdout), 'deny', `expected deny for ${JSON.stringify(input)}`);
    }
  });

  it('allows ordinary and template paths', () => {
    const cases = [
      { file_path: '/repo/src/index.ts' },
      { file_path: '/repo/.env.example' },
      { file_path: '/repo/.env.template' },
      { file_path: '/repo/README.md' },
      { command: 'node --test scripts/ai/cursor-hook-guard.test.mjs' },
      { command: 'cat .env.example' }
    ];

    for (const input of cases) {
      const { status, stdout, error } = runHook(JSON.stringify(input));
      assert.equal(error, undefined, `unexpected spawn error for ${JSON.stringify(input)}`);
      assert.equal(status, 0, `expected exit 0 for ${JSON.stringify(input)}`);
      assert.equal(parsePermission(stdout), 'allow', `expected allow for ${JSON.stringify(input)}`);
    }
  });

  it('fails open on empty stdin', () => {
    const { status, stdout, error } = runHook('');
    assert.equal(error, undefined);
    assert.equal(status, 0);
    assert.equal(parsePermission(stdout), 'allow');
  });

  it('fails open on whitespace-only stdin', () => {
    const { status, stdout, error } = runHook('   \n\t  ');
    assert.equal(error, undefined);
    assert.equal(status, 0);
    assert.equal(parsePermission(stdout), 'allow');
  });

  it('fails open on malformed stdin', () => {
    const { status, stdout, error } = runHook('{not-json');
    assert.equal(error, undefined);
    assert.equal(status, 0);
    assert.equal(parsePermission(stdout), 'allow');
  });
});
