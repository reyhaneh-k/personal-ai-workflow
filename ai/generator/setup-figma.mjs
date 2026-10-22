import { lstat, mkdir, readFile, realpath, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const endpoint = 'https://mcp.figma.com/mcp';
const object = (x) => x !== null && typeof x === 'object' && !Array.isArray(x);

export async function setupFigma(directory) {
  const root = await realpath(directory);
  const folder = path.join(root, '.cursor');
  const file = path.join(folder, 'mcp.json');
  for (const target of [folder, file]) {
    try {
      if ((await lstat(target)).isSymbolicLink()) throw new Error('Refusing linked MCP settings');
    } catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  let original = null;
  try { original = await readFile(file, 'utf8'); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  let config;
  try { config = original === null ? {} : JSON.parse(original); }
  catch { throw new Error('Existing MCP settings are not strict JSON. Add the Figma entry manually; no files changed.'); }
  if (!object(config) || (Object.hasOwn(config, 'mcpServers') && !object(config.mcpServers)))
    throw new Error('Unsupported MCP settings shape; no files changed.');
  const servers = config.mcpServers ?? {};
  if (Object.values(servers).some((server) => object(server) && server.url === endpoint))
    return 'Figma endpoint already configured; existing settings preserved. Verify connection/authentication in Cursor.';
  if (Object.hasOwn(servers, 'figma'))
    throw new Error('A different figma entry already exists. Resolve it manually; no files changed.');
  config.mcpServers = { ...servers, figma: { url: endpoint } };
  await mkdir(folder, { recursive: true });
  // Avoid clobbering settings edited while this command was preparing the merge.
  const current = await readFile(file, 'utf8').catch((error) => {
    if (error.code === 'ENOENT') return null;
    throw error;
  });
  if (current !== original) throw new Error('MCP settings changed; retry after reviewing them.');
  await writeFile(file, JSON.stringify(config, null, 2) + '\n', { flag: original === null ? 'wx' : 'w' });
  return 'Added Figma endpoint; other settings preserved. Complete authentication in Cursor.';
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    if (process.argv.length !== 2) throw new Error('Usage: node ai/generator/setup-figma.mjs');
    console.log(await setupFigma(fileURLToPath(new URL('../../', import.meta.url))));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
