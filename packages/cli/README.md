# danny-skill CLI

This directory reserves the future CLI package for danny-skill distribution workflows.

Planned commands:

- `danny-skill validate`: check skills, manifests, and repository layout
- `danny-skill install`: install skills for Claude Code, Codex, Cursor, or OpenCode
- `danny-skill package`: generate tool-specific output under `dist/`
- `danny-skill sync`: synchronize indexes or generated manifests from canonical skills

Do not add a package manifest here until the shell scripts and tests prove the command surface is stable.
