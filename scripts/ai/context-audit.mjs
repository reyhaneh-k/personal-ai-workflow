import { createHash } from 'node:crypto';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PLATFORMS = ['codex', 'cursor', 'claude'];
const SKILL_ROOTS = {
  codex: ['.agents/skills'],
  cursor: ['.cursor/skills', '.agents/skills', '.claude/skills', '.codex/skills'],
  claude: ['.claude/skills'],
};
const TEAMMATE_ROOTS = { codex: [], cursor: ['.cursor/agents'], claude: ['.claude/agents'] };
const normalize = (value) => value.replace(/\r\n/g, '\n');
const digest = (value) => createHash('sha256').update(normalize(value)).digest('hex');
const slash = (value) => value.split(path.sep).join('/');

async function readOptional(file) {
  try { return await readFile(file, 'utf8'); }
  catch (error) { if (error.code === 'ENOENT') return null; throw error; }
}

async function filesNamed(root, name) {
  const found = [];
  async function visit(directory) {
    let entries;
    try { entries = await readdir(directory, { withFileTypes: true }); }
    catch (error) { if (error.code === 'ENOENT') return; throw error; }
    for (const entry of entries) {
      const target = path.join(directory, entry.name);
      if (entry.isSymbolicLink()) continue;
      if (entry.isDirectory()) await visit(target);
      else if (entry.isFile() && entry.name === name) found.push(target);
    }
  }
  await visit(root);
  return found.sort();
}

function skillMetadata(text, fallback) {
  const block = text.match(/^---\n([\s\S]*?)\n---(?:\n|$)/)?.[1] ?? '';
  const name = block.match(/^name:\s*(.+)$/m)?.[1]?.trim().replace(/^['"]|['"]$/g, '') ?? fallback;
  const description = block.match(/^description:\s*(.+)$/m)?.[1]?.trim().replace(/^['"]|['"]$/g, '') ?? '';
  return { name, description };
}

function requiredManualSections(text) {
  const line = text.match(/^Required sections:\s*(.+)$/m)?.[1] ?? '';
  return [...line.matchAll(/`(docs\/ai\/manual-[a-z-]+\.md)`/g)].map((match) => match[1]);
}

function unique(values) { return [...new Set(values)].sort(); }

async function repositoryIntegrity(root) {
  const manifestFile = path.join(root, 'ai/generated-manifest.json');
  const raw = await readOptional(manifestFile);
  if (raw === null) return { status: 'missing', checked: 0, drift: ['ai/generated-manifest.json'] };
  let manifest;
  try { manifest = JSON.parse(raw); }
  catch { return { status: 'invalid', checked: 0, drift: ['ai/generated-manifest.json is not valid JSON'] }; }
  if (manifest.version !== 1 || !manifest.files || Array.isArray(manifest.files))
    return { status: 'invalid', checked: 0, drift: ['ai/generated-manifest.json has an unsupported shape'] };
  const drift = [];
  for (const [relative, expected] of Object.entries(manifest.files)) {
    if (path.isAbsolute(relative) || relative.includes('\\') || relative.split('/').some((part) => !part || part === '.' || part === '..') || !/^[a-f0-9]{64}$/.test(expected)) {
      drift.push('invalid manifest entry: ' + relative);
      continue;
    }
    const current = await readOptional(path.join(root, relative));
    if (current === null) drift.push(relative + ' is missing');
    else if (digest(current) !== expected) drift.push(relative + ' differs from its generated hash');
  }
  return { status: drift.length ? 'drift' : 'current', checked: Object.keys(manifest.files).length, drift, manifest };
}

async function discoverSkills(root, platform) {
  const skills = [];
  for (const relativeRoot of SKILL_ROOTS[platform]) {
    for (const file of await filesNamed(path.join(root, relativeRoot), 'SKILL.md')) {
      const text = normalize(await readFile(file, 'utf8'));
      const metadata = skillMetadata(text, path.basename(path.dirname(file)));
      skills.push({ ...metadata, path: slash(path.relative(root, file)), hash: digest(text), text });
    }
  }
  const groups = new Map();
  for (const skill of skills) groups.set(skill.name, [...(groups.get(skill.name) ?? []), skill]);
  const duplicates = [...groups].filter(([, copies]) => copies.length > 1).map(([name, copies]) => ({
    name,
    kind: new Set(copies.map((copy) => copy.hash)).size === 1 ? 'identical' : 'conflicting',
    paths: copies.map((copy) => copy.path),
  }));
  return { roots: SKILL_ROOTS[platform], items: skills, duplicates };
}

async function discoverTeammates(root, platform) {
  if (platform === 'codex') {
    const catalog = await readOptional(path.join(root, 'docs/ai/agents.md'));
    return { mode: 'shared role catalog; runtime delegation is platform-managed', paths: catalog === null ? [] : ['docs/ai/agents.md'] };
  }
  const paths = [];
  for (const relativeRoot of TEAMMATE_ROOTS[platform]) {
    let entries = [];
    try { entries = await readdir(path.join(root, relativeRoot), { withFileTypes: true }); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
    paths.push(...entries.filter((entry) => entry.isFile() && entry.name.endsWith('.md')).map((entry) => relativeRoot + '/' + entry.name));
  }
  return { mode: 'native project teammates', paths: paths.sort() };
}

function validateRuntimeEvidence(runtime) {
  if (!runtime) return null;
  if (typeof runtime !== 'object' || Array.isArray(runtime)) throw new Error('Runtime evidence must be a JSON object.');
  if (typeof runtime.evidenceSource !== 'string' || !runtime.evidenceSource.trim())
    throw new Error('Runtime evidence requires a non-empty evidenceSource.');
  for (const field of ['discoveredSkills', 'manualSections', 'enabledMcp', 'usedMcp', 'contextSources', 'usedContextSources']) {
    if (runtime[field] !== undefined && (!Array.isArray(runtime[field]) || runtime[field].some((item) => typeof item !== 'string')))
      throw new Error('Runtime evidence field ' + field + ' must be an array of strings.');
  }
  if (runtime.agentsLoaded !== undefined && runtime.agentsLoaded !== null && typeof runtime.agentsLoaded !== 'boolean')
    throw new Error('Runtime evidence agentsLoaded must be true, false, or null.');
  return runtime;
}

export async function auditContext(rootDirectory, options) {
  const root = path.resolve(rootDirectory);
  const platform = options.platform;
  if (!PLATFORMS.includes(platform)) throw new Error('Platform must be codex, cursor, or claude.');
  const repositoryOnly = Boolean(options.repositoryOnly);
  const runtime = validateRuntimeEvidence(options.runtime ?? null);
  const integrity = await repositoryIntegrity(root);
  const skills = await discoverSkills(root, platform);
  const teammates = await discoverTeammates(root, platform);
  const findings = [];
  const invalid = [];

  if (integrity.status !== 'current') invalid.push('Generated AI files are not synchronized: ' + integrity.drift.join('; '));
  for (const duplicate of skills.duplicates) {
    const message = duplicate.name + ' is discoverable from ' + duplicate.paths.join(', ');
    if (duplicate.kind === 'conflicting') invalid.push('Conflicting skill copies: ' + message);
    else findings.push('Identical duplicate skill candidates: ' + message);
  }

  const agentsText = await readOptional(path.join(root, 'AGENTS.md'));
  const agentsHash = agentsText === null ? null : digest(agentsText);
  const expectedAgentsHash = integrity.manifest?.files?.['AGENTS.md'] ?? null;
  let agentsLoaded = repositoryOnly ? 'not-checked' : 'unknown';
  let agentsHashMatch = null;
  if (runtime) {
    agentsLoaded = runtime.agentsLoaded === true ? 'yes' : runtime.agentsLoaded === false ? 'no' : 'unknown';
    if (runtime.agentsHash) agentsHashMatch = runtime.agentsHash === agentsHash;
    if (runtime.agentsLoaded === false) invalid.push('Runtime evidence says AGENTS.md was not loaded.');
    if (agentsHashMatch === false) invalid.push('Runtime AGENTS.md hash does not match this checkout.');
  } else if (!repositoryOnly) findings.push('Live AGENTS.md loading is unknown; supply runtime evidence from the platform.');

  const activeSkill = options.activeSkill ?? runtime?.activeSkill ?? null;
  const activeCopies = activeSkill ? skills.items.filter((skill) => skill.name === activeSkill) : [];
  if (activeSkill && !activeCopies.length) invalid.push('Active skill is not discoverable for ' + platform + ': ' + activeSkill);
  const requiredSections = activeCopies.length ? requiredManualSections(activeCopies[0].text) : [];
  const loadedSections = unique([...(options.manualSections ?? []), ...(runtime?.manualSections ?? [])]);
  const missingSections = requiredSections.filter((section) => !loadedSections.includes(section));
  if (activeSkill && missingSections.length) invalid.push('Required manual sections were not evidenced as loaded: ' + missingSections.join(', '));
  if (!activeSkill && !repositoryOnly) findings.push('No active task skill was supplied.');

  if (runtime?.discoveredSkills) {
    const filesystemNames = unique(skills.items.map((skill) => skill.name));
    const missingAtRuntime = filesystemNames.filter((name) => !runtime.discoveredSkills.includes(name));
    if (missingAtRuntime.length) findings.push('Repository skills absent from runtime evidence: ' + missingAtRuntime.join(', '));
  } else if (!repositoryOnly) findings.push('Live skill discovery is unknown.');

  const enabledMcp = unique(runtime?.enabledMcp ?? []);
  const usedMcp = unique(runtime?.usedMcp ?? []);
  const unusedMcp = enabledMcp.filter((name) => !usedMcp.includes(name));
  const contextSources = unique(runtime?.contextSources ?? []);
  const usedContextSources = unique(runtime?.usedContextSources ?? []);
  const unusedContextSources = contextSources.filter((source) => !usedContextSources.includes(source));
  if (!runtime && !repositoryOnly) findings.push('Enabled MCP integrations and unused context sources are unknown.');
  if (unusedMcp.length) findings.push('Enabled but not evidenced as used for this task: ' + unusedMcp.join(', '));
  if (unusedContextSources.length) findings.push('Available context sources not evidenced as used for this task: ' + unusedContextSources.join(', '));

  return {
    platform,
    result: invalid.length ? 'invalid' : findings.length ? 'warning' : 'healthy',
    repository: { status: integrity.status, generatedFilesChecked: integrity.checked, drift: integrity.drift },
    instructions: {
      path: 'AGENTS.md', repositoryHash: agentsHash, expectedHash: expectedAgentsHash,
      runtimeLoaded: agentsLoaded, runtimeHashMatch: agentsHashMatch, evidenceSource: runtime?.evidenceSource ?? null,
    },
    skills: {
      roots: skills.roots,
      discovered: unique(skills.items.map((skill) => skill.name)),
      duplicates: skills.duplicates.map(({ name, kind, paths }) => ({ name, kind, paths })),
    },
    teammates,
    activeTask: { skill: activeSkill, requiredManualSections: requiredSections, loadedManualSections: loadedSections, missingManualSections: missingSections },
    integrations: { enabledMcp, usedMcp, unusedMcp, status: runtime ? 'runtime-evidenced' : repositoryOnly ? 'not-checked' : 'unknown' },
    contextSources: { available: contextSources, used: usedContextSources, unused: unusedContextSources },
    findings,
    invalid,
  };
}

export function formatMarkdown(report) {
  const line = (values) => values.length ? values.join(', ') : 'none';
  const duplicateLines = report.skills.duplicates.length
    ? report.skills.duplicates.map((item) => '- ' + item.name + ' (' + item.kind + '): ' + item.paths.join(', ')).join('\n')
    : '- none';
  const issueLines = [...report.invalid.map((item) => '- INVALID: ' + item), ...report.findings.map((item) => '- WARNING: ' + item)];
  return [
    '# Personal context audit: ' + report.platform,
    '',
    '**Result:** ' + report.result,
    '',
    '| Check | Evidence |',
    '| --- | --- |',
    '| Generated files | ' + report.repository.status + ' (' + report.repository.generatedFilesChecked + ' checked) |',
    '| AGENTS.md loaded | ' + report.instructions.runtimeLoaded + ' |',
    '| AGENTS.md hash | ' + (report.instructions.repositoryHash ?? 'missing') + ' |',
    '| Runtime evidence | ' + (report.instructions.evidenceSource ?? 'none') + ' |',
    '| Active skill | ' + (report.activeTask.skill ?? 'not supplied') + ' |',
    '| Required manual sections | ' + line(report.activeTask.requiredManualSections) + ' |',
    '| Missing manual sections | ' + line(report.activeTask.missingManualSections) + ' |',
    '| Enabled MCP integrations | ' + line(report.integrations.enabledMcp) + ' |',
    '| Unused enabled MCP integrations | ' + line(report.integrations.unusedMcp) + ' |',
    '| Unused context sources | ' + line(report.contextSources.unused) + ' |',
    '| Teammates | ' + line(report.teammates.paths) + ' |',
    '',
    '## Skills',
    '',
    'Discovery roots: ' + line(report.skills.roots),
    '',
    'Discovered: ' + line(report.skills.discovered),
    '',
    'Duplicate candidates:',
    duplicateLines,
    '',
    '## Findings',
    '',
    issueLines.length ? issueLines.join('\n') : '- none',
    '',
  ].join('\n');
}

function usage() {
  return 'Usage: node scripts/ai/context-audit.mjs (--platform codex|cursor|claude | --all) [--active-skill NAME] [--manual PATH ...] [--runtime FILE] [--repository-only] [--format markdown|json]';
}

function parseArgs(args) {
  const options = { manualSections: [], format: 'markdown', repositoryOnly: false, all: false };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--platform') options.platform = args[++index];
    else if (arg === '--all') options.all = true;
    else if (arg === '--active-skill') options.activeSkill = args[++index];
    else if (arg === '--manual') options.manualSections.push(args[++index]);
    else if (arg === '--runtime') options.runtimeFile = args[++index];
    else if (arg === '--repository-only') options.repositoryOnly = true;
    else if (arg === '--format') options.format = args[++index];
    else if (arg === '--help') options.help = true;
    else throw new Error('Unknown argument: ' + arg);
  }
  if (options.help) return options;
  if (options.all === Boolean(options.platform)) throw new Error('Choose exactly one of --platform or --all.');
  if (!['markdown', 'json'].includes(options.format)) throw new Error('Format must be markdown or json.');
  if (options.all && (options.activeSkill || options.runtimeFile || options.manualSections.length))
    throw new Error('--all is repository-only and cannot accept task runtime evidence.');
  if (options.all) options.repositoryOnly = true;
  return options;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) { console.log(usage()); return; }
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
  if (options.runtimeFile) options.runtime = JSON.parse(await readFile(path.resolve(options.runtimeFile), 'utf8'));
  const reports = [];
  for (const platform of options.all ? PLATFORMS : [options.platform]) reports.push(await auditContext(root, { ...options, platform }));
  if (options.format === 'json') console.log(JSON.stringify(options.all ? reports : reports[0], null, 2));
  else console.log(reports.map(formatMarkdown).join('\n'));
  if (reports.some((report) => report.result === 'invalid')) process.exitCode = 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => { console.error(error.message); console.error(usage()); process.exitCode = 2; });
}
