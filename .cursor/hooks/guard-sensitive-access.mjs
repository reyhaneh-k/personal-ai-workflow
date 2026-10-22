function respond(payload) {
  process.stdout.write(JSON.stringify(payload));
}

function allow() {
  respond({ permission: 'allow' });
}

function deny() {
  respond({
    permission: 'deny',
    user_message: 'Cursor blocked access to a sensitive path. Use an approved secret-management workflow instead.',
    agent_message: 'Do not read, print, or transmit sensitive files. Use documented redacted inputs or ask the human for an approved alternative.'
  });
}

try {
  let raw = '';
  for await (const chunk of process.stdin) raw += chunk;

  if (!raw.trim()) {
    // Fail open on empty hook payload so failClosed cannot freeze ordinary agent work.
    allow();
    process.exit(0);
  }

  let input;
  try {
    input = JSON.parse(raw);
  } catch {
    // Fail open on malformed stdin; deny only when a known sensitive path is present.
    allow();
    process.exit(0);
  }

  const values = [];

  function collect(value) {
    if (typeof value === 'string') values.push(value);
    else if (Array.isArray(value)) value.forEach(collect);
    else if (value && typeof value === 'object') Object.values(value).forEach(collect);
  }

  collect(input);

  const candidate = values.join('\n');
  const sensitive = /(?:^|[\\/\s'"`])(?:\.env(?!\.(?:example|template)\b)(?:\.[\w.-]+)?|credentials\.json|secrets\.json|id_rsa|id_ed25519|[^\\/\s'"`]+\.(?:pem|key)|\.ssh[\\/]|\.aws[\\/]|\.gcp[\\/]|\.azure[\\/]|private[\\/])/i;

  if (sensitive.test(candidate)) deny();
  else allow();
} catch {
  // Infrastructure failure: emit explicit allow so failClosed does not brick Read/Shell.
  allow();
}
