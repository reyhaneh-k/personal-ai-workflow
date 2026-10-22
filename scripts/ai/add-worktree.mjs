import { execFile } from 'node:child_process';
import { lstat, mkdir, realpath } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const exec = promisify(execFile);

async function git(root, args, allowFailure = false) {
  try { return await exec('git', args, { cwd: root, windowsHide: true }); }
  catch (error) { if (allowFailure) return null; throw new Error(error.stderr?.trim() || error.message); }
}
function usage() {
  return 'Usage: pnpm ai:worktree:add -- <branch> [--base <ref>]\nCreates an isolated worktree at ../worktrees/<branch>.';
}

export async function addWorktree(directory, args) {
  if (!args.length || args[0] === '--help') throw new Error(usage());
  const [branch, ...rest] = args;
  let base = 'HEAD';
  if (rest.length === 2 && rest[0] === '--base' && rest[1]) base = rest[1];
  else if (rest.length) throw new Error(usage());
  const root = await realpath(directory);
  await git(root, ['rev-parse', '--is-inside-work-tree']);
  await git(root, ['check-ref-format', '--branch', branch]);
  const parent = path.resolve(root, '..', 'worktrees');
  const target = path.resolve(parent, ...branch.split('/'));
  if (!target.startsWith(parent + path.sep)) throw new Error('Invalid worktree path.');
  try { await lstat(target); throw new Error('Worktree path already exists: ' + target); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  await mkdir(parent, { recursive: true });
  const existing = await git(root, ['show-ref', '--verify', '--quiet', 'refs/heads/' + branch], true);
  await git(root, existing ? ['worktree', 'add', target, branch] : ['worktree', 'add', '-b', branch, target, base]);
  return { branch, base: existing ? null : base, path: target };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const result = await addWorktree(process.cwd(), process.argv.slice(2));
    console.log('Created worktree for ' + result.branch + ': ' + result.path);
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
