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

- Codex official user-scope skills install to `~/.agents/skills/<skill>`.
- Codex official project-scope skills install to `.agents/skills/<skill>` via generated links.
- Claude Code project-scope skills install to `.claude/skills/<skill>` via generated links.
- `.agents/skills/`, `.claude/skills/`, and `.codex/skills/` are ignored because they are generated from canonical `skills/`.
- Treat `~/.codex/skills` as an oh-my-codex compatibility path, not the default official Codex path.
- Keep `AGENTS.md` focused on runtime/project instructions; broad contribution docs belong in `CONTRIBUTING.md`.

## Commands

```bash
pnpm test
pnpm run validate
pnpm exec tsc --noEmit
./scripts/install.sh --tool codex --scope project --yes
./scripts/install.sh --tool claude-code --scope project --yes
./scripts/install.sh --tool all --dry-run --yes
```

## Verification

Run `pnpm test` after changing skills, manifests, installer behavior, layout rules, or docs that describe install paths. Run `pnpm exec tsc --noEmit` after changing TypeScript tests or future TypeScript tooling.

## Commit Protocol

Use Lore-style commits: first line explains why, body records constraints and tradeoffs, trailers document confidence, scope risk, tests, and known gaps.
