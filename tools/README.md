# tools

This directory is reserved for lightweight repository scripts that support the skill library before they become part of the formal CLI.

Good fits:

- skill frontmatter validation
- manifest consistency checks
- packaging dry-runs
- one-off migration helpers

Keep scripts small and dependency-light. Once a script becomes user-facing or needs stable command semantics, move it into `packages/cli/`.
