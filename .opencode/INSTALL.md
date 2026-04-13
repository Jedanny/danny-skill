# Installing danny-skill for OpenCode

danny-skill currently supports OpenCode through link-based skill installation, with copy mode available as a fallback.

## Recommended Install

From the repository root:

```bash
./scripts/install.sh --tool opencode --yes
```

By default, this links all `skills/*/` directories into:

```text
~/.opencode/plugins/
```

Restart OpenCode after installation.

If a previous copy-based install already exists, replace it with links:

```bash
./scripts/install.sh --tool opencode --replace --yes
```

## Dry Run

```bash
./scripts/install.sh --tool opencode --dry-run --yes
```

## Manual Install

```bash
mkdir -p ~/.opencode/plugins
ln -s "$(pwd)/skills/"* ~/.opencode/plugins/
```

## Copy Fallback

```bash
./scripts/install.sh --tool opencode --mode copy --yes
```

## Future Plugin Shim

A lightweight OpenCode plugin can later register the repository `skills/` path directly. Until that shim exists, keep installation copy-based and treat `skills/` as the canonical source.
