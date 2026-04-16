# danny-skill CLI

This directory reserves the future CLI package for danny-skill distribution workflows.

Planned commands:

- `danny-skill validate`: check skills and required frontmatter
- `danny-skill install`: install skills for Claude Code or Codex
- `danny-skill config paths set`: write knowledge-base path mappings
- `danny-skill knowledge init`: initialize project knowledge directories

Future commands:

- `danny-skill package`: generate tool-specific output under `dist/`
- `danny-skill sync`: synchronize indexes or generated manifests from canonical skills
- `danny-skill alias generate`: generate tool-specific command wrappers where supported

## Planned Install Profiles

The current `scripts/install.sh` installs complete skill directories, equivalent to the CLI `full` profile. The CLI adds explicit profiles without changing the canonical `skills/` source layout.

| Profile | Contents | Use Case |
| --- | --- | --- |
| `minimal` | `SKILL.md` plus required lightweight config files such as `config.yaml` | Manual sharing, small repos, quick experiments |
| `standard` | `minimal` plus small `references/` and `assets/`; excludes the large `design-style/references/designs/` bundle | Default team installation |
| `full` | Entire skill directory, including large design reference bundles and previews | Complete local mirror, offline use, design-style full capability |

## CLI Responsibilities

The CLI turns current README conventions into executable behavior:

- Resolve `<project-knowledge-base>` and `<global-knowledge-base>` from config.
- Install by profile: `--profile minimal|standard|full`.
- Install by scope: `--scope user|project`.
- Install by tool: `--tool claude-code|codex`.
- Initialize knowledge indexes such as `learnings/patterns/PATTERNS.md`.

Future CLI responsibilities:

- Generate project alias wrappers such as `/danny-idea` where the target tool supports command files.
- Package tool-specific output under `dist/`.
- Extend install adapters for Cursor and OpenCode.

Proposed command surface:

```bash
danny-skill config paths set --project .danny-skill/knowledge-base --global ~/.danny-skill/knowledge-base
danny-skill install --tool codex --scope project --profile standard
danny-skill knowledge init --project
danny-skill validate
```

Use `scripts/install.sh` when you need the legacy full-directory installer behavior across all currently supported tools.

Do not add a package manifest here until the shell scripts and tests prove the command surface is stable.
