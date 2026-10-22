# Scoped instruction sources

Add an `instructions.md` file below a path that mirrors the repository scope where it applies.

```text
ai/source/scoped-instructions/src/features/orders/instructions.md
                                      |
                                      v
src/features/orders/AGENTS.md
```

The root source remains `ai/source/instructions.md`. A scoped file should contain only guidance that is narrower than the root instructions. Do not copy the entire root file.

Generation owns only the exact resulting `AGENTS.md` file. Other files in the target directory are preserved. An existing unowned `AGENTS.md` causes a conflict instead of being overwritten. Removing a source removes its unchanged generated output; an edited output blocks removal so its content can be preserved.

Allowed scope segments contain letters, numbers, hyphens, and underscores. Generated scopes cannot target AI source/configuration directories, `docs/ai`, `.git`, or `node_modules`.

Hierarchical discovery and precedence must be verified in each platform/version. Treat the closest applicable file as narrower guidance and keep it compatible with the root contract; do not use a nested file to weaken security, authority, evidence, or release constraints.
