# danny-skill CLI

This directory reserves the future CLI package for danny-skill distribution workflows.

Planned commands:

- `danny-skill validate`: check skills, manifests, and repository layout
- `danny-skill install`: install skills for Claude Code, Codex, Cursor, or OpenCode
- `danny-skill package`: generate tool-specific output under `dist/`
- `danny-skill sync`: synchronize indexes or generated manifests from canonical skills

## Planned Install Profiles

The current `scripts/install.sh` installs complete skill directories, equivalent to the future `full` profile. The CLI should add explicit profiles without changing the canonical `skills/` source layout.

| Profile | Contents | Use Case |
| --- | --- | --- |
| `minimal` | `SKILL.md` plus required lightweight config files such as `config.yaml` | Manual sharing, small repos, quick experiments |
| `standard` | `minimal` plus small `references/` and `assets/` required by the skill workflow | Default team installation |
| `full` | Entire skill directory, including large design reference bundles and previews | Complete local mirror, offline use, design-style full capability |

## Planned CLI Responsibilities

The CLI should turn current README conventions into executable behavior:

- Resolve `<project-knowledge-base>` and `<global-knowledge-base>` from config.
- Generate project alias wrappers such as `/danny-idea` where the target tool supports command files.
- Install by profile: `--profile minimal|standard|full`.
- Install by scope: `--scope user|project`.
- Install by tool: `--tool claude-code|codex|cursor|opencode|all`.
- Initialize knowledge indexes such as `learnings/patterns/PATTERNS.md`.

Proposed command surface:

```bash
danny-skill config paths set --project .danny-skill/knowledge-base --global ~/.danny-skill/knowledge-base
danny-skill install --tool codex --scope project --profile standard
danny-skill alias generate --tool claude-code
danny-skill knowledge init --project
danny-skill validate
```

Until these commands exist, use `scripts/install.sh` for full-directory installation and README conventions for path placeholders and aliases.

Do not add a package manifest here until the shell scripts and tests prove the command surface is stable.
