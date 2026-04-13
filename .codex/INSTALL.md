# Installing danny-skill for Codex

danny-skill exposes skills through the repository `skills/` directory.

## Recommended Install

From the repository root:

```bash
./scripts/install.sh --tool codex --yes
```

This copies all `skills/*/` directories to:

```text
~/.codex/skills/
```

Restart Codex after installation so skills are rediscovered.

## Dry Run

Preview writes without copying files:

```bash
./scripts/install.sh --tool codex --dry-run --yes
```

## Manual Install

```bash
mkdir -p ~/.codex/skills
cp -R skills/* ~/.codex/skills/
```

## Advanced Native Discovery

Some Codex setups also discover skills through `~/.agents/skills/`. In that case, keep the repository cloned and link the canonical skills directory:

```bash
mkdir -p ~/.agents/skills
ln -s "$(pwd)/skills" ~/.agents/skills/danny-skill
```

Use either copy-based install or symlink discovery, not both for the same checkout.
