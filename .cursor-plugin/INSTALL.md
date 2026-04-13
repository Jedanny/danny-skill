# Installing danny-skill for Cursor

Cursor project rules live in `.cursor/rules`, and custom chat commands live in `.cursor/commands`.

## Project Install

From the repository root:

```bash
./scripts/install.sh --tool cursor --scope project --yes
```

This links:

```text
skills/<skill>/SKILL.md -> .cursor/rules/<skill>.mdc
commands/*.md           -> .cursor/commands/*.md
```

Generated `.cursor/rules/` and `.cursor/commands/` links are ignored by git. Keep editing canonical files under `skills/` and `commands/`.

## Dry Run

```bash
./scripts/install.sh --tool cursor --scope project --dry-run --yes
```

## Copy Fallback

```bash
./scripts/install.sh --tool cursor --scope project --mode copy --yes
```

## Legacy User Install

Cursor user rules are configured in Cursor Settings, not through a portable filesystem path. The installer still supports the historical best-effort path `~/.cursor/skills/`, but project rules are the official sharing path.
