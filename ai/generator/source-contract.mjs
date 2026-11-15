// Shared interpretation for source catalogs and context audits. No file writes.
export function readingRequirements(text, flags = {}) {
  const normalized = text.replace(/\r\n/g, '\n');
  const references = (line) => [...line.matchAll(/`(docs\/ai\/[a-z-]+\.md)`/g)].map((match) => match[1]);
  const required = references(normalized.match(/^Required sections:[ \t]*(.*)$/m)?.[1] ?? '');
  const conditional = [...normalized.matchAll(/^Conditional sections \((localization|webview|sentry|figma)\):[ \t]*(.*)$/gm)]
    .map((match) => ({ flag: match[1], sections: references(match[2]) }));
  return {
    required,
    conditional,
    applicable: [...new Set([...required, ...conditional.filter((item) => flags[item.flag] === 'on').flatMap((item) => item.sections)])],
  };
}

export function capabilityFlags(text) {
  return Object.fromEntries([...text.matchAll(/^\|\s*(localization|webview|sentry|figma)\s*\|\s*(on|off)\s*\|/gm)]
    .map((match) => [match[1], match[2]]));
}

const codeList = (items) => items.map((item) => '`' + item + '`').join(', ') || 'none';

export function readingCatalog(skills) {
  return ['| Skill / task | Required sections | Capability conditions |', '| --- | --- | --- |',
    ...[...skills].map(([name, { text }]) => {
      const { required, conditional } = readingRequirements(text);
      return '| `' + name + '` | ' + codeList(required) + ' | ' +
        (conditional.map((item) => item.flag + '=on: ' + codeList(item.sections)).join('; ') || 'none') + ' |';
    })].join('\n');
}

export function teammateCatalog(roles) {
  return ['| Role | Mode | Primary skills | Allowed next teammates |', '| --- | --- | --- | --- |',
    ...roles.map((role) => '| `' + role.name + '` | ' + (role.readOnly ? 'Read-only' : 'Write within approved scope') +
      ' | ' + codeList(role.skills) + ' | ' + codeList([...role.nextTeammates, 'none']) + ' |')].join('\n');
}

export function builtInCatalog(mapping) {
  return ['| Agent | Cursor built-ins |', '| --- | --- |',
    ...Object.entries(mapping).map(([name, commands]) => '| `' + name + '` | ' + codeList(commands) + ' |')].join('\n');
}
