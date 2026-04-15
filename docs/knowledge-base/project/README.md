# Project Knowledge Base

Project-local knowledge assets for danny-skill.

```text
inbox/inspiration/       raw captured ideas
ideas/                   developed but not yet validated ideas
research/                paper-to-implementation research workspaces
experiments/autoresearch/ eval-driven experiment logs
learnings/               errors, corrections, successes, and patterns
distilled/               validated reusable knowledge
```

Use this directory for material that should travel with the repository.

Storage model:

```text
capture -> workspace -> evidence -> distilled
```

Use `inbox/` for raw captures, `ideas/` and `research/` for active knowledge workspaces, `experiments/` and `learnings/` for evidence, and `distilled/` for stable conclusions. Keep `.omx/` runtime state, logs, and task progress out of this tree unless they are rewritten as durable knowledge entries.
