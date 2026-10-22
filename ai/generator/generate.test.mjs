import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { cp, mkdtemp, mkdir, readFile, rm, unlink, writeFile, access, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { generate, render } from './generate.mjs';
import { setupFigma } from './setup-figma.mjs';

const repo = fileURLToPath(new URL('../../', import.meta.url));

test('manual sections and all active skill reading requirements stay aligned', async () => {
  const outputs = await render(repo);
  const map = outputs.get('docs/ai/manual-routing.md');
  const rows = new Map([...map.matchAll(/^\| `([^`]+)` \| (.+) \|$/gm)].map((m) => [m[1], m[2]]));
  const active = [...outputs.keys()].filter((p) => p.startsWith('.agents/skills/') && !p.includes('personal-project-orientation'));
  for (const p of active) {
    const name = p.split('/')[2], text = outputs.get(p);
    assert.ok(rows.has(name), 'Missing task mapping: ' + name);
    assert.match(text, /## Manual context/);
    if (!['personal-update-ai-manual', 'personal-context-audit', 'personal-token-usage-audit', 'personal-canvas-report'].includes(name)) {
      const required = text.match(/^Required sections: (.+)$/m)?.[1];
      assert.ok(required, 'Missing required sections: ' + name);
      const refs = (s) => [...s.matchAll(/`(docs\/ai\/manual-[a-z-]+\.md)`/g)].map((m) => m[1]).sort();
      assert.deepEqual(refs(required), refs(rows.get(name)), 'Required map drift: ' + name);
      assert.ok(refs(required).length > 0);
    }
    if (name === 'personal-context-audit') assert.match(rows.get(name), /no product-manual section/);
    if (name === 'personal-token-usage-audit') assert.match(rows.get(name), /token-usage\.md/);
    if (name === 'personal-canvas-report') {
      assert.ok(rows.get(name).includes('`docs/ai/cursor-canvas.md`'));
      assert.ok(text.includes('`docs/ai/cursor-canvas.md`'));
      for (const [, dependency] of text.matchAll(/`(personal-[a-z-]+)`/g))
        assert.ok(outputs.has('.agents/skills/' + dependency + '/SKILL.md'), 'Missing Canvas source workflow: ' + dependency);
    }
    for (const match of text.matchAll(/`(docs\/ai\/manual-[a-z-]+\.md)`/g))
      assert.ok(outputs.has(match[1]), 'Missing section: ' + match[1]);
    for (const platform of ['.cursor', '.claude'])
      assert.equal(outputs.get(p.replace('.agents', platform)), text, 'Platform reading drift');
  }
  assert.equal(rows.size, active.length + 1, 'Stale or missing skill mapping');
  const index = outputs.get('docs/ai/project-manual.md');
  for (const [p, text] of outputs) {
    if (!/^docs\/ai\/manual-(?!routing)[a-z-]+\.md$/.test(p)) continue;
    assert.ok(index.includes('(' + p.replace('docs/ai/', '') + ')'), 'Section absent from contents');
    if (p === 'docs/ai/manual-testing.md') assert.match(text, /Status: PARTIAL/);
    else assert.match(text, /Status: TEMPLATE/);
    assert.match(text, /Source or reviewed example/);
    assert.ok(active.some((skill) => outputs.get(skill).includes('`' + p + '`')), 'Unrouted section: ' + p);
  }
});

test('Figma and Sentry skills expose human-selected access and capacity fallbacks on every platform', async () => {
  const outputs = await render(repo);
  const integrations = outputs.get('docs/ai/integrations.md');
  assert.match(integrations, /MCP capacity: sufficient \| insufficient \| unknown/);
  assert.match(integrations, /fallback was not pre-authorized, ask first/);
  for (const platform of ['.agents', '.cursor', '.claude']) {
    const figma = outputs.get(platform + '/skills/personal-implement-figma/SKILL.md');
    const sentry = outputs.get(platform + '/skills/personal-investigate-sentry/SKILL.md');
    assert.match(figma, /show the human-visible preflight and ask whether to use MCP/);
    assert.match(figma, /capacity is unknown, say so/);
    assert.match(sentry, /show the human-visible preflight and ask whether to use a read-only Sentry MCP/);
    assert.match(sentry, /client hides quota metadata/);
    assert.match(figma, /`docs\/ai\/integrations\.md`/);
    assert.match(sentry, /`docs\/ai\/integrations\.md`/);
  }
});

test('a missing required manual section blocks generation', async (t) => {
  const root = await fixture(t);
  await unlink(path.join(root, 'ai/source/manual/manual-api.md'));
  await assert.rejects(generate(root), /Missing reference/);
});
async function fixture(t) {
  const root = await mkdtemp(path.join(tmpdir(), 'personal-generator-test-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await cp(path.join(repo, 'ai/source'), path.join(root, 'ai/source'), { recursive: true });
  await cp(path.join(repo, 'ai/platform-overrides'), path.join(root, 'ai/platform-overrides'), { recursive: true });
  await mkdir(path.join(root, 'scripts/ai'), { recursive: true });
  await writeFile(path.join(root, 'scripts/ai/sentry-readonly.mjs'), '// Fixture reference only\n');
  await writeFile(path.join(root, 'scripts/ai/context-audit.mjs'), '// Fixture reference only\n');
  await writeFile(path.join(root, 'scripts/ai/token-usage-audit.mjs'), '// Fixture reference only\n');
  await writeFile(path.join(root, 'scripts/ai/load-ai-env.mjs'), '// Fixture reference only\n');
  return root;
}
async function snapshot(root) {
  const manifest = await readFile(path.join(root, 'ai/generated-manifest.json'), 'utf8');
  const result = { manifest };
  for (const p of Object.keys(JSON.parse(manifest).files)) result[p] = await readFile(path.join(root, p), 'utf8');
  return result;
}

test('personal platform files survive generation and legacy ownership migration', async (t) => {
  const root = await fixture(t);
  await generate(root);
  const personal = {
    '.cursor/mcp.json': '{"mcpServers":{"personal":{"url":"https://example.test/mcp"}}}',
    '.cursor/permissions.json': '// Personal JSONC permissions\n{}',
    '.cursor/permissions-guide.md': 'My preferences',
    '.cursor/rules/personal.mdc': 'Personal rule',
    '.claude/settings.local.json': '{"personal":true}',
    '.agents/personal-guide.md': 'Keep me'
  };
  for (const [p, text] of Object.entries(personal)) await writeFile(path.join(root, p), text);
  const manifestFile = path.join(root, 'ai/generated-manifest.json');
  const manifest = JSON.parse(await readFile(manifestFile, 'utf8'));
  for (const p of ['.cursor/mcp.json', '.cursor/permissions.json']) manifest.files[p] = '0'.repeat(64);
  await writeFile(manifestFile, JSON.stringify(manifest));
  await generate(root);
  await generate(root, 'check');
  for (const [p, text] of Object.entries(personal)) assert.equal(await readFile(path.join(root, p), 'utf8'), text);
  const next = JSON.parse(await readFile(manifestFile, 'utf8'));
  assert.equal(Object.hasOwn(next.files, '.cursor/mcp.json'), false);
  assert.equal(Object.hasOwn(next.files, '.cursor/permissions.json'), false);
});

test('Figma setup is additive, idempotent, and refuses conflicting or unsupported settings', async (t) => {
  const root = await fixture(t);
  await mkdir(path.join(root, '.cursor'), { recursive: true });
  const file = path.join(root, '.cursor/mcp.json');
  const config = { personal: true, mcpServers: { custom: { command: 'custom', args: ['keep'] } } };
  await writeFile(file, JSON.stringify(config));
  await setupFigma(root);
  const added = JSON.parse(await readFile(file, 'utf8'));
  assert.deepEqual(added.mcpServers.custom, config.mcpServers.custom);
  assert.equal(added.personal, true);
  assert.equal(added.mcpServers.figma.url, 'https://mcp.figma.com/mcp');
  const before = await readFile(file, 'utf8');
  await setupFigma(root);
  assert.equal(await readFile(file, 'utf8'), before);
  for (const value of ['// JSONC\n{}', '{"mcpServers":{"figma":{"url":"https://other.test"}}}']) {
    await writeFile(file, value);
    await assert.rejects(setupFigma(root));
    assert.equal(await readFile(file, 'utf8'), value);
  }
});

test('browser guidance is delivered to every platform and missing guidance blocks generation', async (t) => {
  const root = await fixture(t);
  await generate(root);
  const outputs = await render(root);
  const skills = ['personal-test-e2e', 'personal-ui-validation', 'personal-debug',
    'personal-accessibility-audit', 'personal-performance-audit', 'personal-implement-figma',
    'personal-test-webview', 'personal-verify-task', 'personal-implement-task',
    'personal-fix-bug', 'personal-integrate-api'];
  for (const name of skills) {
    for (const platform of ['.agents', '.cursor', '.claude']) {
      const p = platform + '/skills/' + name + '/SKILL.md';
      assert.ok(outputs.get(p).includes('`docs/ai/cursor-browser.md`'), 'Missing browser routing: ' + p);
      assert.equal(await readFile(path.join(root, p), 'utf8'), outputs.get(p));
    }
  }
  await unlink(path.join(root, 'ai/source/manual/cursor-browser.md'));
  await unlink(path.join(root, 'docs/ai/cursor-browser.md'));
  await assert.rejects(generate(root), /Missing reference.*cursor-browser\.md/);
});

test('nested AGENTS sources generate exact scoped files and preserve neighboring files', async (t) => {
  const root = await fixture(t);
  const sourceDir = path.join(root, 'ai/source/scoped-instructions/src/features/orders');
  const targetDir = path.join(root, 'src/features/orders');
  await mkdir(sourceDir, { recursive: true });
  await mkdir(targetDir, { recursive: true });
  await writeFile(path.join(sourceDir, 'instructions.md'), '# Orders instructions\n\nUse the orders boundary.\n');
  await writeFile(path.join(targetDir, 'developer-notes.md'), 'Keep this file');
  await generate(root);
  const target = path.join(targetDir, 'AGENTS.md');
  assert.match(await readFile(target, 'utf8'), /GENERATED from ai\/source\/scoped-instructions\/src\/features\/orders\/instructions\.md/);
  assert.match(await readFile(target, 'utf8'), /Use the orders boundary/);
  assert.equal(await readFile(path.join(targetDir, 'developer-notes.md'), 'utf8'), 'Keep this file');
  await rm(sourceDir, { recursive: true });
  await generate(root);
  await assert.rejects(access(target), /ENOENT/);
  assert.equal(await readFile(path.join(targetDir, 'developer-notes.md'), 'utf8'), 'Keep this file');
});

test('nested AGENTS generation rejects unowned targets and reserved or malformed sources', async (t) => {
  const root = await fixture(t);
  const add = async (scope, content = 'Scoped') => {
    const directory = path.join(root, 'ai/source/scoped-instructions', scope);
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, 'instructions.md'), content);
  };
  await add('src/private');
  await mkdir(path.join(root, 'src/private'), { recursive: true });
  await writeFile(path.join(root, 'src/private/AGENTS.md'), 'Developer-owned');
  await assert.rejects(generate(root), /Unowned existing file: src\/private\/AGENTS\.md/);
  assert.equal(await readFile(path.join(root, 'src/private/AGENTS.md'), 'utf8'), 'Developer-owned');

  await rm(path.join(root, 'ai/source/scoped-instructions/src'), { recursive: true });
  await add('ai/private');
  await assert.rejects(generate(root), /Invalid or duplicate destination: ai\/private\/AGENTS\.md/);

  await rm(path.join(root, 'ai/source/scoped-instructions/ai'), { recursive: true });
  await writeFile(path.join(root, 'ai/source/scoped-instructions/unscoped.md'), 'Invalid');
  await assert.rejects(generate(root), /Invalid scoped instruction source/);
});

test('source-only checkout generates ignored outputs and rejects tracked output', async (t) => {
  const root = await fixture(t);
  await cp(path.join(repo, '.gitignore'), path.join(root, '.gitignore'));
  await mkdir(path.join(root, 'ai/generator'), { recursive: true });
  await cp(path.join(repo, 'ai/generator/check-tracking.mjs'), path.join(root, 'ai/generator/check-tracking.mjs'));
  const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
  git('init', '--quiet');
  await generate(root);
  await generate(root, 'check');
  const outputs = [...(await render(root)).keys(), 'ai/generated-manifest.json'];
  // Feed every path directly, without shell quoting or platform-specific separators.
  const matches = execFileSync('git', ['check-ignore', '--stdin'], {
    cwd: root, input: outputs.join('\n') + '\n', encoding: 'utf8'
  }).trim().split(/\r?\n/);
  assert.deepEqual(matches.sort(), outputs.sort());
  git('add', '.');
  const check = () => execFileSync(process.execPath, ['ai/generator/check-tracking.mjs'], {
    cwd: root, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe']
  });
  assert.match(check(), /Source-only AI tracking verified/);
  git('add', '-f', 'AGENTS.md');
  assert.throws(check, /AI outputs\/settings must remain local/);
});

test('Cursor rules are generated with frontmatter and unsupported sources fail', async (t) => {
  const root = await fixture(t);
  const source = path.join(root, 'ai/platform-overrides/cursor/rules/route-files.mdc');
  await writeFile(source, '---\ndescription: Route conventions\nglobs: src/routes/**\nalwaysApply: false\n---\n\nUse existing routes.\n');
  await generate(root);
  const output = await readFile(path.join(root, '.cursor/rules/route-files.mdc'), 'utf8');
  assert.match(output, /^---\ndescription:/);
  assert.match(output, /---\n\n<!-- GENERATED from ai\/platform-overrides\/cursor\/rules\/route-files.mdc/);
  assert.match(await readFile(path.join(root, '.cursor/BUGBOT.md'), 'utf8'), /GENERATED/);
  assert.equal((await render(root)).has('.cursor/mcp.json'), false);
  assert.equal((await render(root)).has('.cursor/permissions.json'), false);
  assert.match(await readFile(path.join(root, '.cursor/config/bugbot.yaml'), 'utf8'), /autofix:\n  mode: disabled/);
  await unlink(source);
  await generate(root);
  await assert.rejects(access(path.join(root, '.cursor/rules/route-files.mdc')), /ENOENT/);
  await writeFile(source, 'Missing metadata');
  await assert.rejects(generate(root), /Missing Cursor rule frontmatter/);
  await unlink(source);
  await writeFile(path.join(root, 'ai/platform-overrides/cursor/rules/unsupported.txt'), 'x');
  await assert.rejects(generate(root), /Invalid Cursor rule source/);
});

test('Cursor plugin package is portable, generated from canonical sources, and excludes personal settings', async (t) => {
  const root = await fixture(t);
  await generate(root);
  const plugin = 'ai/generated/cursor-plugin';
  const manifest = JSON.parse(await readFile(path.join(root, plugin, '.cursor-plugin/plugin.json'), 'utf8'));
  assert.equal(manifest.name, 'personal-ai-workflow');
  assert.equal(Object.hasOwn(manifest, 'skills'), false, 'Cursor auto-discovers the standard skills directory');
  assert.equal(Object.hasOwn(manifest, 'agents'), false, 'Cursor auto-discovers the standard agents directory');
  assert.equal(Object.hasOwn(manifest, 'rules'), false, 'Avoid declaring an absent rules directory');
  const skill = await readFile(path.join(root, plugin, 'skills/personal-fix-bug/SKILL.md'), 'utf8');
  assert.match(skill, /GENERATED from ai\/source\/skills\/personal-fix-bug\/SKILL\.md/);
  const agent = await readFile(path.join(root, plugin, 'agents/personal-reviewer.md'), 'utf8');
  assert.match(agent, /GENERATED from ai\/source\/agents\/personal-reviewer\.json/);
  const outputs = await render(root);
  assert.equal(outputs.has(plugin + '/mcp.json'), false);
  assert.equal(outputs.has(plugin + '/permissions.json'), false);
  assert.equal(outputs.has(plugin + '/BUGBOT.md'), false);
  assert.match(await readFile(path.join(root, plugin, 'README.md'), 'utf8'), /Do not use a symlink/);
});

test('Cursor agents receive their scoped native capabilities without leaking them to other platforms', async () => {
  const outputs = await render(repo);
  const reviewer = outputs.get('.cursor/agents/personal-reviewer.md');
  assert.match(reviewer, /## Native Cursor capabilities/);
  assert.match(reviewer, /model: composer-2\.5\[fast=false\]/);
  assert.match(reviewer, /`\/review`, `\/review-bugbot`, `\/review-security`/);
  assert.match(reviewer, /only when the human explicitly requests them/);
  assert.doesNotMatch(outputs.get('.claude/agents/personal-reviewer.md'), /Native Cursor capabilities/);
  assert.doesNotMatch(outputs.get('.claude/agents/personal-reviewer.md'), /`\/review-bugbot`/);
  assert.match(outputs.get('.claude/agents/personal-reviewer.md'), /model: inherit/);
  assert.match(outputs.get('.cursor/agents/personal-test-verifier.md'), /model: composer-2\.5/);
  assert.match(outputs.get('docs/ai/agents.md'), /Cursor built-ins/);
});

test('recovery restores a missing manifest from marked outputs without taking personal files', async (t) => {
  const root = await fixture(t);
  await generate(root);
  await unlink(path.join(root, 'ai/generated-manifest.json'));
  await writeFile(path.join(root, '.cursor/personal-note.md'), 'Keep me');
  await append(root, 'ai/source/instructions.md', '\nRecovered instruction\n');
  await generate(root, 'restore');
  assert.match(await readFile(path.join(root, 'AGENTS.md'), 'utf8'), /Recovered instruction/);
  assert.equal(await readFile(path.join(root, '.cursor/personal-note.md'), 'utf8'), 'Keep me');
  await generate(root, 'check');
  await unlink(path.join(root, 'ai/generated-manifest.json'));
  await writeFile(path.join(root, '.cursor/agents/personal-reviewer.md'), 'Not generator-marked');
  await assert.rejects(generate(root, 'restore'), /Unowned existing file/);
});

test('shared instructions distinguish Cursor subagent delegation from a completion handoff', async () => {
  const outputs = await render(repo);
  const instructions = outputs.get('AGENTS.md');
  assert.match(instructions, /Cursor subagent delegation/);
  assert.match(instructions, /`\/personal-reviewer`/);
  assert.match(instructions, /completion recommendation, not an instruction to launch/);
  const modes = outputs.get('docs/ai/cursor-modes.md');
  assert.match(modes, /Cursor subagents/);
  assert.match(modes, /built-in Explore and Browser subagents/);
});

test('skill resources are copied byte-for-byte to every platform and the Cursor plugin', async (t) => {
  const root = await fixture(t);
  const source = path.join(root, 'ai/source/skills/personal-fix-bug');
  await mkdir(path.join(source, 'scripts'), { recursive: true });
  await mkdir(path.join(source, 'references/nested'), { recursive: true });
  await mkdir(path.join(source, 'assets'), { recursive: true });
  await writeFile(path.join(source, 'scripts/reproduce.mjs'), 'export const reproduce = true;\n');
  await writeFile(path.join(source, 'references/nested/contract.md'), '# Contract\n');
  const bytes = Buffer.from([0, 255, 1, 2, 3]);
  await writeFile(path.join(source, 'assets/fixture.bin'), bytes);
  await generate(root);
  for (const folder of ['.agents', '.cursor', '.claude', 'ai/generated/cursor-plugin']) {
    const skill = path.join(root, folder, 'skills/personal-fix-bug');
    assert.equal(await readFile(path.join(skill, 'scripts/reproduce.mjs'), 'utf8'), 'export const reproduce = true;\n');
    assert.equal(await readFile(path.join(skill, 'references/nested/contract.md'), 'utf8'), '# Contract\n');
    assert.deepEqual(await readFile(path.join(skill, 'assets/fixture.bin')), bytes);
  }
});
async function append(root, p, text) {
  const file = path.join(root, p);
  await writeFile(file, await readFile(file, 'utf8') + text);
}

test('generation is deterministic, native, and leaves orientation empty', async (t) => {
  const root = await fixture(t);
  const first = await generate(root);
  assert.ok(first.files > 50);
  const before = await snapshot(root);
  assert.deepEqual((await generate(root)).changes, []);
  assert.deepEqual(await snapshot(root), before);
  assert.deepEqual((await generate(root, 'check')).changes, []);
  const claude = before['.claude/agents/personal-reviewer.md'];
  const cursor = before['.cursor/agents/personal-reviewer.md'];
  assert.match(claude, /disallowedTools: Write, Edit, NotebookEdit/);
  assert.match(claude, /skills:\n  - personal-peer-review/);
  assert.match(claude, /Recommended.*personal-frontend-implementer.*personal-test-verifier.*none/);
  assert.match(cursor, /Recommend at most one and do not start it automatically/);
  assert.doesNotMatch(cursor, /^tools:|^skills:/m);
  assert.match(cursor, /\.cursor\/skills/);
  const orientation = before['.agents/skills/personal-project-orientation/SKILL.md'];
  assert.equal(orientation.replace(/^---\n[\s\S]*?\n---/, '').replace(/<!--[\s\S]*?-->/g, '').trim(), '');
  await assert.rejects(access(path.join(root, 'CLAUDE.md')));
});

test('preview/check do not write; a source update reaches all platforms', async (t) => {
  const root = await fixture(t);
  await generate(root);
  const before = await snapshot(root);
  await append(root, 'ai/source/skills/personal-fix-bug/SKILL.md', '\nRecord the verified reproduction.\n');
  assert.equal((await generate(root, 'preview')).changes.length, 5);
  await assert.rejects(generate(root, 'check'), /out of date/);
  assert.deepEqual(await snapshot(root), before);
  await generate(root);
  for (const p of ['.agents', '.cursor', '.claude'])
    assert.match(await readFile(path.join(root, p, 'skills/personal-fix-bug/SKILL.md'), 'utf8'), /verified reproduction/);
});

test('edited output stops the entire write before any other file changes', async (t) => {
  const root = await fixture(t);
  await generate(root);
  await append(root, '.cursor/skills/personal-fix-bug/SKILL.md', '\nDeveloper edit\n');
  const before = await snapshot(root);
  await append(root, 'ai/source/instructions.md', '\nNew instruction\n');
  await assert.rejects(generate(root), /Edited generated file/);
  assert.deepEqual(await snapshot(root), before);
});

test('unowned files and unrelated settings are preserved', async (t) => {
  const root = await fixture(t);
  await writeFile(path.join(root, 'AGENTS.md'), 'Existing owner instructions\n');
  await assert.rejects(generate(root), /Unowned existing file/);
  assert.equal(await readFile(path.join(root, 'AGENTS.md'), 'utf8'), 'Existing owner instructions\n');
  await unlink(path.join(root, 'AGENTS.md'));
  await mkdir(path.join(root, '.cursor'), { recursive: true });
  await writeFile(path.join(root, '.cursor/settings.json'), '{"local":true}');
  await generate(root);
  assert.equal(await readFile(path.join(root, '.cursor/settings.json'), 'utf8'), '{"local":true}');
});

test('obsolete outputs are removed only when unchanged', async (t) => {
  const root = await fixture(t);
  await generate(root);
  const source = path.join(root, 'ai/source/skills/personal-accessibility-audit');
  await rm(source, { recursive: true });
  const edited = '.claude/skills/personal-accessibility-audit/SKILL.md';
  const original = await readFile(path.join(root, edited), 'utf8');
  await append(root, edited, '\nKeep my work\n');
  await assert.rejects(generate(root), /Edited generated file/);
  await access(path.join(root, '.cursor/skills/personal-accessibility-audit/SKILL.md'));
  await writeFile(path.join(root, edited), original);
  const result = await generate(root);
  assert.equal(result.changes.filter((s) => s.startsWith('remove ')).length, 4);
  await assert.rejects(access(path.join(root, edited)));
});

test('invalid metadata, missing role skills, and CLAUDE.md block generation', async (t) => {
  const root = await fixture(t);
  const file = path.join(root, 'ai/source/skills/personal-fix-bug/SKILL.md');
  const original = await readFile(file, 'utf8');
  await writeFile(file, original.replace('name: personal-fix-bug', 'name: wrong'));
  await assert.rejects(generate(root), /name mismatch/);
  await writeFile(file, original);
  const roleFile = path.join(root, 'ai/source/agents/personal-reviewer.json');
  const role = JSON.parse(await readFile(roleFile, 'utf8'));
  await writeFile(roleFile, JSON.stringify({ ...role, skills: ['missing-skill'] }));
  await assert.rejects(generate(root), /missing skill reference/);
  await writeFile(roleFile, JSON.stringify(role));
  await writeFile(roleFile, JSON.stringify({ ...role, nextTeammates: ['personal-missing-agent'] }));
  await assert.rejects(generate(root), /Invalid next teammate reference/);
  await writeFile(roleFile, JSON.stringify(role));
  await writeFile(path.join(root, 'CLAUDE.md'), 'Legacy rules');
  await assert.rejects(generate(root), /Remove CLAUDE.md/);
});

test('manifest traversal cannot delete arbitrary files', async (t) => {
  const root = await fixture(t);
  await generate(root);
  const manifestFile = path.join(root, 'ai/generated-manifest.json');
  const manifest = JSON.parse(await readFile(manifestFile, 'utf8'));
  manifest.files['../outside.md'] = 'a'.repeat(64);
  await writeFile(manifestFile, JSON.stringify(manifest));
  await assert.rejects(generate(root), /Invalid manifest entry/);
});

test('linked platform directory is rejected', async (t) => {
  const root = await fixture(t);
  const outside = await mkdtemp(path.join(tmpdir(), 'personal-generator-link-'));
  t.after(() => rm(outside, { recursive: true, force: true }));
  try { await symlink(outside, path.join(root, '.cursor'), process.platform === 'win32' ? 'junction' : 'dir'); }
  catch (error) {
    if (['EPERM','EACCES'].includes(error.code)) { t.skip('Host denies creating test links'); return; }
    throw error;
  }
  await assert.rejects(generate(root), /linked path/);
});

test('line endings from Windows checkout do not cause drift', async (t) => {
  const root = await fixture(t);
  await generate(root);
  const file = path.join(root, 'AGENTS.md');
  await writeFile(file, (await readFile(file, 'utf8')).replace(/\n/g, '\r\n'));
  assert.deepEqual((await generate(root, 'check')).changes, []);
});
