let raw = '';
for await (const chunk of process.stdin) raw += chunk;
const input = JSON.parse(raw);
const text = JSON.stringify(input);
const generatedPath = /(?:^|[\\/])(?:AGENTS\.md|\.agents[\\/]|\.claude[\\/]|docs[\\/]ai[\\/]|ai[\\/]generated[\\/])/i;

if (generatedPath.test(text)) {
  process.stdout.write(JSON.stringify({
    additional_context: 'Generated AI guidance was edited. Preserve the intended change in ai/source/ or ai/platform-overrides/, then regenerate and run the drift check; do not commit generated output.'
  }));
} else {
  process.stdout.write('{}');
}
