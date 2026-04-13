# danny-skill Agent Contract

This repository is a skill-library-first package for sharing AI coding skills across Claude Code, Codex, Cursor, and OpenCode.

## Operating Principles

- Keep `skills/` as the canonical source for skill content.
- Prefer symlink/junction installation over copying so all tools reuse the same source files.
- Do not restore the legacy `assets/ + adapters/ + lib/schema.ts` architecture without a new approved design.
- Keep CLI work incremental: lightweight scripts may live in `tools/`; stable user-facing CLI code belongs in `packages/cli/`.
- Contributor-facing guidance lives in `CONTRIBUTING.md`.

## Skill Rules

- Each skill lives at `skills/<skill-name>/SKILL.md`.
- `name` must match the directory name and use kebab-case.
- `description` must start with `Use when` for Codex/OMX discovery.
- Include `triggers`, `version`, `tags`, and `supported_tools`.
- Put large supporting material in `references/`, helper scripts in `scripts/`, and reusable files in `assets/`.
- Do not duplicate skill bodies into tool-specific directories.

## Codex / oh-my-codex Alignment

- User-scope skills install to `~/.codex/skills/<skill>`.
- Project-scope skills install to `.codex/skills/<skill>` via generated links.
- `.codex/skills/` is ignored because it is generated from canonical `skills/`.
- Treat `~/.agents/skills` as a legacy/native fallback, not the default oh-my-codex path.
- Keep `AGENTS.md` focused on runtime/project instructions; broad contribution docs belong in `CONTRIBUTING.md`.

## Commands

```bash
pnpm test
pnpm run validate
pnpm exec tsc --noEmit
./scripts/install.sh --tool codex --scope project --yes
./scripts/install.sh --tool all --dry-run --yes
```

## Verification

Run `pnpm test` after changing skills, manifests, installer behavior, layout rules, or docs that describe install paths. Run `pnpm exec tsc --noEmit` after changing TypeScript tests or future TypeScript tooling.

## Commit Protocol

Use Lore-style commits: first line explains why, body records constraints and tradeoffs, trailers document confidence, scope risk, tests, and known gaps.
