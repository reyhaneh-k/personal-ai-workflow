import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const protectedPrefixes = ['ai/', '.agents/', '.cursor/', '.claude/', '.codex/', 'docs/ai/', 'scripts/ai/', '.gitlab/'];
export function isProtected(p) {
  return protectedPrefixes.some((prefix) => p.startsWith(prefix)) ||
    ['.env.ai.example', '.env.ai-admin.example'].includes(p) ||
    /(^|\/)\.(agents|cursor|claude|codex)\//.test(p) ||
    /(^|\/)(AGENTS(?:\.override)?\.md|CLAUDE(?:\.local)?\.md|CODEOWNERS|\.cursorrules)$/.test(p) || p === '.gitlab-ci.yml';
}
function aiScripts(pkg) {
  return Object.fromEntries(Object.entries(pkg?.scripts ?? {}).filter(([key]) => key.startsWith('ai:')).sort(([a],[b]) => a.localeCompare(b)));
}
function withoutAiScripts(pkg) {
  if (pkg === null) return null;
  const copy = structuredClone(pkg);
  if (copy.scripts) for (const name of Object.keys(copy.scripts)) if (name.startsWith('ai:')) delete copy.scripts[name];
  return copy;
}
function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
  return value;
}
const equal = (a,b) => JSON.stringify(stable(a)) === JSON.stringify(stable(b));

export function checkChange({ paths, beforePackage = null, afterPackage = null, description = '', projectUrl }) {
  const packageChanged = paths.includes('package.json');
  const scriptChanged = packageChanged && !equal(aiScripts(beforePackage), aiScripts(afterPackage));
  const sensitive = paths.filter(isProtected);
  if (!sensitive.length && !scriptChanged) return { required: false, paths: [] };
  // Shared onboarding/ignore files may support an AI migration; reviewers check line-level scope.
  const mixed = paths.filter((p) => !isProtected(p) && !['package.json', 'README.md', '.gitignore'].includes(p));
  if (mixed.length) throw new Error('Use a dedicated AI-change MR. Unrelated paths: ' + mixed.join(', '));
  if (packageChanged && (!beforePackage || !afterPackage || !equal(withoutAiScripts(beforePackage), withoutAiScripts(afterPackage))))
    throw new Error('An AI-change MR may change only ai: scripts in package.json; separate dependencies and other changes.');
  const fields = {};
  for (const name of ['Proposal','Meeting','Reason','Validation','Rollback']) {
    const matches = [...description.matchAll(new RegExp('^AI-' + name + ':[ \\t]*([^\\r\\n]*)$', 'gm'))];
    const value = matches[0]?.[1]?.trim();
    if (matches.length !== 1 || !value || /[<>]|\b(?:TODO|TBD|PLACEHOLDER)\b/i.test(value))
      throw new Error('Supply one concrete AI-' + name + ' field using the AI_change MR template.');
    fields[name] = value;
  }
  let project, proposal, decision;
  try {
    project = new URL(projectUrl);
    proposal = new URL(fields.Proposal);
    decision = new URL(fields.Meeting);
  } catch { throw new Error('Project, proposal, and decision must be valid GitLab URLs.'); }
  if (!['https:', 'http:'].includes(project.protocol) || [project, proposal, decision].some((u) => u.username || u.password || u.search))
    throw new Error('Use plain GitLab URLs without credentials or query parameters.');
  const prefix = project.pathname.replace(/\/$/, '') + '/-/issues/';
  const issue = proposal.pathname.slice(prefix.length);
  if (proposal.origin !== project.origin || !proposal.pathname.startsWith(prefix) || !/^[1-9]\d*$/.test(issue) || proposal.hash)
    throw new Error('AI-Proposal must link to an issue in this GitLab project.');
  if (decision.origin !== proposal.origin || decision.pathname !== proposal.pathname || !/^#note_\d+$/.test(decision.hash))
    throw new Error('AI-Meeting must link to the team-meeting outcome comment on the proposal issue.');
  for (const name of ['Reason','Validation','Rollback']) {
    if (fields[name].length < 15 || /^(?:n\/?a|none|done|passed|approved|not applicable)[.!]?$/i.test(fields[name]))
      throw new Error('AI-' + name + ' needs a concrete explanation, not a status word.');
  }
  return { required: true, paths: [...sensitive, ...(scriptChanged ? ['package.json'] : [])] };
}

function git(root, args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 });
}
async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help')) {
    console.log('Usage: node ai/governance/check-proposal.mjs --base <sha> --description <file> --project-url <url>');
    return;
  }
  const opts = {};
  for (let i = 0; i < args.length; i += 2) {
    if (!['--base','--description','--project-url'].includes(args[i]) || !args[i+1] || Object.hasOwn(opts, args[i]))
      throw new Error('Invalid arguments. Use --help.');
    opts[args[i]] = args[i+1];
  }
  const ci = process.env.CI_PIPELINE_SOURCE === 'merge_request_event';
  if (process.env.CI && !ci && !args.length) {
    console.log('Proposal metadata is checked in merge-request pipelines.');
    return;
  }
  const base = opts['--base'] ?? process.env.CI_MERGE_REQUEST_DIFF_BASE_SHA;
  if (!/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/i.test(base ?? '') || /^0+$/.test(base))
    throw new Error('A valid base commit SHA is required; missing diff evidence cannot pass.');
  const root = fileURLToPath(new URL('../../', import.meta.url));
  git(root, ['cat-file','-e',base + '^{commit}']);
  // Disable rename detection so removals from protected paths remain visible.
  const paths = git(root, ['diff','--name-only','--no-renames','-z',base,'HEAD','--']).split('\0').filter(Boolean);
  let beforePackage = null, afterPackage = null;
  if (paths.includes('package.json')) {
    for (const ref of [base, 'HEAD']) {
      const exists = git(root, ['ls-tree', '--name-only', ref, '--', 'package.json']).trim();
      const pkg = exists ? JSON.parse(git(root, ['show', ref + ':package.json'])) : null;
      if (ref === base) beforePackage = pkg; else afterPackage = pkg;
    }
  }
  const description = opts['--description'] ? await readFile(path.resolve(opts['--description']), 'utf8') : (process.env.CI_MERGE_REQUEST_DESCRIPTION ?? '');
  const result = checkChange({ paths, beforePackage, afterPackage, description: description.replace(/\r\n/g,'\n'), projectUrl: opts['--project-url'] ?? process.env.CI_PROJECT_URL });
  console.log(result.required
    ? 'AI proposal format valid for ' + result.paths.length + ' protected paths. The team-meeting record and agreed scope still require human verification.'
    : 'No AI configuration changes detected.');
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => { console.error(error.message); process.exitCode = 1; });
}
