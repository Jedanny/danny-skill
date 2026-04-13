# CLAUDE.md

This file guides Claude Code when working in this repository. See `CONTRIBUTING.md` for contributor workflow details and `AGENTS.md` for Codex/OMX project instructions.

## Project Overview

danny-skill is a skill-library-first repository for sharing AI coding skills across Claude Code, Codex, Cursor, and OpenCode. The canonical source is `skills/`; tool-specific directories contain distribution metadata or install instructions only.

## Project Structure

```text
danny-skill/
├── skills/             # Canonical SKILL.md skills
├── commands/           # Reusable command documents
├── prompts/            # Prompt templates
├── hooks/              # Session hooks
├── docs/               # Specs, plans, learnings
├── tests/              # Jest validation tests
├── .claude-plugin/     # Claude Code plugin metadata
├── .codex/             # Codex install docs
├── .cursor-plugin/     # Cursor plugin metadata
└── .opencode/          # OpenCode install docs
```

## Available Skills

- `inspiration-box`: `/danny-idea` - inspiration capture and management
- `knowledge-distill`: `/danny-distill` - team knowledge distillation
- `self-improvement`: `/danny-learn` - learning from errors, feedback, and successes
- `design-style`: automatic trigger - website and UI design style references

## Adding New Skills

1. Create `skills/<skill-name>/SKILL.md`.
2. Use kebab-case for the directory and the `name` frontmatter.
3. Include a `Use when` description, `triggers`, `version`, `tags`, and `supported_tools`.
4. Put long references in `references/`, helper scripts in `scripts/`, and reusable files in `assets/`.
5. Run `pnpm test`.

## Commands

```bash
pnpm install
pnpm test
pnpm run validate
pnpm exec tsc --noEmit
./scripts/install.sh --tool claude-code --dry-run --yes
```

## Architecture Notes

Do not restore the old `assets/ + adapters/ + lib/schema.ts` architecture unless a new design supersedes `docs/superpowers/specs/2026-04-13-danny-skill-shareable-tooling-architecture-design.md`. Future CLI work belongs under `packages/cli/`; lightweight scripts can start under `tools/`.
