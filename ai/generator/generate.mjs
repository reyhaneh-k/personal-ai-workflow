import { createHash } from 'node:crypto';
import { lstat, mkdir, readFile, readdir, realpath, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const platforms = ['codex', 'cursor', 'claude'];
const manifestPath = 'ai/generated-manifest.json';
const cursorPluginRoot = 'ai/generated/cursor-plugin';
const normalize = (s) => s.replace(/\r\n/g, '\n');
const digest = (s) => createHash('sha256').update(typeof s === 'string' ? normalize(s) : s).digest('hex');
const validName = (s) => typeof s === 'string' && /^personal-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s) && s.length < 64;
const scopedAgents = (p) => /^(?!ai\/|\.git\/|\.agents\/|\.cursor\/|\.claude\/|docs\/ai\/|node_modules\/)(?:[a-zA-Z0-9_-]+\/)+AGENTS\.md$/.test(p);
const allowed = (p) => p === 'AGENTS.md' || scopedAgents(p) ||
  /^docs\/ai\/[a-zA-Z0-9-]+\.md$/.test(p) ||
  /^\.(?:agents|cursor|claude)\/skills\/personal-[a-z0-9-]+\/SKILL\.md$/.test(p) ||
  /^\.(?:agents|cursor|claude)\/skills\/personal-[a-z0-9-]+\/(?:scripts|references|assets)\/(?:[A-Za-z0-9._-]+\/)*[A-Za-z0-9._-]+$/.test(p) ||
  /^\.(?:cursor|claude)\/agents\/personal-[a-z0-9-]+\.md$/.test(p) ||
  /^\.cursor\/rules\/[a-z0-9]+(?:-[a-z0-9]+)*\.mdc$/.test(p) ||
  new RegExp('^' + cursorPluginRoot + '/(?:README\\.md|\\.cursor-plugin/plugin\\.json|skills/personal-[a-z0-9-]+/(?:SKILL\\.md|(?:scripts|references|assets)/(?:[A-Za-z0-9._-]+/)*[A-Za-z0-9._-]+)|agents/personal-[a-z0-9-]+\\.md|rules/[a-z0-9]+(?:-[a-z0-9]+)*\\.mdc)$').test(p) ||
  ['.cursor/BUGBOT.md', '.cursor/config/bugbot.yaml', '.cursor/rules/README.md', '.cursor/mcp.json', '.cursor/permissions.json'].includes(p);

async function safePath(root, relative) {
  if (!relative || relative.includes('\\') || relative.split('/').some((s) => !s || s === '..' || s === '.') || path.isAbsolute(relative))
    throw new Error('Invalid relative path: ' + relative);
  let current = root;
  for (const part of relative.split('/')) {
    current = path.join(current, part);
    try {
      if ((await lstat(current)).isSymbolicLink()) throw new Error('Refusing linked path: ' + relative);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
  return current;
}
async function read(root, p, optional = false) {
  const absolute = await safePath(root, p);
  try { return normalize(await readFile(absolute, 'utf8')); }
  catch (error) { if (optional && error.code === 'ENOENT') return null; throw error; }
}
async function readBytes(root, p) { return readFile(await safePath(root, p)); }
async function list(root, p) {
  const entries = await readdir(await safePath(root, p), { withFileTypes: true });
  if (entries.some((e) => e.isSymbolicLink())) throw new Error('Linked source entry in ' + p);
  return entries.sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
}
async function scopedInstructionSources(root, relative = 'ai/source/scoped-instructions', scope = []) {
  const found = [];
  for (const entry of await list(root, relative)) {
    if (entry.name === 'README.md' && scope.length === 0 && entry.isFile()) continue;
    if (entry.isFile()) {
      if (entry.name !== 'instructions.md' || scope.length === 0)
        throw new Error('Invalid scoped instruction source: ' + relative + '/' + entry.name);
      found.push({ source: relative + '/' + entry.name, destination: scope.join('/') + '/AGENTS.md' });
      continue;
    }
    if (!entry.isDirectory() || !/^[a-zA-Z0-9_-]+$/.test(entry.name))
      throw new Error('Invalid scoped instruction directory: ' + relative + '/' + entry.name);
    found.push(...await scopedInstructionSources(root, relative + '/' + entry.name, [...scope, entry.name]));
  }
  return found;
}
async function skillResources(root, relative, destination = '') {
  const files = [];
  for (const entry of await list(root, relative)) {
    if (!/^[A-Za-z0-9._-]+$/.test(entry.name)) throw new Error('Invalid skill resource name: ' + relative + '/' + entry.name);
    const source = relative + '/' + entry.name, target = destination ? destination + '/' + entry.name : entry.name;
    if (entry.isFile()) files.push({ source, destination: target });
    else if (entry.isDirectory()) files.push(...await skillResources(root, source, target));
    else throw new Error('Invalid skill resource entry: ' + source);
  }
  return files;
}
function frontmatter(text, expectedName) {
  const match = text.match(/^---\n([\s\S]*?)\n---(?:\n|$)/);
  if (!match) throw new Error('Missing frontmatter: ' + expectedName);
  for (const field of ['name', 'description']) {
    const value = match[1].match(new RegExp('^' + field + ': (.+)$', 'm'))?.[1]?.trim();
    if (!value || ['|', '>'].includes(value)) throw new Error('Expected single-line ' + field + ': ' + expectedName);
    if (field === 'name' && value.replace(/^["']|["']$/g, '') !== expectedName) throw new Error('Skill name mismatch: ' + expectedName);
  }
}
function mark(text, source, yaml = false) {
  const note = 'GENERATED from ' + source + '; edit source and run pnpm ai:generate.';
  if (yaml) return '# ' + note + '\n' + text.trimEnd() + '\n';
  const end = text.startsWith('---\n') ? text.indexOf('\n---', 4) + 4 : 0;
  const comment = '<!-- ' + note + ' -->';
  return end > 4 ? text.slice(0, end) + '\n\n' + comment + '\n' + text.slice(end).trimEnd() + '\n'
    : comment + '\n\n' + text.trimEnd() + '\n';
}

export async function render(root) {
  const outputs = new Map();
  function emit(p, text, origin, yaml = false) {
    if (!allowed(p) || outputs.has(p)) throw new Error('Invalid or duplicate destination: ' + p);
    // JSON consumers do not accept HTML/YAML generation markers. Ownership is in the manifest.
    outputs.set(p, p.endsWith('.json') ? text.trimEnd() + '\n' : mark(text, origin, yaml));
  }
  const rootSource = 'ai/source/instructions.md';
  emit('AGENTS.md', await read(root, rootSource), rootSource);
  for (const { source, destination } of await scopedInstructionSources(root))
    emit(destination, await read(root, source), source);
  const skills = new Map();
  for (const entry of await list(root, 'ai/source/skills')) {
    if (!entry.isDirectory() || !validName(entry.name)) throw new Error('Invalid skill directory: ' + entry.name);
    const p = 'ai/source/skills/' + entry.name + '/SKILL.md';
    const children = await list(root, 'ai/source/skills/' + entry.name);
    const supportedDirectories = new Set(['scripts', 'references', 'assets']);
    if (!children.some((child) => child.name === 'SKILL.md' && child.isFile()) ||
      children.some((child) => child.name !== 'SKILL.md' && (!child.isDirectory() || !supportedDirectories.has(child.name))))
      throw new Error('Skill must contain SKILL.md and optional scripts/, references/, or assets/ directories: ' + entry.name);
    const text = await read(root, p);
    frontmatter(text, entry.name);
    const resources = [];
    for (const child of children) {
      if (supportedDirectories.has(child.name))
        resources.push(...await skillResources(root, 'ai/source/skills/' + entry.name + '/' + child.name, child.name));
    }
    skills.set(entry.name, { text, p, resources });
  }
  if (!skills.size) throw new Error('No source skills');
  const roles = [];
  for (const entry of await list(root, 'ai/source/agents')) {
    if (!entry.isFile() || !entry.name.endsWith('.json')) throw new Error('Invalid role file: ' + entry.name);
    const p = 'ai/source/agents/' + entry.name;
    const role = JSON.parse(await read(root, p));
    if (!validName(role.name) || entry.name !== role.name + '.json' ||
      typeof role.description !== 'string' || !role.description.trim() ||
      typeof role.body !== 'string' || !role.body.trim() || typeof role.readOnly !== 'boolean' ||
      !Array.isArray(role.skills) || !role.skills.length || role.skills.some((s) => !skills.has(s)) ||
      !Array.isArray(role.nextTeammates) || role.nextTeammates.length > 3 || role.nextTeammates.some((s) => !validName(s)))
      throw new Error('Invalid role or missing skill reference: ' + p);
    roles.push({ ...role, p });
  }
  for (const role of roles) {
    if (role.nextTeammates.includes(role.name) || role.nextTeammates.some((name) => !roles.some((candidate) => candidate.name === name)))
      throw new Error('Invalid next teammate reference: ' + role.p);
  }
  function emitRaw(p, bytes) {
    if (!allowed(p) || outputs.has(p)) throw new Error('Invalid or duplicate destination: ' + p);
    outputs.set(p, bytes);
  }
  const cursorBuiltInsPath = 'ai/platform-overrides/cursor/agent-builtins.json';
  const cursorBuiltIns = JSON.parse(await read(root, cursorBuiltInsPath));
  const builtInCommands = new Set(['/automate', '/autopilot', '/canvas', '/create-hook', '/create-rule',
    '/create-skill', '/create-subagent', '/cursor-blame', '/loop', '/migrate-to-skills', '/review',
    '/review-bugbot', '/review-security', '/sdk', '/shell', '/split-to-prs']);
  if (!cursorBuiltIns || typeof cursorBuiltIns !== 'object' || Array.isArray(cursorBuiltIns) ||
    Object.keys(cursorBuiltIns).length !== roles.length || Object.keys(cursorBuiltIns).some((name) => !roles.some((role) => role.name === name)) ||
    Object.values(cursorBuiltIns).some((commands) => !Array.isArray(commands) || !commands.length || commands.some((command) => !builtInCommands.has(command))))
    throw new Error('Invalid Cursor agent built-in mapping: ' + cursorBuiltInsPath);
  for (const platform of platforms) {
    const adapterPath = 'ai/platform-overrides/' + platform + '/adapter.json';
    const adapter = JSON.parse(await read(root, adapterPath));
    const expectedSkills = platform === 'codex' ? '.agents/skills' : '.' + platform + '/skills';
    const expectedAgents = platform === 'codex' ? null : '.' + platform + '/agents';
    if (adapter.skillsDirectory !== expectedSkills || adapter.agentsDirectory !== expectedAgents)
      throw new Error('Invalid native directories: ' + platform);
    for (const [name, { text, p, resources }] of skills) {
      const others = platforms.filter((x) => x !== platform).map((x) => x === 'codex' ? '.agents/skills/' : '.' + x + '/skills/');
      if (others.some((prefix) => text.includes(prefix))) throw new Error('Cross-platform skill dependency: ' + name);
      emit(adapter.skillsDirectory + '/' + name + '/SKILL.md', text, p);
      for (const resource of resources)
        emitRaw(adapter.skillsDirectory + '/' + name + '/' + resource.destination, await readBytes(root, resource.source));
    }
    if (!adapter.agentsDirectory) continue;
    if (adapter.agentModel !== 'inherit') throw new Error('Unsupported agent model: ' + platform);
    const overrides = adapter.agentOverrides ?? {};
    if (Object.keys(overrides).some((name) => !roles.some((r) => r.name === name)))
      throw new Error('Unknown role override: ' + platform);
    for (const role of roles) {
      const override = overrides[role.name] ?? {};
      let model = 'inherit';
      if (platform === 'cursor') {
        if (Object.keys(override).some((key) => key !== 'model') ||
          (override.model && !/^[a-z0-9][a-z0-9.-]*(?:\[[a-zA-Z0-9=,.-]*\])?$/.test(override.model)))
          throw new Error('Unsupported Cursor role override');
        if (override.model) model = override.model;
      }
      const lines = ['---', 'name: ' + role.name, 'description: ' + JSON.stringify(role.description), 'model: ' + model];
      if (platform === 'claude') {
        if (role.readOnly) {
          if (!Array.isArray(adapter.readOnlyDisallowedTools) ||
            adapter.readOnlyDisallowedTools.some((t) => !['Write','Edit','NotebookEdit'].includes(t)) ||
            !['Write','Edit'].every((t) => adapter.readOnlyDisallowedTools.includes(t)))
            throw new Error('Invalid Claude read-only denied tool list');
          lines.push('disallowedTools: ' + adapter.readOnlyDisallowedTools.join(', '));
        }
        lines.push('skills:', ...role.skills.map((s) => '  - ' + s));
        if (Object.keys(override).some((k) => k !== 'memory') || (override.memory && override.memory !== 'project'))
          throw new Error('Unsupported Claude role override');
        if (override.memory) lines.push('memory: project');
      }
      const routing = 'Use the ' + role.skills.map((s) => '\x60' + s + '\x60').join(', ') +
        ' skills from \x60' + adapter.skillsDirectory + '/\x60. Follow shared \x60AGENTS.md\x60 and relevant \x60docs/ai/\x60 references.';
      const allowedNext = [...role.nextTeammates.map((name) => '\x60' + name + '\x60'), '\x60none\x60'].join(', ');
      const handoff = 'End completed work with the compact **Next teammate** block from \x60AGENTS.md\x60. ' +
        'For this role, **Recommended** must be one of: ' + allowedNext + '. Recommend at most one and do not start it automatically.';
      const native = platform === 'cursor'
        ? '## Native Cursor capabilities\n\nWhen available and relevant, use: ' + cursorBuiltIns[role.name].map((command) => '\x60' + command + '\x60').join(', ') +
          '. Use persistent configuration, hooks, automations, PR-monitoring, or publishing actions only when the human explicitly requests them. Do not treat a native capability as authorization.'
        : '';
      emit(adapter.agentsDirectory + '/' + role.name + '.md',
        lines.join('\n') + '\n---\n\n' + routing + '\n\n' + role.body + (native ? '\n\n' + native : '') + '\n\n' + handoff + '\n',
        role.p + ' + ' + adapterPath + (platform === 'cursor' ? ' + ' + cursorBuiltInsPath : ''));
    }
  }
  for (const entry of await list(root, 'ai/source/manual')) {
    if (!entry.isFile() || !/^[a-zA-Z0-9-]+\.md$/.test(entry.name)) throw new Error('Invalid manual: ' + entry.name);
    const p = 'ai/source/manual/' + entry.name;
    emit('docs/ai/' + entry.name, await read(root, p), p);
  }
  for (const [name, out] of [['BUGBOT.md', '.cursor/BUGBOT.md'], ['bugbot.yaml', '.cursor/config/bugbot.yaml']]) {
    const p = 'ai/platform-overrides/cursor/' + name, text = await read(root, p);
    if (name.endsWith('.yaml') && !/^autofix:\n  mode: disabled(?:\n|$)/m.test(text))
      throw new Error('Bugbot Autofix must remain disabled');
    emit(out, text, p, name.endsWith('.yaml'));
  }
  for (const entry of await list(root, 'ai/platform-overrides/cursor/rules')) {
    if (!entry.isFile() || (entry.name !== 'README.md' && !/^[a-z0-9]+(?:-[a-z0-9]+)*\.mdc$/.test(entry.name)))
      throw new Error('Invalid Cursor rule source: ' + entry.name);
    const p = 'ai/platform-overrides/cursor/rules/' + entry.name;
    const text = await read(root, p);
    if (entry.name.endsWith('.mdc') && !/^---\n[\s\S]*?\n---(?:\n|$)/.test(text))
      throw new Error('Missing Cursor rule frontmatter: ' + entry.name);
    emit('.cursor/rules/' + entry.name, text, p);
  }
  const pluginManifestPath = 'ai/platform-overrides/cursor/plugin.json';
  const pluginManifest = JSON.parse(await read(root, pluginManifestPath));
  if (!validName(pluginManifest.name) || !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(pluginManifest.version ?? '') ||
    typeof pluginManifest.description !== 'string' || !pluginManifest.description.trim() ||
    ['skills', 'agents', 'rules', 'commands', 'hooks', 'mcpServers', 'variables'].some((field) => Object.hasOwn(pluginManifest, field)))
    throw new Error('Invalid Cursor plugin manifest: ' + pluginManifestPath);
  emit(cursorPluginRoot + '/.cursor-plugin/plugin.json', JSON.stringify(pluginManifest, null, 2), pluginManifestPath);
  const pluginReadmePath = 'ai/platform-overrides/cursor/plugin-README.md';
  emit(cursorPluginRoot + '/README.md', await read(root, pluginReadmePath), pluginReadmePath);
  for (const [name, { text, p, resources }] of skills) {
    emit(cursorPluginRoot + '/skills/' + name + '/SKILL.md', text, p);
    for (const resource of resources)
      emitRaw(cursorPluginRoot + '/skills/' + name + '/' + resource.destination, await readBytes(root, resource.source));
  }
  for (const role of roles) {
    const pluginAgent = outputs.get('.cursor/agents/' + role.name + '.md');
    emit(cursorPluginRoot + '/agents/' + role.name + '.md', pluginAgent.replace(/^<!-- GENERATED[^>]+-->\n\n/, ''), role.p + ' + ' + pluginManifestPath);
  }
  for (const entry of await list(root, 'ai/platform-overrides/cursor/rules')) {
    if (entry.name === 'README.md') continue;
    const p = 'ai/platform-overrides/cursor/rules/' + entry.name;
    emit(cursorPluginRoot + '/rules/' + entry.name, await read(root, p), p);
  }
  for (const [p, text] of outputs) {
    if (typeof text !== 'string') continue;
    for (const match of text.matchAll(/\x60((?:docs\/ai\/|scripts\/ai\/)[a-zA-Z0-9/.-]+\.(?:md|mjs))\x60/g)) {
      if (!outputs.has(match[1]) && await read(root, match[1], true) === null)
        throw new Error('Missing reference in ' + p + ': ' + match[1]);
    }
  }
  return new Map([...outputs].sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0));
}

export async function generate(directory, mode = 'write') {
  if (!['write', 'check', 'preview', 'restore'].includes(mode)) throw new Error('Unknown mode: ' + mode);
  const root = await realpath(directory);
  for (const p of ['CLAUDE.md', '.claude/CLAUDE.md']) {
    if (await read(root, p, true) !== null) throw new Error('Remove ' + p + ' after preserving its instructions; AGENTS.md is the shared entry point.');
  }
  const outputs = await render(root);
  const oldText = await read(root, manifestPath, true);
  if (mode === 'restore' && oldText !== null)
    throw new Error('Recovery is only for a missing generated manifest; use normal generation instead.');
  const old = oldText === null ? { version: 1, files: {} } : JSON.parse(oldText);
  if (old.version !== 1 || !old.files || Array.isArray(old.files) || typeof old.files !== 'object')
    throw new Error('Invalid generated manifest');
  for (const [p, hash] of Object.entries(old.files)) {
    if (!allowed(p) || typeof hash !== 'string' || !/^[a-f0-9]{64}$/.test(hash)) throw new Error('Invalid manifest entry: ' + p);
  }
  const manifest = JSON.stringify({ version: 1, files: Object.fromEntries([...outputs].map(([p,t]) => [p, digest(t)])) }, null, 2) + '\n';
  const changes = [], conflicts = [];
  for (const p of [...new Set([...outputs.keys(), ...Object.keys(old.files)])].sort()) {
    // Release legacy ownership without reading, overwriting, or deleting personal settings.
    if (['.cursor/mcp.json', '.cursor/permissions.json'].includes(p)) continue;
    const next = outputs.get(p), current = next !== undefined && typeof next !== 'string'
      ? await readFile(await safePath(root, p)).catch((error) => { if (error.code === 'ENOENT') return null; throw error; })
      : await read(root, p, true);
    const recoverable = mode === 'restore' && oldText === null && current !== null &&
      (digest(current) === digest(next) || (typeof next === 'string' && current.includes('GENERATED from ')));
    if (current !== null && !Object.hasOwn(old.files, p) && !recoverable) conflicts.push('Unowned existing file: ' + p);
    else if (mode !== 'restore' && current !== null && digest(current) !== old.files[p]) conflicts.push('Edited generated file: ' + p + ' (preserve edits in source before restoring output)');
    if (next === undefined) { if (current !== null) changes.push({ kind: 'remove', p }); }
    else if (current === null || digest(current) !== digest(next)) changes.push({ kind: current === null ? 'create' : 'update', p, text: next });
  }
  if (oldText !== manifest) changes.push({ kind: oldText === null ? 'create' : 'update', p: manifestPath, text: manifest });
  if (conflicts.length) throw new Error(conflicts.join('\n'));
  if (mode === 'check' && changes.length) throw new Error('AI outputs are out of date. Run pnpm ai:generate:\n' + changes.map((c) => c.kind + ' ' + c.p).join('\n'));
  if (mode === 'write' || mode === 'restore') {
    // All ownership, reference, and path checks finish before the first mutation.
    for (const change of changes) {
      const target = await safePath(root, change.p);
      if (change.kind === 'remove') await unlink(target);
      else { await mkdir(path.dirname(target), { recursive: true }); await writeFile(target, change.text, 'utf8'); }
    }
  }
  return { files: outputs.size, changes: changes.map(({ kind, p }) => kind + ' ' + p) };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2), flag = args[0];
  if (args.length > 1 || (flag && !['--check', '--dry-run', '--restore', '--help'].includes(flag))) {
    console.error('Usage: node ai/generator/generate.mjs [--check | --dry-run | --restore | --help]');
    process.exitCode = 1;
  } else if (flag === '--help') console.log('Generate all native AI files. --check detects drift without writing; --dry-run previews changes; --restore recovers generator-marked outputs when the manifest is missing.');
  else {
    const root = fileURLToPath(new URL('../../', import.meta.url));
    try {
      const result = await generate(root, flag === '--check' ? 'check' : flag === '--dry-run' ? 'preview' : flag === '--restore' ? 'restore' : 'write');
      console.log(result.changes.length ? result.changes.join('\n') : 'AI files are synchronized.');
      console.log(result.files + ' generated files; three platforms; shared AGENTS.md.');
    } catch (error) { console.error(error.message); process.exitCode = 1; }
  }
}
