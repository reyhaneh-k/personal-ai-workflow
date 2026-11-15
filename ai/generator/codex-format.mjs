// Codex-native formats. Omit model settings to inherit the user's configuration.
import path from 'node:path';
const quoted = (value) => JSON.stringify(value);

export function codexAgent(role, override, instructions) {
  if (!override || typeof override !== 'object' || Array.isArray(override)) throw new Error('Invalid Codex role override');
  const allowed = new Set(['model', 'model_reasoning_effort', 'model_reasoning_summary', 'model_verbosity', 'features', 'skills']);
  if (Object.keys(override).some((key) => !allowed.has(key))) throw new Error('Unsupported Codex role override');
  const lines = ['name = ' + quoted(role.name), 'description = ' + quoted(role.description),
    'developer_instructions = ' + quoted(instructions)];
  for (const key of ['model', 'model_reasoning_effort', 'model_reasoning_summary', 'model_verbosity']) {
    if (override[key] !== undefined) {
      if (typeof override[key] !== 'string' || !override[key].trim()) throw new Error('Invalid Codex ' + key);
      if (key === 'model' && override[key] === 'inherit') throw new Error('Omit the Codex model setting to inherit');
      if (key === 'model_reasoning_summary' && !['auto', 'concise', 'detailed', 'none'].includes(override[key])) throw new Error('Invalid Codex summary');
      if (key === 'model_verbosity' && !['low', 'medium', 'high'].includes(override[key])) throw new Error('Invalid Codex verbosity');
      lines.push(key + ' = ' + quoted(override[key]));
    }
  }
  if (override.skills !== undefined) {
    const skills = override.skills;
    if (!skills || typeof skills !== 'object' || Array.isArray(skills) || Object.keys(skills).some((key) => !['config', 'bundled', 'include_instructions'].includes(key)) ||
      skills.include_instructions !== undefined && skills.include_instructions !== false ||
      skills.bundled !== undefined && (!skills.bundled || Object.keys(skills.bundled).length !== 1 || skills.bundled.enabled !== false))
      throw new Error('Codex skill overrides may only disable supported capabilities');
    if (skills.include_instructions === false) lines.push('', '[skills]', 'include_instructions = false');
    if (skills.bundled) lines.push('', '[skills.bundled]', 'enabled = false');
    if (skills.config !== undefined) {
      if (!Array.isArray(skills.config)) throw new Error('Invalid Codex skill selectors');
      for (const item of skills.config) {
        if (!item || typeof item !== 'object' || item.enabled !== false ||
          Object.keys(item).some((key) => !['name', 'path', 'enabled'].includes(key)) ||
          Number(Object.hasOwn(item, 'name')) + Number(Object.hasOwn(item, 'path')) !== 1 ||
          Object.hasOwn(item, 'name') && (typeof item.name !== 'string' || !item.name) ||
          Object.hasOwn(item, 'path') && (typeof item.path !== 'string' || !path.isAbsolute(item.path))) throw new Error('Invalid Codex skill selector');
        lines.push('', '[[skills.config]]', (item.name ? 'name = ' + quoted(item.name) : 'path = ' + quoted(item.path)), 'enabled = false');
      }
    }
  }
  if (override.features !== undefined) {
    const supported = ['shell_tool', 'apps', 'plugins', 'memories', 'request_permissions_tool'];
    if (!override.features || typeof override.features !== 'object' || Array.isArray(override.features) ||
      Object.entries(override.features).some(([key, value]) => !supported.includes(key) || value !== false))
      throw new Error('Codex custom agents may only disable supported capabilities');
    lines.push('', '[features]', ...Object.keys(override.features).sort().map((key) => key + ' = false'));
  }
  return lines.join('\n') + '\n';
}

export function codexSkillMetadata(name, description, override = {}) {
  if (!override || typeof override !== 'object' || Array.isArray(override)) throw new Error('Invalid Codex skill metadata: ' + name);
  if (Object.keys(override).some((key) => !['interface', 'policy', 'dependencies'].includes(key)))
    throw new Error('Unsupported Codex skill metadata: ' + name);
  for (const key of ['interface', 'policy', 'dependencies']) if (override[key] !== undefined &&
    (!override[key] || typeof override[key] !== 'object' || Array.isArray(override[key]))) throw new Error('Invalid Codex skill metadata: ' + name);
  const metadata = {
    interface: { display_name: name.replace(/^personal-/, '').replaceAll('-', ' '),
      short_description: description.length > 64 ? description.slice(0, 61).trimEnd() + '...' : description,
      ...override.interface },
    policy: { allow_implicit_invocation: true, ...override.policy },
    ...(override.dependencies ? { dependencies: override.dependencies } : {}),
  };
  const interfaceKeys = ['display_name', 'short_description', 'icon_small', 'icon_large', 'brand_color', 'default_prompt'];
  if (Object.entries(metadata.interface).some(([key, value]) => !interfaceKeys.includes(key) || typeof value !== 'string' || !value.trim()) ||
    Object.keys(metadata.policy).some((key) => key !== 'allow_implicit_invocation') ||
    typeof metadata.policy.allow_implicit_invocation !== 'boolean') throw new Error('Invalid Codex skill metadata: ' + name);
  if (metadata.dependencies) {
    if (Object.keys(metadata.dependencies).some((key) => key !== 'tools') || !Array.isArray(metadata.dependencies.tools) ||
      metadata.dependencies.tools.some((tool) => !tool || typeof tool !== 'object' || tool.type !== 'mcp' ||
        typeof tool.value !== 'string' || !tool.value || Object.entries(tool).some(([key, value]) =>
          !['type', 'value', 'description', 'transport', 'url'].includes(key) || typeof value !== 'string')))
      throw new Error('Invalid Codex skill dependencies: ' + name);
  }
  // JSON is a YAML 1.2 subset, avoiding a second YAML parser and ambiguous escaping.
  return JSON.stringify(metadata, null, 2) + '\n';
}
