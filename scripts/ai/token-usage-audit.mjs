import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PLATFORMS = ['codex', 'cursor', 'claude'];
const MEASUREMENTS = ['exact', 'estimated'];
const TOKEN_FIELDS = [
  'uncached_input_tokens', 'cache_read_input_tokens', 'cache_write_input_tokens',
  'output_tokens', 'reasoning_tokens', 'requests', 'completed_tasks', 'cost_usd',
];
const TOOL_FIELDS = ['tool_calls', 'tool_result_tokens', 'tool_failures', 'tool_fallbacks'];
const NUMERIC_FIELDS = [...TOKEN_FIELDS, ...TOOL_FIELDS];
const FIELDS = new Set(['date', 'platform', 'measurement', 'source', 'model', 'task_type', 'tool', ...NUMERIC_FIELDS]);
const colors = { codex: '#10a37f', cursor: '#7c3aed', claude: '#d97706' };

function parseCsv(text) {
  const rows = [];
  let row = [], cell = '', quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') { cell += '"'; index += 1; }
      else if (char === '"') quoted = false;
      else cell += char;
    } else if (char === '"') quoted = true;
    else if (char === ',') { row.push(cell); cell = ''; }
    else if (char === '\n') { row.push(cell.replace(/\r$/, '')); rows.push(row); row = []; cell = ''; }
    else cell += char;
  }
  if (quoted) throw new Error('Unclosed quoted field in CSV.');
  if (cell || row.length) { row.push(cell.replace(/\r$/, '')); rows.push(row); }
  const nonempty = rows.filter((values) => values.some((value) => value.trim()));
  if (!nonempty.length) return [];
  const headers = nonempty[0].map((value) => value.trim());
  if (new Set(headers).size !== headers.length) throw new Error('CSV contains duplicate headers.');
  return nonempty.slice(1).map((values, rowIndex) => {
    if (values.length !== headers.length) throw new Error('CSV row ' + (rowIndex + 2) + ' has the wrong number of columns.');
    return Object.fromEntries(headers.map((header, index) => [header, values[index].trim()]));
  });
}

function csvCell(value) {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? '"' + text.replace(/"/g, '""') + '"' : text;
}

async function loadRecords(file) {
  const text = await readFile(file, 'utf8');
  if (path.extname(file).toLowerCase() === '.csv') return parseCsv(text);
  const parsed = JSON.parse(text);
  if (Array.isArray(parsed)) return parsed;
  if (parsed?.schemaVersion === 1 && Array.isArray(parsed.records)) return parsed.records;
  throw new Error(file + ': JSON must be an array or {"schemaVersion":1,"records":[]}.');
}

function normalizeRecord(raw, sourceFile, index) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error(sourceFile + ': record ' + index + ' is not an object.');
  const unknown = Object.keys(raw).filter((key) => !FIELDS.has(key));
  if (unknown.length) throw new Error(sourceFile + ': unsupported fields in record ' + index + ': ' + unknown.join(', ') + '. Convert the export to the privacy-safe schema first.');
  const date = String(raw.date ?? '');
  if (!/^\d{4}-\d{2}(?:-\d{2})?$/.test(date) || Number.isNaN(Date.parse(date.length === 7 ? date + '-01T00:00:00Z' : date + 'T00:00:00Z')))
    throw new Error(sourceFile + ': invalid date in record ' + index + '.');
  const platform = String(raw.platform ?? '').toLowerCase();
  if (!PLATFORMS.includes(platform)) throw new Error(sourceFile + ': invalid platform in record ' + index + '.');
  const measurement = String(raw.measurement ?? '');
  if (!MEASUREMENTS.includes(measurement)) throw new Error(sourceFile + ': measurement must be exact or estimated in record ' + index + '.');
  const record = { date, month: date.slice(0, 7), platform, measurement, provided: {} };
  for (const field of ['source', 'model', 'task_type', 'tool']) record[field] = String(raw[field] ?? '').trim();
  if (!record.source) throw new Error(sourceFile + ': source is required in record ' + index + '.');
  for (const field of NUMERIC_FIELDS) {
    record.provided[field] = raw[field] !== '' && raw[field] !== null && raw[field] !== undefined;
    const value = record.provided[field] ? Number(raw[field]) : 0;
    if (!Number.isFinite(value) || value < 0) throw new Error(sourceFile + ': ' + field + ' must be a non-negative number in record ' + index + '.');
    record[field] = value;
  }
  record.has_tokens = ['uncached_input_tokens','cache_read_input_tokens','cache_write_input_tokens','output_tokens'].some((field) => record.provided[field]);
  record.has_tool_usage = TOOL_FIELDS.some((field) => record.provided[field]);
  if (!record.has_tokens && !record.has_tool_usage)
    throw new Error(sourceFile + ': record ' + index + ' contains neither token nor tool-usage measurements.');
  if (record.has_tool_usage && !record.tool)
    throw new Error(sourceFile + ': tool is required when tool-usage measurements are present in record ' + index + '.');
  if (record.reasoning_tokens > record.output_tokens) throw new Error(sourceFile + ': reasoning_tokens cannot exceed output_tokens in record ' + index + '.');
  record.input_tokens = record.uncached_input_tokens + record.cache_read_input_tokens + record.cache_write_input_tokens;
  record.total_tokens = record.input_tokens + record.output_tokens;
  return record;
}

function emptyAggregate(month, platform = 'all') {
  return { month, platform, exact_records: 0, estimated_records: 0, task_records: 0, cost_records: 0,
    uncached_input_tokens: 0, cache_read_input_tokens: 0, cache_write_input_tokens: 0, input_tokens: 0,
    output_tokens: 0, reasoning_tokens: 0, total_tokens: 0, requests: 0, completed_tasks: 0, cost_usd: 0,
    tool_calls: 0, tool_result_tokens: 0, tool_failures: 0, tool_fallbacks: 0 };
}

function aggregate(records) {
  const byKey = new Map(), totals = new Map(), byToolKey = new Map();
  for (const record of records) {
    const key = record.month + '|' + record.platform;
    if (!byKey.has(key)) byKey.set(key, emptyAggregate(record.month, record.platform));
    if (!totals.has(record.month)) totals.set(record.month, emptyAggregate(record.month));
    for (const target of [byKey.get(key), totals.get(record.month)]) {
      if (record.has_tokens) target[record.measurement + '_records'] += 1;
      if (record.provided.completed_tasks) target.task_records += 1;
      if (record.provided.cost_usd) target.cost_records += 1;
      for (const field of NUMERIC_FIELDS) target[field] += record[field];
      target.input_tokens += record.input_tokens;
      target.total_tokens += record.total_tokens;
    }
    if (record.has_tool_usage) {
      const toolKey = record.month + '|' + record.platform + '|' + record.tool;
      if (!byToolKey.has(toolKey)) byToolKey.set(toolKey, { month: record.month, platform: record.platform, tool: record.tool, tool_calls: 0, tool_result_tokens: 0, tool_failures: 0, tool_fallbacks: 0, attributed_tokens: 0 });
      const toolTarget = byToolKey.get(toolKey);
      for (const field of TOOL_FIELDS) toolTarget[field] += record[field];
      toolTarget.attributed_tokens += record.total_tokens;
    }
  }
  const months = [...totals.keys()].sort();
  return {
    months,
    byPlatform: [...byKey.values()].sort((a, b) => a.month.localeCompare(b.month) || a.platform.localeCompare(b.platform)),
    byTool: [...byToolKey.values()].sort((a, b) => a.month.localeCompare(b.month) || a.platform.localeCompare(b.platform) || a.tool.localeCompare(b.tool)),
    totals: months.map((month) => totals.get(month)),
  };
}

function number(value) { return Math.round(value).toLocaleString('en-US'); }
function percent(value) { return (value * 100).toFixed(1) + '%'; }
function change(current, previous) { return previous > 0 ? (current - previous) / previous : null; }

function recommendations(summary) {
  const notes = ['Treat token reduction as an efficiency goal, not a substitute for correctness, review quality, or completed work.'];
  const current = summary.totals.at(-1), previous = summary.totals.at(-2);
  if (!current) return ['No usage records were supplied.'];
  if (current.estimated_records) notes.push('Some current-month records are estimated; improve source coverage before making budget decisions.');
  const cacheShare = current.total_tokens ? current.cache_read_input_tokens / current.total_tokens : 0;
  if (current.input_tokens > 100000 && cacheShare < 0.1) notes.push('Cache-read share is below 10%; keep stable instructions/tool definitions early and avoid repeatedly rebuilding equivalent context where the platform supports caching.');
  if (current.completed_tasks > 0 && previous?.completed_tasks > 0) {
    const currentPerTask = current.total_tokens / current.completed_tasks;
    const previousPerTask = previous.total_tokens / previous.completed_tasks;
    const delta = change(currentPerTask, previousPerTask);
    if (delta > 0.2) notes.push('Tokens per completed task rose by more than 20%; inspect task mix, retries, broad file reads, and unnecessary manual sections before changing models.');
  } else notes.push('Completed-task counts are missing, so the report cannot distinguish healthy growth from declining efficiency.');
  if (current.output_tokens > current.input_tokens * 0.5) notes.push('Output is large relative to input; use compact progress updates and request detailed explanations only when they help a decision.');
  const toolTotals = summarizeTools(summary.byTool);
  const noisyTool = toolTotals.find((item) => item.tool_calls && item.tool_result_tokens / item.tool_calls > 10000);
  if (noisyTool) notes.push(`${noisyTool.platform}/${noisyTool.tool} returns more than 10,000 tokens per recorded call on average; inspect whether narrower queries or compact result formats preserve the same task quality.`);
  const unreliableTool = toolTotals.find((item) => item.tool_calls && item.tool_failures / item.tool_calls > 0.1);
  if (unreliableTool) notes.push(`${unreliableTool.platform}/${unreliableTool.tool} has a recorded failure rate above 10%; inspect retries and fallback behavior before attributing its usage to productive work.`);
  if (summary.months.length < 2) notes.push('Collect at least two complete months before treating a trend as meaningful.');
  return notes;
}

function summarizeTools(rows) {
  const totals = new Map();
  for (const row of rows) {
    const key = row.platform + '|' + row.tool;
    if (!totals.has(key)) totals.set(key, { platform: row.platform, tool: row.tool, tool_calls: 0, tool_result_tokens: 0, tool_failures: 0, tool_fallbacks: 0, attributed_tokens: 0 });
    const target = totals.get(key);
    for (const field of [...TOOL_FIELDS, 'attributed_tokens']) target[field] += row[field];
  }
  return [...totals.values()].sort((a, b) => b.tool_result_tokens - a.tool_result_tokens || b.attributed_tokens - a.attributed_tokens || b.tool_calls - a.tool_calls || a.tool.localeCompare(b.tool));
}

function toolUsageSvg(summary) {
  const width = 960, height = 480, left = 88, right = 30, top = 55, bottom = 105;
  const useResultTokens = summary.byTool.some((item) => item.tool_result_tokens > 0);
  const metric = useResultTokens ? 'tool_result_tokens' : 'tool_calls';
  const title = useResultTokens ? 'Monthly tool-result context tokens' : 'Monthly tool calls';
  const labels = summarizeTools(summary.byTool).slice(0, 7).map((item) => item.platform + '/' + item.tool);
  const colorPalette = ['#2563eb', '#7c3aed', '#d97706', '#059669', '#dc2626', '#0891b2', '#4f46e5', '#6b7280'];
  const monthValues = new Map(summary.months.map((month) => [month, new Map()]));
  for (const row of summary.byTool) {
    const label = row.platform + '/' + row.tool;
    const group = labels.includes(label) ? label : 'other';
    const values = monthValues.get(row.month);
    values.set(group, (values.get(group) ?? 0) + row[metric]);
  }
  const groups = [...labels, ...(summary.byTool.some((row) => !labels.includes(row.platform + '/' + row.tool)) ? ['other'] : [])];
  const totals = summary.months.map((month) => [...monthValues.get(month).values()].reduce((sum, value) => sum + value, 0));
  const max = Math.max(1, ...totals), chartWidth = width-left-right, chartHeight = height-top-bottom;
  const slot = chartWidth / Math.max(1, summary.months.length), bar = Math.min(90, slot * 0.58);
  const elements = [`<rect width="${width}" height="${height}" fill="#fff"/>`, `<text x="${left}" y="30" font-family="Arial" font-size="20" font-weight="700">${title}</text>`];
  for (let tick = 0; tick <= 4; tick += 1) {
    const value = max * tick / 4, y = top + chartHeight - chartHeight * tick / 4;
    elements.push(`<line x1="${left}" y1="${y}" x2="${width-right}" y2="${y}" stroke="#e5e7eb"/>`, `<text x="${left-10}" y="${y+4}" text-anchor="end" font-family="Arial" font-size="11" fill="#4b5563">${escapeXml(number(value))}</text>`);
  }
  summary.months.forEach((month, index) => {
    const x = left + slot*index + (slot-bar)/2;
    let y = top + chartHeight;
    groups.forEach((group, groupIndex) => {
      const value = monthValues.get(month).get(group) ?? 0, h = chartHeight * value / max;
      y -= h;
      elements.push(`<rect x="${x}" y="${y}" width="${bar}" height="${h}" fill="${colorPalette[groupIndex]}"><title>${escapeXml(group)}: ${escapeXml(number(value))}</title></rect>`);
    });
    elements.push(`<text x="${x+bar/2}" y="${top+chartHeight+24}" text-anchor="middle" font-family="Arial" font-size="12" fill="#374151">${month}</text>`);
  });
  groups.forEach((group, index) => {
    const column = index % 4, row = Math.floor(index / 4), x = left + column*205, y = height-42+row*18;
    elements.push(`<rect x="${x}" y="${y-10}" width="12" height="12" fill="${colorPalette[index]}"/><text x="${x+18}" y="${y}" font-family="Arial" font-size="11">${escapeXml(group)}</text>`);
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${elements.join('')}</svg>\n`;
}

function usageSvg(summary) {
  const width = 960, height = 480, left = 88, right = 30, top = 55, bottom = 80;
  const chartWidth = width - left - right, chartHeight = height - top - bottom;
  const max = Math.max(1, ...summary.totals.map((item) => item.total_tokens));
  const slot = chartWidth / Math.max(1, summary.months.length), bar = Math.min(90, slot * 0.58);
  const byKey = new Map(summary.byPlatform.map((item) => [item.month + '|' + item.platform, item]));
  const elements = [`<rect width="${width}" height="${height}" fill="#fff"/>`, `<text x="${left}" y="30" font-family="Arial" font-size="20" font-weight="700">Monthly AI token usage</text>`];
  for (let tick = 0; tick <= 4; tick += 1) {
    const value = max * tick / 4, y = top + chartHeight - chartHeight * tick / 4;
    elements.push(`<line x1="${left}" y1="${y}" x2="${width-right}" y2="${y}" stroke="#e5e7eb"/>`, `<text x="${left-10}" y="${y+4}" text-anchor="end" font-family="Arial" font-size="11" fill="#4b5563">${escapeXml(number(value))}</text>`);
  }
  summary.months.forEach((month, index) => {
    const x = left + slot * index + (slot - bar) / 2;
    let y = top + chartHeight;
    for (const platform of PLATFORMS) {
      const value = byKey.get(month + '|' + platform)?.total_tokens ?? 0;
      const h = chartHeight * value / max; y -= h;
      elements.push(`<rect x="${x}" y="${y}" width="${bar}" height="${h}" fill="${colors[platform]}"><title>${platform}: ${number(value)}</title></rect>`);
    }
    elements.push(`<text x="${x+bar/2}" y="${top+chartHeight+24}" text-anchor="middle" font-family="Arial" font-size="12" fill="#374151">${month}</text>`);
  });
  PLATFORMS.forEach((platform, index) => elements.push(`<rect x="${left + index*140}" y="${height-28}" width="12" height="12" fill="${colors[platform]}"/><text x="${left+18+index*140}" y="${height-18}" font-family="Arial" font-size="12">${platform}</text>`));
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${elements.join('')}</svg>\n`;
}

function efficiencySvg(summary) {
  const width = 960, height = 360, left = 88, right = 30, top = 55, bottom = 70;
  const values = summary.totals.map((item) => item.task_records && item.completed_tasks ? item.total_tokens / item.completed_tasks : null);
  const max = Math.max(1, ...values.filter((value) => value !== null));
  const step = summary.months.length > 1 ? (width-left-right)/(summary.months.length-1) : 0;
  const points = values.map((value, index) => value === null ? null : [left + (summary.months.length === 1 ? (width-left-right)/2 : step*index), top + (height-top-bottom)*(1-value/max)]);
  const visible = points.filter(Boolean);
  const elements = [`<rect width="${width}" height="${height}" fill="#fff"/>`, `<text x="${left}" y="30" font-family="Arial" font-size="20" font-weight="700">Tokens per completed task</text>`];
  for (let tick = 0; tick <= 4; tick += 1) {
    const value = max * tick / 4, y = top + (height-top-bottom) - (height-top-bottom)*tick/4;
    elements.push(`<line x1="${left}" y1="${y}" x2="${width-right}" y2="${y}" stroke="#e5e7eb"/>`, `<text x="${left-10}" y="${y+4}" text-anchor="end" font-family="Arial" font-size="11" fill="#4b5563">${escapeXml(number(value))}</text>`);
  }
  if (visible.length > 1) elements.push(`<polyline points="${visible.map((point) => point.join(',')).join(' ')}" fill="none" stroke="#2563eb" stroke-width="3"/>`);
  points.forEach((point, index) => {
    const x = point?.[0] ?? left + (summary.months.length === 1 ? (width-left-right)/2 : step*index);
    if (point) elements.push(`<circle cx="${point[0]}" cy="${point[1]}" r="5" fill="#2563eb"><title>${number(values[index])}</title></circle>`);
    else elements.push(`<text x="${x}" y="${top+100}" text-anchor="middle" font-family="Arial" font-size="11" fill="#9ca3af">no task count</text>`);
    elements.push(`<text x="${x}" y="${height-bottom+28}" text-anchor="middle" font-family="Arial" font-size="12" fill="#374151">${summary.months[index]}</text>`);
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${elements.join('')}</svg>\n`;
}

function escapeXml(value) { return String(value).replace(/[&<>"']/g, (char) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;' }[char])); }

function reportMarkdown(summary, records) {
  const rows = summary.totals.map((item, index) => {
    const previous = summary.totals[index - 1];
    const delta = previous ? change(item.total_tokens, previous.total_tokens) : null;
    const cacheShare = item.total_tokens ? item.cache_read_input_tokens / item.total_tokens : 0;
    const perTask = item.task_records && item.completed_tasks ? item.total_tokens / item.completed_tasks : null;
    const cost = item.cost_records ? '$' + item.cost_usd.toFixed(2) : '—';
    return `| ${item.month} | ${number(item.total_tokens)} | ${delta === null ? '—' : (delta >= 0 ? '+' : '') + percent(delta)} | ${percent(cacheShare)} | ${perTask === null ? '—' : number(perTask)} | ${cost} | ${item.exact_records}/${item.estimated_records} |`;
  });
  const toolRows = summarizeTools(summary.byTool).map((item) => {
    const average = item.tool_calls ? number(item.tool_result_tokens / item.tool_calls) : '—';
    return `| ${item.platform} | ${item.tool} | ${number(item.tool_calls)} | ${number(item.tool_result_tokens)} | ${average} | ${number(item.tool_failures)} | ${number(item.tool_fallbacks)} |`;
  });
  const toolSection = toolRows.length
    ? ['## Tool usage', '', 'Tool-result tokens describe context returned by tools and are not added again to total tokens. Attributed tokens are available in the CSV when the source can associate a complete request with one tool.', '', '![Monthly tool usage](monthly-tool-usage.svg)', '', '| Platform | Tool | Calls | Result tokens | Result tokens / call | Failures | Fallbacks |', '| --- | --- | ---: | ---: | ---: | ---: | ---: |', ...toolRows]
    : ['## Tool usage', '', 'No tool-level measurements were supplied. This does not imply that no tools were used.'];
  return ['# Monthly AI token-usage audit', '', `Records: ${records.length}. Months: ${summary.months.length}. Token totals include uncached input, cache-read input, cache-write input, and output; reasoning tokens are a subset of output and are not added again.`, '', '![Monthly token usage](monthly-token-usage.svg)', '', '![Tokens per completed task](monthly-token-efficiency.svg)', '', '| Month | Total tokens | Change | Cache-read share | Tokens / completed task | Reported cost | Exact/estimated records |', '| --- | ---: | ---: | ---: | ---: | ---: | ---: |', ...rows, '', ...toolSection, '', '## Improvement signals', '', ...recommendations(summary).map((note) => '- ' + note), '', '## Interpretation limits', '', '- Compare like-for-like sources and complete calendar months.', '- Provider exports describe different products and billing systems; do not infer missing usage as zero.', '- Tool telemetry coverage varies by platform; missing tool records mean unavailable evidence, not zero use.', '- OpenAI API organization usage is not automatically the same dataset as Codex workspace usage.', '- Preserve task quality, defect rate, review findings, and cycle time alongside token efficiency.', ''].join('\n');
}

export async function generateTokenAudit(inputFiles, outputDirectory) {
  if (!inputFiles.length) throw new Error('At least one --input file is required.');
  const records = [];
  for (const file of inputFiles) {
    const raw = await loadRecords(file);
    raw.forEach((record, index) => records.push(normalizeRecord(record, file, index + 1)));
  }
  if (!records.length) throw new Error('No usage records were supplied.');
  const summary = aggregate(records);
  await mkdir(outputDirectory, { recursive: true });
  const columns = ['month','platform','total_tokens','uncached_input_tokens','cache_read_input_tokens','cache_write_input_tokens','output_tokens','reasoning_tokens','requests','completed_tasks','cost_usd','exact_records','estimated_records'];
  const csv = [columns.join(','), ...summary.byPlatform.map((row) => columns.map((column) => csvCell(row[column])).join(','))].join('\n') + '\n';
  const toolColumns = ['month','platform','tool','tool_calls','tool_result_tokens','tool_failures','tool_fallbacks','attributed_tokens'];
  const toolCsv = [toolColumns.join(','), ...summary.byTool.map((row) => toolColumns.map((column) => csvCell(row[column])).join(','))].join('\n') + '\n';
  const outputs = {
    'token-usage-report.md': reportMarkdown(summary, records),
    'monthly-token-usage.svg': usageSvg(summary),
    'monthly-token-efficiency.svg': efficiencySvg(summary),
    'monthly-tool-usage.svg': toolUsageSvg(summary),
    'monthly-token-usage.csv': csv,
    'monthly-tool-usage.csv': toolCsv,
  };
  for (const [name, content] of Object.entries(outputs)) await writeFile(path.join(outputDirectory, name), content, 'utf8');
  return { records: records.length, months: summary.months, outputDirectory: path.resolve(outputDirectory), files: Object.keys(outputs) };
}

function parseArgs(args) {
  const options = { inputs: [] };
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === '--input') options.inputs.push(args[++index]);
    else if (args[index] === '--output') options.output = args[++index];
    else if (args[index] === '--help') options.help = true;
    else throw new Error('Unknown argument: ' + args[index]);
  }
  return options;
}

const usage = 'Usage: node scripts/ai/token-usage-audit.mjs --input <canonical.json|csv> [--input ...] --output <directory>';
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const options = parseArgs(process.argv.slice(2));
    if (options.help) console.log(usage);
    else {
      if (!options.output) throw new Error('--output is required.');
      console.log(JSON.stringify(await generateTokenAudit(options.inputs.map(path.resolve), path.resolve(options.output)), null, 2));
    }
  } catch (error) { console.error(error.message); console.error(usage); process.exitCode = 1; }
}
