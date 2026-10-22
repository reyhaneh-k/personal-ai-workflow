import { lstat, readFile } from 'node:fs/promises';
import path from 'node:path';
import { parseEnv } from 'node:util';
import { fileURLToPath } from 'node:url';

const profiles = {
  routine: {
    file: '.env.ai.local',
    allowed: new Set([
      'SENTRY_AUTH_TOKEN', 'SENTRY_ORG', 'SENTRY_PROJECT', 'SENTRY_BASE_URL',
      'FIGMA_ACCESS_TOKEN', 'CONTEXT7_API_KEY', 'GITLAB_READ_TOKEN',
      'GITLAB_PROJECT_ID', 'GITLAB_BASE_URL',
    ]),
  },
  admin: {
    file: '.env.ai-admin.local',
    allowed: new Set(['OPENAI_ADMIN_KEY', 'ANTHROPIC_ADMIN_KEY', 'CURSOR_ADMIN_API_KEY']),
  },
};

const placeholder = /^(?:change[-_ ]?me|replace[-_ ]?me|placeholder|example|todo|tbd|xxx+)$/i;

async function readProfile(root, name) {
  const definition = profiles[name];
  const target = path.join(root, definition.file);
  let info;
  try { info = await lstat(target); }
  catch (error) {
    if (error.code === 'ENOENT') return { name, path: definition.file, status: 'missing', values: {} };
    throw error;
  }
  if (info.isSymbolicLink() || !info.isFile()) throw new Error(definition.file + ' must be a regular, non-linked file.');
  const values = parseEnv(await readFile(target, 'utf8'));
  const keys = Object.keys(values);
  const forbidden = keys.filter((key) => key.startsWith('VITE_'));
  if (forbidden.length) throw new Error(definition.file + ' contains forbidden client-exposed names: ' + forbidden.join(', ') + '.');
  const unknown = keys.filter((key) => !definition.allowed.has(key));
  if (unknown.length) throw new Error(definition.file + ' contains unsupported names: ' + unknown.join(', ') + '. Update the reviewed allowlist and template first.');
  return { name, path: definition.file, status: 'loaded', values };
}

export async function loadAiEnv({ root, profile = 'routine', required = [] }) {
  if (!profiles[profile]) throw new Error('AI environment profile must be routine or admin.');
  if (!Array.isArray(required) || required.some((key) => typeof key !== 'string' || !/^[A-Z][A-Z0-9_]*$/.test(key)))
    throw new Error('Required environment names must be uppercase identifiers.');
  const names = profile === 'admin' ? ['routine', 'admin'] : ['routine'];
  const loaded = [];
  for (const name of names) {
    const result = await readProfile(path.resolve(root), name);
    loaded.push({ profile: name, path: result.path, status: result.status });
    for (const [key, value] of Object.entries(result.values)) {
      if (process.env[key] === undefined && value !== '') process.env[key] = value;
    }
  }
  const permitted = new Set(names.flatMap((name) => [...profiles[name].allowed]));
  const unsupportedRequired = required.filter((key) => !permitted.has(key));
  if (unsupportedRequired.length) throw new Error('Required names are not allowed for the ' + profile + ' profile: ' + unsupportedRequired.join(', ') + '.');
  const state = Object.fromEntries(required.map((key) => {
    const value = process.env[key]?.trim() ?? '';
    return [key, !value ? 'missing' : placeholder.test(value) ? 'placeholder' : 'configured'];
  }));
  const invalid = Object.entries(state).filter(([, status]) => status !== 'configured');
  if (invalid.length) throw new Error('AI environment is not ready: ' + invalid.map(([key, status]) => key + '=' + status).join(', ') + '. Copy the appropriate example file to its .local name or configure the process environment.');
  return { profile, files: loaded, required: state };
}

function parseArgs(args) {
  const options = { profile: 'routine', required: [] };
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === '--profile') options.profile = args[++index];
    else if (args[index] === '--require') options.required.push(args[++index]);
    else if (args[index] === '--help') options.help = true;
    else throw new Error('Unknown argument: ' + args[index]);
  }
  return options;
}

const usage = 'Usage: node scripts/ai/load-ai-env.mjs [--profile routine|admin] [--require NAME ...]';
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const options = parseArgs(process.argv.slice(2));
    if (options.help) console.log(usage);
    else {
      const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
      console.log(JSON.stringify(await loadAiEnv({ root, profile: options.profile, required: options.required }), null, 2));
    }
  } catch (error) { console.error(error.message); console.error(usage); process.exitCode = 1; }
}
