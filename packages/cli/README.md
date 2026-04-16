# danny-skill CLI

This package contains the danny-skill CLI. It uses a Node.js command wrapper with a Rust N-API core that can be adopted incrementally. When the native addon has not been built, the JavaScript implementation remains the compatibility fallback.

Implemented commands:

- `danny-skill validate`: check skills and required frontmatter
- `danny-skill install`: install skills for Claude Code, Codex, or Cursor project rules
- `danny-skill config paths set`: write knowledge-base path mappings
- `danny-skill knowledge init`: initialize project knowledge directories
- `danny-skill package`: generate tool-specific output under `dist/`
- `danny-skill sync`: synchronize generated manifests from package metadata
- `danny-skill alias generate`: generate tool-specific command wrappers where supported

Future commands:

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
- Install by tool: `--tool claude-code|codex|cursor`.
- Initialize knowledge indexes such as `learnings/patterns/PATTERNS.md`.
- Sync plugin manifests from root package metadata.
- Generate distributable plugin artifacts under `dist/`.
- Generate project alias wrappers such as `/danny-idea` where the target tool supports command files.

Future CLI responsibilities:

- Extend install adapters for OpenCode.

Proposed command surface:

```bash
danny-skill config paths set --project .danny-skill/knowledge-base --global ~/.danny-skill/knowledge-base
danny-skill install --tool codex --scope project --profile standard
danny-skill install --tool cursor --scope project --profile standard --mode copy
danny-skill knowledge init --project
danny-skill sync
danny-skill package --profile standard
danny-skill alias generate --tool claude-code
danny-skill validate
```

Use `scripts/install.sh` when you need the legacy full-directory installer behavior across all currently supported tools.

## Rust N-API Layout

```text
packages/cli/
├── package.json          npm package metadata and bin entry
├── bin/danny-skill.mjs   npm executable wrapper
├── danny-skill.mjs       JavaScript CLI fallback implementation
├── index.mjs             native addon loader
├── Cargo.toml            Rust crate metadata
├── build.rs              napi-rs build hook
├── src/lib.rs            Rust N-API exports
└── templates/            small files embedded into the native addon
```

The native addon embeds only small templates, such as the default `PATTERNS.md` created by `knowledge init`. Large skill content, commands, and design assets stay in `dist/` so the native binary does not absorb bulky distribution data.

The first native function was `validate_skills`, exported to JavaScript as `validateSkills`. Additional deterministic core behavior such as path config, knowledge initialization, manifest sync, alias generation, and package plan generation is migrating into Rust while JavaScript keeps platform-sensitive file copying and symlink execution.

Build native addon:

```bash
cd packages/cli
pnpm install
pnpm build
```

Repository-level tests can run without the native addon because `danny-skill.mjs` falls back to JavaScript when no `.node` binding is present.

## CI And npm Release

CI builds the N-API addon, packages `dist/`, and runs `npm pack --dry-run` to verify the publishable package shape.

npm publishing is gated to the `Release CLI` workflow. It runs when pushing a tag that matches `cli-v*`, or when started manually with `workflow_dispatch` from GitHub Actions.

```bash
git tag cli-v1.0.0
git push origin cli-v1.0.0
```

Publishing requires the repository secret `NPM_TOKEN` unless the package is moved to npm Trusted Publishing.
