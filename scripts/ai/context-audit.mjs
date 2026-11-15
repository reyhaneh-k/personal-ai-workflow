import { createHash } from 'node:crypto';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { render } from '../../ai/generator/generate.mjs';
import { readingRequirements, capabilityFlags } from '../../ai/generator/source-contract.mjs';
import { inspectCodexContext } from './codex-discovery.mjs';

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
      else if (entry.isFile() && (typeof name === 'string' ? entry.name === name : name.test(entry.name))) found.push(target);
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

function unique(values) { return [...new Set(values)].sort(); }

async function repositoryIntegrity(root) {
  let expected;
  try { expected = await render(root); }
  catch (error) { return { status: 'invalid', checked: 0, drift: ['Canonical source validation failed: ' + error.message] }; }
  const manifestFile = path.join(root, 'ai/generated-manifest.json');
  const raw = await readOptional(manifestFile);
  if (raw === null) {
    const leftovers = [];
    for (const relative of expected.keys()) {
      if (await readOptional(path.join(root, relative)) !== null) leftovers.push(relative);
    }
    // Retired generator-marked files also make a checkout partially generated.
    for (const relative of ['.agents/skills', '.codex/agents', '.cursor/skills', '.cursor/agents', '.cursor/rules',
      '.claude/skills', '.claude/agents', 'docs/ai', 'ai/generated']) {
      for (const file of await filesNamed(path.join(root, relative), /\.(?:md|mdc|yaml|toml)$/)) {
        if ((await readFile(file, 'utf8')).includes('GENERATED from ')) leftovers.push(slash(path.relative(root, file)));
      }
    }
    return leftovers.length
      ? { status: 'missing', checked: 0, drift: ['Ownership manifest missing while generated outputs exist: ' + unique(leftovers).join(', ')] }
      : { status: 'source-only', checked: 0, drift: [] };
  }
  let manifest;
  try { manifest = JSON.parse(raw); }
  catch { return { status: 'invalid', checked: 0, drift: ['ai/generated-manifest.json is not valid JSON'] }; }
  if (manifest.version !== 1 || !manifest.files || typeof manifest.files !== 'object' || Array.isArray(manifest.files))
    return { status: 'invalid', checked: 0, drift: ['ai/generated-manifest.json has an unsupported shape'] };
  const drift = [];
  for (const [relative, expected] of Object.entries(manifest.files)) {
    if (path.isAbsolute(relative) || relative.includes('\\') || relative.split('/').some((part) => !part || part === '.' || part === '..') || !/^[a-f0-9]{64}$/.test(expected)) {
      drift.push('invalid manifest entry: ' + relative);
      continue;
    }
    let current;
    try { current = await readFile(path.join(root, relative)); }
    catch (error) { if (error.code !== 'ENOENT') throw error; current = null; }
    if (current === null) drift.push(relative + ' is missing');
    else if (digest(current.toString('utf8')) !== expected &&
      createHash('sha256').update(current).digest('hex') !== expected) drift.push(relative + ' differs from its generated hash');
  }
  for (const relative of new Set([...expected.keys(), ...Object.keys(manifest.files)])) {
    const text = expected.get(relative);
    const hash = text === undefined ? null : createHash('sha256').update(typeof text === 'string' ? normalize(text) : text).digest('hex');
    if (manifest.files[relative] !== hash) drift.push(relative + ' is out of date with canonical sources');
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
  const paths = [];
  for (const relativeRoot of TEAMMATE_ROOTS[platform]) {
    let entries = [];
    try { entries = await readdir(path.join(root, relativeRoot), { withFileTypes: true }); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
    paths.push(...entries.filter((entry) => entry.isFile() && entry.name.endsWith('.md')).map((entry) => relativeRoot + '/' + entry.name));
  }
  return { mode: 'native project teammates', paths: paths.sort() };
}

async function discoverSourceSkills(root) {
  const skills = [];
  for (const file of await filesNamed(path.join(root, 'ai/source/skills'), 'SKILL.md')) {
    const text = normalize(await readFile(file, 'utf8'));
    skills.push({ ...skillMetadata(text, path.basename(path.dirname(file))), text });
  }
  return skills;
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
  const codex = platform === 'codex' ? await inspectCodexContext(root, {
    workingDirectory: options.workingDirectory, includeUser: options.includeUser,
    userHome: options.userHome, codexHome: options.codexHome, followExternalLinks: options.followExternalLinks,
    evidence: runtime?.codex,
  }) : null;
  const skills = codex?.skills ?? await discoverSkills(root, platform);
  const teammates = codex?.teammates ?? await discoverTeammates(root, platform);
  const sourceSkills = await discoverSourceSkills(root);
  const flags = capabilityFlags(normalize(await readOptional(path.join(root, 'PROJECT.md')) ?? ''));
  const sourceOnly = integrity.status === 'source-only';
  const findings = [];
  const invalid = [];

  if (!['current', 'source-only'].includes(integrity.status)) invalid.push('AI source/output validation failed: ' + integrity.drift.join('; '));
  if (codex?.instructions.byteLimitReached) findings.push('Instruction candidates exceed the configured/default byte limit; some guidance may be truncated.');
  if (codex?.instructions.shadowed.length) findings.push('Instruction files are shadowed by higher-priority candidates; inspect the Codex instruction chain.');
  if (codex?.instructions.runtimeChainMismatch) findings.push('Reported runtime instruction paths differ from filesystem candidates; inspect effective configuration and scope.');
  if (codex?.skills.skippedLinks.length) findings.push('External skill links were excluded; pass --follow-external-links only when that read scope is intended.');
  for (const duplicate of skills.duplicates) {
    const message = duplicate.name + ' is discoverable from ' + duplicate.paths.join(', ');
    const enabledCopies = skills.items.filter((item) => item.name === duplicate.name && item.enabled !== false);
    if (duplicate.kind === 'conflicting' && enabledCopies.length > 1) invalid.push('Conflicting skill copies: ' + message);
    else if (duplicate.kind === 'conflicting') findings.push('Conflicting discovery candidates include disabled copies: ' + message);
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
    if (runtime.agentsLoaded === false && !sourceOnly) invalid.push('Runtime evidence says AGENTS.md was not loaded.');
    if (agentsHashMatch === false) invalid.push('Runtime AGENTS.md hash does not match this checkout.');
  } else if (!repositoryOnly) findings.push('Live AGENTS.md loading is unknown; supply runtime evidence from the platform.');

  const activeSkill = options.activeSkill ?? runtime?.activeSkill ?? null;
  const nativeCopies = activeSkill ? skills.items.filter((skill) => skill.name === activeSkill) : [];
  if (nativeCopies.length && nativeCopies.every((copy) => copy.enabled === false)) invalid.push('Active skill is disabled by supplied Codex configuration evidence: ' + activeSkill);
  const eligibleCopies = nativeCopies.filter((copy) => copy.enabled !== false);
  const activeCopies = eligibleCopies.length ? eligibleCopies : nativeCopies.length ? nativeCopies : sourceOnly ? sourceSkills.filter((skill) => skill.name === activeSkill) : [];
  if (activeSkill && !activeCopies.length) invalid.push('Active skill has no applicable native or canonical source: ' + activeSkill);
  const requiredSections = activeCopies.length ? readingRequirements(activeCopies[0].text, flags).applicable : [];
  const loadedSections = unique([...(options.manualSections ?? []), ...(runtime?.manualSections ?? [])]
    .map((section) => section.replace(/^ai\/source\/manual\//, 'docs/ai/')));
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
    codex: codex ? { ...codex, skills: { ...codex.skills, items: codex.skills.items.map(({ text, ...item }) => item) } } : null,
    result: invalid.length ? 'invalid' : findings.length ? 'warning' : 'healthy',
    repository: { status: integrity.status, generatedFilesChecked: integrity.checked, drift: integrity.drift },
    instructions: {
      path: 'AGENTS.md', repositoryHash: agentsHash, expectedHash: expectedAgentsHash,
      runtimeLoaded: agentsLoaded, runtimeHashMatch: agentsHashMatch, evidenceSource: runtime?.evidenceSource ?? null,
    },
    skills: {
      roots: skills.roots,
      discovered: unique(skills.items.map((skill) => skill.name)),
      sourceAvailable: unique(sourceSkills.map((skill) => skill.name)),
      duplicates: skills.duplicates.map(({ name, kind, paths }) => ({ name, kind, paths })),
    },
    teammates,
    activeTask: { skill: activeSkill, basis: activeCopies.length ? nativeCopies.length ? 'native' : 'canonical-source' : null,
      requiredManualSections: requiredSections, loadedManualSections: loadedSections, missingManualSections: missingSections },
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
    '| Active skill basis | ' + (report.activeTask.basis ?? 'not supplied') + ' |',
    '| Required manual sections | ' + line(report.activeTask.requiredManualSections) + ' |',
    '| Missing manual sections | ' + line(report.activeTask.missingManualSections) + ' |',
    '| Enabled MCP integrations | ' + line(report.integrations.enabledMcp) + ' |',
    '| Unused enabled MCP integrations | ' + line(report.integrations.unusedMcp) + ' |',
    '| Unused context sources | ' + line(report.contextSources.unused) + ' |',
    '| Teammates | ' + line(report.teammates.paths) + ' |',
    ...(report.codex ? [
      '| Codex working directory | ' + report.codex.workingDirectory + ' |',
      '| Codex instruction scope | ' + report.codex.scope.globalInstructions + ' global; filesystem candidates only |',
      '| Codex effective permissions | ' + JSON.stringify(report.codex.configuration.effectiveValues) + ' |',
      '| Codex instruction candidates | ' + line(report.codex.instructions.chain.map((item) => item.path)) + ' |',
      '| Codex shadowed instructions | ' + line(report.codex.instructions.shadowed.map((item) => item.path)) + ' |',
    ] : []),
    '',
    '## Skills',
    '',
    'Discovery roots: ' + line(report.skills.roots),
    '',
    'Native discovery candidates: ' + line(report.skills.discovered),
    '',
    'Canonical sources available (not proof of runtime loading): ' + line(report.skills.sourceAvailable),
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
  return 'Usage: node scripts/ai/context-audit.mjs (--platform codex|cursor|claude | --all) [--active-skill NAME] [--manual PATH ...] [--runtime FILE] [--repository-only] [--working-directory PATH] [--include-user] [--codex-home PATH] [--follow-external-links] [--format markdown|json]';
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
    else if (arg === '--working-directory') options.workingDirectory = args[++index];
    else if (arg === '--include-user') options.includeUser = true;
    else if (arg === '--codex-home') options.codexHome = args[++index];
    else if (arg === '--follow-external-links') options.followExternalLinks = true;
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
  if ((options.includeUser || options.codexHome || options.followExternalLinks || options.workingDirectory) && options.platform !== 'codex')
    throw new Error('Codex discovery options require --platform codex.');
  if (options.codexHome && !options.includeUser) throw new Error('--codex-home requires --include-user.');
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
