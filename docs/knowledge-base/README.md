# Knowledge Base

This directory documents the knowledge storage model used by the skill system.

See `storage-model.md` for the storage boundary and promotion rules inspired by oh-my-codex `.omx` storage.

## Scopes

### Project Scope

Use `.danny-skill/knowledge-base/` for knowledge that belongs to a repository and should travel with it. This avoids occupying a host project's own `docs/` tree.

Examples:

- project-specific ideas
- project decisions
- project implementation lessons
- experiments that affect this repository

### Global Scope

Use a user-level knowledge base for reusable personal or team knowledge that should apply across repositories.

Recommended global path:

```text
~/.danny-skill/knowledge-base/
```

Do not commit global knowledge directly into this repository. If a project needs a global note, link to it or distill a project-specific summary under `.danny-skill/knowledge-base/`.

## Project Layout

```text
.danny-skill/knowledge-base/
├── inbox/
│   └── inspiration/
├── ideas/
├── research/
├── experiments/
├── learnings/
└── distilled/
```

Lifecycle:

```text
capture -> workspace -> evidence -> distilled
```

In this repository, `inbox/` is capture, `ideas/` and `research/` are workspaces, `experiments/` and `learnings/` are evidence, and `distilled/` is stable reusable knowledge.

Runtime state, active mode progress, local logs, and metrics belong in `.omx/`, not in the knowledge base.

`docs/knowledge-base/` is documentation only. Use it to explain the model, not as the default write target for project knowledge.
