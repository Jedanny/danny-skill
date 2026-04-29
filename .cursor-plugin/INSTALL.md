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

## Scope Boundary

Cursor installs are project-scoped in this repository. The installer rejects user-scope Cursor installs so the shared path stays aligned with the official `.cursor/rules/` and `.cursor/commands/` workflow.
