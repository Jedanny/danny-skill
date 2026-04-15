# Knowledge Storage Model

This model borrows the useful separation from oh-my-codex `.omx` storage without turning runtime state into repository knowledge.

## Boundary

`.omx/` is runtime and orchestration storage. It can hold active state, logs, local metrics, temporary notes, and mode-specific progress. Do not copy `.omx/` content into this directory as-is.

`.danny-skill/knowledge-base/` is the default project-local durable knowledge storage. It should hold material that is useful after the current agent run ends: decisions, research summaries, validated learnings, reusable patterns, and experiment conclusions. The dot-directory keeps skill-generated knowledge from occupying a host project's existing `docs/` tree.

`docs/knowledge-base/` is documentation for this storage model, not the default project write target.

Promote content from runtime storage only after it has been reviewed or distilled.

## Layer Model

Use the same mental model for project and global knowledge:

```text
capture -> workspace -> evidence -> distilled
```

| Layer | Project path | Purpose |
| --- | --- | --- |
| capture | `.danny-skill/knowledge-base/inbox/` | Raw ideas or unprocessed observations. |
| workspace | `.danny-skill/knowledge-base/ideas/`, `.danny-skill/knowledge-base/research/` | Developing ideas, research traces, and implementation proposals. |
| evidence | `.danny-skill/knowledge-base/experiments/`, `.danny-skill/knowledge-base/learnings/` | Eval results, keep-or-revert records, errors, corrections, successes, and recurring patterns. |
| distilled | `.danny-skill/knowledge-base/distilled/` | Stable concepts, best practices, decisions, and lessons. |

## Promotion Rules

- Raw captures start in `inbox/`.
- Research workspaces keep source notes, comparisons, business fit analysis, and implementation proposals.
- Experiments keep baseline, candidate, metric delta, and keep-or-revert decisions.
- Learnings keep concrete events and actionable prevention or reuse notes.
- Distilled entries contain only stable conclusions with source links back to the workspace or evidence that produced them.

## Runtime Rules

- Do not commit `.omx/` state, logs, metrics, or local mode files.
- Do not store transient task progress in `.danny-skill/knowledge-base/`.
- Do not use the knowledge base as an agent scratchpad.
- If an `.omx` note becomes reusable, rewrite it as a project knowledge entry with source, date, scope, and status.

## Global Scope

Project knowledge lives under `.danny-skill/knowledge-base/`.

Global reusable knowledge should live outside the repository:

```text
~/.danny-skill/knowledge-base/
```

When global knowledge affects this repository, keep only a project-specific summary or link in `.danny-skill/knowledge-base/`.
