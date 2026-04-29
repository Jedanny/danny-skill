# danny-skill

[中文](README.md) | [English](README.en.md)

`danny-skill` is a team skill library for AI coding tools. The repository treats reusable `SKILL.md` assets as the primary product, while leaving room for future CLI-based install, validation, packaging, and sync workflows.

## Supported Tools

| Tier | Tool | Support Model |
| --- | --- | --- |
| Tier 1 | Claude Code | Native `SKILL.md`, supports both user-scope and project-scope `.claude/skills/`. |
| Tier 1 | OpenAI Codex | Native `SKILL.md`, supports both user-scope and project-scope `.agents/skills/`. |
| Tier 2 | Cursor | Adapted through `.cursor/rules/` and `.cursor/commands/`, not a native skill runtime. |
| Tier 3 | OpenCode | Adapted through plugin/link compatibility paths, with room for a more complete plugin shim later. |

## Core Conventions

- `skills/` is the only canonical source for skill content.
- Each skill lives at `skills/<skill-name>/SKILL.md`.
- Skill directories use kebab-case, for example `skills/knowledge-distill/`.
- Native Claude Code and Codex discovery rely on `name` and `description`.
- `trigger` is a repository-level alias and future CLI metadata field. It is not automatically converted into a native Claude Code or Codex command.
- `triggers` captures natural-language routing hints for discovery, README generation, and future CLI automation.
- Skill bodies are primarily written in Chinese; frontmatter `description` stays in English as `Use when...` so skill discovery remains compatible with Claude Code and Codex.
- Commands, paths, config keys, technical terms, and external project names stay in their original form.
- Plugin directories only store distribution metadata or install instructions. They should not duplicate skill bodies.

## Install

```bash
pnpm install
pnpm test
```

Default install uses links so one repo can be reused across multiple tools:

```bash
./scripts/install.sh --tool claude-code --yes
./scripts/install.sh --tool codex --yes
./scripts/install.sh --tool cursor --scope project --yes
./scripts/install.sh --tool opencode --yes
```

On macOS and Linux the installer uses symlinks. On Windows Git Bash, MSYS, or Cygwin it will attempt directory junctions. If a target directory already contains an older copied install, use `--replace` to switch it to links:

```bash
./scripts/install.sh --tool all --replace --yes
```

`--tool all` only covers tools that support user-scope installs. Cursor must be installed explicitly with `--tool cursor --scope project`, because the supported shared path is the project-local `.cursor/rules/` and `.cursor/commands/` workflow.

If the environment does not support links, force copy mode:

```bash
./scripts/install.sh --tool codex --mode copy --yes
```

Project-scope installs:

```bash
./scripts/install.sh --tool claude-code --scope project --yes
./scripts/install.sh --tool codex --scope project --yes
./scripts/install.sh --tool cursor --scope project --yes
```

Dry-run install preview:

```bash
./scripts/install.sh --tool codex --dry-run --yes
```

The shell installer always installs the full skill directory, equivalent to the `full` profile. Finer-grained packaging is provided by `packages/cli/`.

| Profile | Intended Use |
| --- | --- |
| `minimal` | Ship only `SKILL.md` and required config for lightweight sync or manual installs. |
| `standard` | Ship `SKILL.md`, small `references/`, and `assets/` for most team sharing use cases. |
| `full` | Ship the full skill directory, including large reference bundles and preview assets. This matches the shell installer today. |

Examples:

```bash
pnpm cli validate
pnpm cli install --tool codex --scope project --profile standard --mode copy
pnpm cli install --tool cursor --scope project --profile standard --mode copy
pnpm cli knowledge init --project
pnpm cli alias generate --tool claude-code
```

`minimal` and `standard` require `--mode copy`. `full` supports either `copy` or `link`.

## Learning Closed Loop

`danny-skill` does not treat summarization as the end state of learning. The current learning-oriented design breaks knowledge work into six stages:

1. `capture`: record raw ideas, questions, materials, and intuitions
2. `interrogate`: verify understanding through questions, definition checks, and counterexamples
3. `stabilize`: distill pressure-tested content into stable knowledge
4. `retain`: improve recall through retrieval practice and spaced review
5. `correct`: use errors, contradictions, and user corrections to repair rule boundaries
6. `re-distill`: convert validated corrections back into durable knowledge

Recommended loop:

```text
inspiration-box
-> socratic-learning
-> knowledge-distill
-> retrieval-and-spacing
-> self-improvement
-> knowledge-distill
```

Detailed English overview:
- [`docs/learning-closed-loop.md`](docs/learning-closed-loop.md)

## Skills and Invocation

The main entry skill is:

- [`using-danny`](skills/using-danny/SKILL.md)

Key learning and knowledge skills:

- [`inspiration-box`](skills/inspiration-box/SKILL.md)
- [`socratic-learning`](skills/socratic-learning/SKILL.md)
- [`knowledge-distill`](skills/knowledge-distill/SKILL.md)
- [`retrieval-and-spacing`](skills/retrieval-and-spacing/SKILL.md)
- [`self-improvement`](skills/self-improvement/SKILL.md)
- [`research-to-implementation`](skills/research-to-implementation/SKILL.md)
- [`coding-guardrails`](skills/coding-guardrails/SKILL.md)
- [`autoresearch-loop`](skills/autoresearch-loop/SKILL.md)
- [`design-style`](skills/design-style/SKILL.md)

Codex explicit invocation uses `$skill-name`. Claude Code and Cursor use the corresponding project install paths and generated aliases where applicable.

## Suggested Combinations

Research to implementation:

```text
research-to-implementation -> coding-guardrails
```

Learning loop:

```text
inspiration-box -> socratic-learning -> knowledge-distill -> retrieval-and-spacing -> self-improvement -> knowledge-distill
```

Errors to durable knowledge:

```text
self-improvement -> knowledge-distill
```

## Skill Boundaries

| Skill | Best For | Not For |
| --- | --- | --- |
| `inspiration-box` | Capturing ideas, explorations, and testable hypotheses | Work that already requires rigorous validation, implementation, or team decisions |
| `socratic-learning` | Understanding concepts, frameworks, articles, and methods | Replacing long-term knowledge storage or full research reports |
| `knowledge-distill` | Turning pressure-tested knowledge into reusable artifacts | Dumping raw notes or unverified impressions directly into durable knowledge |
| `retrieval-and-spacing` | Turning stable knowledge into review cards and spaced prompts | Determining whether a claim is true in the first place |
| `self-improvement` | Recording errors, corrections, repeated issues, and rule-boundary updates | General knowledge organization or vague retrospective writing |
| `research-to-implementation` | Moving from papers or open source to implementation proposals | Superficial paper summaries or GitHub-star-only evaluation |

## Knowledge Storage Scope

The same skill can support both project-level and global/system-level knowledge. The trigger expresses the action; the scope expresses the destination.

Skill bodies use placeholders instead of hard-coded repository paths:

```text
<project-knowledge-base>
<global-knowledge-base>
```

Recommended default mapping in this repository:

- `<project-knowledge-base>` -> `.danny/knowledge-base/`
- `<global-knowledge-base>` -> `~/.danny/knowledge-base/`

Alias-style examples:

```text
/danny-idea ...      -> .danny/knowledge-base/...
/danny-distill ...   -> .danny/knowledge-base/...
/danny-learn ...     -> .danny/knowledge-base/...
/danny-understand ... -> reads source material, then routes results into .danny/knowledge-base/distilled/ or .danny/knowledge-base/learnings/
/danny-review ...     -> reads .danny/knowledge-base/distilled/ and .danny/knowledge-base/learnings/ to produce review prompts
```

Practical mapping:

- `inspiration-box` primarily writes to `inbox/` and `ideas/`
- `knowledge-distill` primarily writes to `distilled/`
- `self-improvement` primarily writes to `learnings/`
- `socratic-learning` normally does not write long-term knowledge directly; it reads learning input and then hands off to `knowledge-distill` or `self-improvement`
- `retrieval-and-spacing` normally reads from `distilled/` and `learnings/`, then emits review cards or review prompts

Global knowledge should be de-projectized before it is written outside the repository.

## References

External references are maintained centrally so `SKILL.md` files do not need to repeat the same source boilerplate. See the Chinese README for the full source table and current links.

## Repository Layout

```text
danny-skill/
├── skills/             # Canonical SKILL.md skills
├── commands/           # Reusable command docs
├── prompts/            # Prompt templates
├── hooks/              # Session hooks
├── .claude-plugin/     # Claude Code plugin metadata
├── .codex/             # Codex install docs
├── .cursor-plugin/     # Cursor plugin metadata
├── .opencode/          # OpenCode install docs
├── docs/               # Design docs and storage-model docs
├── .danny/             # Project-level skill knowledge assets
├── tests/              # Jest-based structure and installer tests
├── tools/              # Lightweight helper scripts
└── packages/cli/       # Future / evolving CLI package
```

## Development

```bash
pnpm test
pnpm run validate
pnpm exec tsc --noEmit
```

When adding a new skill:

1. create `skills/<skill-name>/SKILL.md`
2. add the required frontmatter fields
3. add or update `config.yaml`
4. run `pnpm test`

See `CONTRIBUTING.md` for contribution guidance and `AGENTS.md` for runtime conventions inside this repository.
