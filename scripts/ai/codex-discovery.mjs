import { readFile, readdir, realpath, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { homedir } from 'node:os';
import path from 'node:path';

async function optional(file) {
  try { return await readFile(file, 'utf8'); }
  catch (error) { if (error.code === 'ENOENT') return null; throw error; }
}
async function present(file) {
  try { return (await stat(file)).isFile(); }
  catch (error) { if (error.code === 'ENOENT') return false; throw error; }
}
const pathKey = (file) => process.platform === 'win32' ? path.resolve(file).toLowerCase() : path.resolve(file);
const within = (root, file) => pathKey(file) === pathKey(root) || pathKey(file).startsWith(pathKey(root) + path.sep);
const normalize = (text) => text.replace(/\r\n/g, '\n');
const hash = (text) => createHash('sha256').update(normalize(text)).digest('hex');
async function canonical(file) {
  try { return await realpath(file); }
  catch (error) { if (error.code === 'ENOENT') return path.resolve(file); throw error; }
}

function directories(root, cwd) {
  if (!within(root, cwd)) throw new Error('Codex working directory must be inside the audited repository');
  const relative = path.relative(root, cwd);
  const result = [root];
  if (relative) for (const part of relative.split(path.sep)) result.push(path.join(result.at(-1), part));
  return result;
}

export function validateCodexEvidence(evidence = {}) {
  if (!evidence || typeof evidence !== 'object' || Array.isArray(evidence)) throw new Error('Codex evidence must be an object');
  const allowed = ['fallbackFilenames', 'maxInstructionBytes', 'skillConfig', 'projectTrust', 'approvalPolicy',
    'sandboxMode', 'permissionProfile', 'networkAccess', 'configurationSources', 'loadedInstructionPaths'];
  if (Object.keys(evidence).some((key) => !allowed.includes(key))) throw new Error('Unsupported Codex evidence field');
  if (evidence.fallbackFilenames && (!Array.isArray(evidence.fallbackFilenames) || evidence.fallbackFilenames.some((name) =>
    typeof name !== 'string' || !name || name === '.' || name === '..' || /[\\/:]/.test(name)))) throw new Error('Invalid fallback filenames');
  if (evidence.maxInstructionBytes !== undefined && (!Number.isSafeInteger(evidence.maxInstructionBytes) || evidence.maxInstructionBytes < 1))
    throw new Error('Invalid instruction byte limit');
  if (evidence.skillConfig !== undefined && (!Array.isArray(evidence.skillConfig) || evidence.skillConfig.some((item) =>
    !item || typeof item !== 'object' || typeof item.enabled !== 'boolean' ||
    Object.keys(item).some((key) => !['name', 'path', 'enabled'].includes(key)) ||
    Number(Object.hasOwn(item, 'name')) + Number(Object.hasOwn(item, 'path')) !== 1 ||
    Object.hasOwn(item, 'name') && (typeof item.name !== 'string' || !item.name) ||
    Object.hasOwn(item, 'path') && (typeof item.path !== 'string' || !path.isAbsolute(item.path)))))
    throw new Error('Skill config evidence requires one name or absolute path selector and enabled');
  for (const key of ['configurationSources', 'loadedInstructionPaths']) {
    if (evidence[key] !== undefined && (!Array.isArray(evidence[key]) || evidence[key].some((item) => typeof item !== 'string')))
      throw new Error('Invalid Codex evidence list: ' + key);
  }
  if (evidence.loadedInstructionPaths?.some((file) => !path.isAbsolute(file))) throw new Error('Loaded instruction paths must be absolute');
  const values = { projectTrust: ['trusted', 'untrusted', 'unknown'], approvalPolicy: ['on-request', 'never', 'granular', 'unknown'],
    sandboxMode: ['read-only', 'workspace-write', 'danger-full-access', 'unknown'], networkAccess: ['enabled', 'disabled', 'unknown'] };
  for (const [key, choices] of Object.entries(values)) if (evidence[key] !== undefined && !choices.includes(evidence[key]))
    throw new Error('Invalid Codex evidence value: ' + key);
  if (evidence.permissionProfile !== undefined && (typeof evidence.permissionProfile !== 'string' ||
    !/^[:a-zA-Z0-9_-]+$/.test(evidence.permissionProfile))) throw new Error('Invalid permission profile evidence');
  return evidence;
}

export async function inspectCodexContext(directory, options = {}) {
  const root = await realpath(directory);
  const cwd = await realpath(path.resolve(root, options.workingDirectory ?? '.'));
  const chain = directories(root, cwd);
  const evidence = validateCodexEvidence(options.evidence);
  const homeCandidate = path.resolve(options.userHome ?? homedir());
  const userHome = options.includeUser ? await canonical(homeCandidate) : homeCandidate;
  const codexCandidate = path.resolve(options.codexHome ?? process.env.CODEX_HOME ?? path.join(userHome, '.codex'));
  const codexHome = options.includeUser ? await canonical(codexCandidate) : codexCandidate;
  const skillConfig = await Promise.all((evidence.skillConfig ?? []).map(async (item) =>
    item.path ? { ...item, path: await canonical(item.path) } : item));
  const instructionDirs = [...(options.includeUser ? [codexHome] : []), ...chain];
  const limit = evidence.maxInstructionBytes ?? 32768;
  const fallback = evidence.fallbackFilenames ?? [];
  const instructionChain = [], shadowed = [];
  let used = 0;
  for (const directory of instructionDirs) {
    let selected = false;
    const names = ['AGENTS.override.md', 'AGENTS.md', ...(directory === codexHome && options.includeUser ? [] : fallback)];
    for (const filename of [...new Set(names)]) {
      const file = path.join(directory, filename);
      const text = await optional(file);
      if (!text?.trim()) continue;
      if (selected) { shadowed.push({ path: file, reason: 'Higher-priority nonempty file in the same directory' }); continue; }
      selected = true;
      const separator = instructionChain.length ? 2 : 0;
      const bytes = Buffer.byteLength(text);
      const remaining = Math.max(0, limit - used - separator);
      const includedBytes = Math.min(bytes, remaining);
      instructionChain.push({ path: file, hash: hash(text), bytes, includedBytes,
        truncated: includedBytes < bytes, basis: 'filesystem-candidate-not-runtime-proof' });
      used = Math.min(limit, used + separator + includedBytes);
    }
  }

  const skillRoots = [...chain.map((dir) => path.join(dir, '.agents/skills')),
    ...(options.includeUser ? [path.join(userHome, '.agents/skills')] : [])];
  const userSkillRoot = path.join(userHome, '.agents/skills');
  const skills = [], skippedLinks = [];
  for (const skillRoot of skillRoots) {
    const visited = new Set();
    async function visit(dir) {
      let resolved;
      try { resolved = await realpath(dir); }
      catch (error) { if (error.code === 'ENOENT') return; throw error; }
      if (!within(root, resolved) && !(options.includeUser && within(userSkillRoot, resolved)) && !options.followExternalLinks) { skippedLinks.push(dir); return; }
      if (visited.has(resolved)) return;
      visited.add(resolved);
      const entries = await readdir(dir, { withFileTypes: true });
      const skillFile = path.join(dir, 'SKILL.md');
      const text = await optional(skillFile);
      if (text !== null) {
        const normalized = normalize(text);
        const header = normalized.match(/^---\n([\s\S]*?)\n---(?:\n|$)/)?.[1] ?? '';
        const field = (name) => header.match(new RegExp('^' + name + ':\\s*(.+)$', 'm'))?.[1]?.trim().replace(/^["']|["']$/g, '');
        const name = field('name'), description = field('description');
        if (!name || !description) throw new Error('Missing skill name/description: ' + skillFile);
        let enabled = evidence.skillConfig === undefined ? 'unknown' : true;
        const canonicalSkillFile = await canonical(skillFile);
        for (const item of skillConfig) if (item.name === name || item.path && pathKey(item.path) === pathKey(canonicalSkillFile)) enabled = item.enabled;
        const metadataText = await optional(path.join(dir, 'agents/openai.yaml'));
        let implicitInvocation = 'unknown';
        if (metadataText !== null) {
          try {
            const metadata = JSON.parse(metadataText.replace(/^#[^\n]*(?:\n|$)/gm, ''));
            if (typeof metadata.policy?.allow_implicit_invocation === 'boolean') implicitInvocation = metadata.policy.allow_implicit_invocation;
          } catch { /* Arbitrary YAML needs client/parser evidence; do not guess from an unrelated key. */ }
        }
        skills.push({ name, description, text: normalized, path: skillFile, hash: hash(text), enabled,
          metadataPresent: metadataText !== null, implicitInvocation });
        return; // Resources inside a skill aren't separately discovered skills.
      }
      for (const entry of entries) {
        if (['.git', 'node_modules'].includes(entry.name)) continue;
        if (entry.isDirectory() || entry.isSymbolicLink()) {
          const next = path.join(dir, entry.name);
          if ((await stat(next).catch((error) => { if (error.code === 'ENOENT') return null; throw error; }))?.isDirectory()) await visit(next);
        }
      }
    }
    await visit(skillRoot);
  }
  const groups = new Map();
  for (const skill of skills) groups.set(skill.name, [...(groups.get(skill.name) ?? []), skill]);
  const duplicates = [...groups].filter(([, copies]) => copies.length > 1).map(([name, copies]) => ({
    name, kind: new Set(copies.map((copy) => copy.hash)).size === 1 ? 'identical' : 'conflicting', paths: copies.map((copy) => copy.path) }));

  const agentPaths = [], configFiles = [], rules = [];
  for (const dir of instructionDirs) {
    const configDir = dir === codexHome && options.includeUser ? codexHome : path.join(dir, '.codex');
    for (const filename of ['config.toml', 'hooks.json']) if (await present(path.join(configDir, filename))) configFiles.push(path.join(configDir, filename));
    for (const [subdir, extension, found] of [['agents', '.toml', agentPaths], ['rules', '.rules', rules]]) {
      const entries = await readdir(path.join(configDir, subdir), { withFileTypes: true }).catch((error) => { if (error.code === 'ENOENT') return []; throw error; });
      for (const entry of entries) if (entry.isFile() && entry.name.endsWith(extension)) found.push(path.join(configDir, subdir, entry.name));
    }
  }
  const loaded = evidence.loadedInstructionPaths ? await Promise.all(evidence.loadedInstructionPaths.map(canonical)) : undefined;
  const candidatePaths = instructionChain.filter((item) => item.includedBytes > 0).map((item) => item.path);
  const mismatch = loaded ? loaded.length !== candidatePaths.length || loaded.some((file, index) => pathKey(file) !== pathKey(candidatePaths[index])) : null;
  return {
    root, workingDirectory: cwd,
    scope: { includeUser: !!options.includeUser, globalInstructions: options.includeUser ? 'inspected' : 'not-inspected',
      adminAndSystemSkills: 'runtime-evidence-required', pluginSkills: 'runtime-evidence-required',
      externalSkillLinks: options.followExternalLinks ? 'followed' : 'excluded-outside-explicit-repository-or-user-skill-scope' },
    instructions: { chain: instructionChain, shadowed, limit, settingsBasis: options.evidence ? 'supplied-evidence-plus-defaults' : 'defaults-unverified',
      byteLimitReached: instructionChain.some((item) => item.truncated), runtimeChainMismatch: mismatch },
    skills: { roots: skillRoots, items: skills, duplicates, skippedLinks },
    teammates: { mode: 'native Codex custom agents; parent permissions inherited', paths: [...new Set(agentPaths)] },
    configuration: { filesPresent: [...new Set(configFiles)], rulesPresent: [...new Set(rules)],
      effectiveValues: { projectTrust: evidence.projectTrust ?? 'unknown', approvalPolicy: evidence.approvalPolicy ?? 'unknown',
        sandboxMode: evidence.sandboxMode ?? 'unknown', permissionProfile: evidence.permissionProfile ?? 'unknown', networkAccess: evidence.networkAccess ?? 'unknown' },
      sources: evidence.configurationSources ?? [], basis: 'presence-and-explicit-evidence-only; private-config-values-not-read' },
  };
}
