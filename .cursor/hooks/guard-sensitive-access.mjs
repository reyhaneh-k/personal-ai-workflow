let raw = '';
for await (const chunk of process.stdin) raw += chunk;
const input = JSON.parse(raw);
const values = [];

function collect(value) {
  if (typeof value === 'string') values.push(value);
  else if (Array.isArray(value)) value.forEach(collect);
  else if (value && typeof value === 'object') Object.values(value).forEach(collect);
}

collect(input);

const candidate = values.join('\n');
const sensitive = /(?:^|[\\/\s'"`])(?:\.env(?!\.(?:example|template)\b)(?:\.[\w.-]+)?|credentials\.json|secrets\.json|id_rsa|id_ed25519|[^\\/\s'"`]+\.(?:pem|key)|\.ssh[\\/]|\.aws[\\/]|\.gcp[\\/]|\.azure[\\/]|private[\\/])/i;

if (sensitive.test(candidate)) {
  process.stdout.write(JSON.stringify({
    permission: 'deny',
    user_message: 'Cursor blocked access to a sensitive path. Use an approved secret-management workflow instead.',
    agent_message: 'Do not read, print, or transmit sensitive files. Use documented redacted inputs or ask the human for an approved alternative.'
  }));
} else {
  process.stdout.write(JSON.stringify({ permission: 'allow' }));
}
