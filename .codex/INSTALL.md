# Installing danny-skill for Codex

danny-skill exposes skills through the repository `skills/` directory.

## Recommended Install

From the repository root:

```bash
./scripts/install.sh --tool codex --yes
```

By default, this links all `skills/*/` directories into:

```text
~/.codex/skills/
```

Restart Codex after installation so skills are rediscovered.

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
mkdir -p ~/.codex/skills
ln -s "$(pwd)/skills/"* ~/.codex/skills/
```

## Copy Fallback

If your environment cannot create symlinks, use copy mode:

```bash
./scripts/install.sh --tool codex --mode copy --yes
```

## Advanced Native Discovery

Some Codex setups also discover skills through `~/.agents/skills/`. In that case, keep the repository cloned and link the canonical skills directory:

```bash
mkdir -p ~/.agents/skills
ln -s "$(pwd)/skills" ~/.agents/skills/danny-skill
```

Use either per-skill links under `~/.codex/skills/` or native discovery under `~/.agents/skills/`, not both for the same checkout.
