# Installing danny-skill for OpenCode

danny-skill currently supports OpenCode through copy-based skill installation.

## Recommended Install

From the repository root:

```bash
./scripts/install.sh --tool opencode --yes
```

This copies all `skills/*/` directories to:

```text
~/.opencode/plugins/
```

Restart OpenCode after installation.

## Dry Run

```bash
./scripts/install.sh --tool opencode --dry-run --yes
```

## Manual Install

```bash
mkdir -p ~/.opencode/plugins
cp -R skills/* ~/.opencode/plugins/
```

## Future Plugin Shim

A lightweight OpenCode plugin can later register the repository `skills/` path directly. Until that shim exists, keep installation copy-based and treat `skills/` as the canonical source.
