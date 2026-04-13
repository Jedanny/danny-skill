# Installing danny-skill for Codex

danny-skill exposes skills through the repository `skills/` directory.

## Recommended Install

From the repository root:

```bash
./scripts/install.sh --tool codex --yes
```

By default, this links all `skills/*/` directories into:

```text
~/.agents/skills/
```

Restart Codex after installation so skills are rediscovered.

## Project Scope

Codex scans repository skills from `.agents/skills/` in the working directory and parent directories. To make this repository expose its skills in project scope, link the canonical skills into `.agents/skills/`:

```bash
./scripts/install.sh --tool codex --scope project --yes
```

Generated `.agents/skills/` links are ignored by git; keep editing canonical files under `skills/`.

If a previous copy-based install already exists, replace it with links:

```bash
./scripts/install.sh --tool codex --replace --yes
```

## Dry Run

Preview writes without copying files:

```bash
./scripts/install.sh --tool codex --dry-run --yes
```

## Manual Install

```bash
mkdir -p ~/.agents/skills
ln -s "$(pwd)/skills/"* ~/.agents/skills/
```

## Copy Fallback

If your environment cannot create symlinks, use copy mode:

```bash
./scripts/install.sh --tool codex --mode copy --yes
```

## oh-my-codex Compatibility Note

Some oh-my-codex installations also scan `${CODEX_HOME:-~/.codex}/skills`. This repository follows the current Codex official skill locations by default. If your local oh-my-codex setup requires `~/.codex/skills`, create manual links there and avoid duplicating the same skills in `~/.agents/skills`.

```bash
mkdir -p ~/.codex/skills
ln -s "$(pwd)/skills/"* ~/.codex/skills/
```

Use one Codex discovery path per checkout to avoid duplicate skill entries.
