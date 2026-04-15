# Knowledge Base

This directory is the unified home for knowledge assets created by the skill system.

## Scopes

### Project Scope

Use `docs/knowledge-base/project/` for knowledge that belongs to this repository and should be versioned with it.

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

Do not commit global knowledge directly into this repository. If a project needs a global note, link to it or distill a project-specific summary under `docs/knowledge-base/project/`.

## Project Layout

```text
project/
├── inbox/
│   └── inspiration/
├── ideas/
├── learnings/
├── distilled/
└── experiments/
```

Lifecycle:

```text
inbox -> ideas -> experiments -> learnings -> distilled
```
