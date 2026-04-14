---
name: research-to-implementation
description: Use when turning papers, technical reports, or research ideas into open-source comparisons, business-fit analysis, implementation proposals, and coding handoff plans
version: "1.0"
triggers: [paper, research, arxiv, literature, open-source, implementation, business-fit, feasibility, prototype]
tags: [research, papers, open-source, implementation, product, engineering]
supported_tools: [claude-code, codex]
---

# Research To Implementation

## Purpose

Turn a research direction into an engineering decision and coding handoff. This skill covers the path from paper search to paper analysis, open source evaluation, business fit, implementation proposal, and coding handoff.

Use it when the user is asking whether a paper, algorithm, architecture, model, benchmark, or open-source project can improve their own product, workflow, or engineering efficiency.

## Methodology Note

This workflow is inspired by 花叔's shared methodology for turning research into reusable skills and business implementation: start from papers and technical ideas, analyze the underlying solution, search for open-source implementations, brainstorm business fit, then convert the validated path into coding work. This skill adapts that methodology into a reusable Claude Code / Codex workflow while keeping the output templates project-neutral.

## Pipeline

1. **Frame the research question**: Define the business problem, metric, constraints, and non-goals.
2. **Run paper search**: Find candidate papers or technical reports, then filter them with explicit inclusion and exclusion criteria.
3. **Perform paper analysis**: Translate methods into engineering terms: inputs, outputs, assumptions, modules, costs, data needs, and reusable ideas.
4. **Run open source evaluation**: Search for implementations, compare license, maintenance health, API fit, docs, tests, security posture, and adaptation cost.
5. **Assess business fit**: Brainstorm where the idea could improve the user's business, operations, product, or developer workflow.
6. **Write implementation proposal**: Define MVP scope, architecture, risks, validation metrics, and rollback path.
7. **Create coding handoff**: Hand off to planning/TDD/coding only after the implementation proposal has a small, verifiable slice.

## Decision Gates

### Gate 1: Enough Research?

Continue research when key claims rely on one weak source, the paper has no reproducible details, or the open-source ecosystem is unclear.

Move forward when the paper analysis identifies a concrete mechanism and at least one plausible implementation route.

### Gate 2: Adopt, Adapt, Reject, Or Research More

Use this decision vocabulary:

- **Adopt**: Use an existing open-source solution with minimal changes.
- **Adapt**: Reuse concepts or code but modify for local constraints.
- **Reject**: The idea is not worth pursuing now.
- **Research More**: Important uncertainty blocks a responsible decision.

### Gate 3: Coding Handoff

Do not start coding until the implementation proposal states:

- target user or internal workflow
- exact MVP behavior
- files/modules likely touched
- validation command or success metric
- fallback or rollback plan

## Output Workspace

Use this structure for each research topic:

```text
docs/knowledge-base/research/YYYY-MM-DD-topic/
├── research-brief.md
├── paper-matrix.md
├── paper-notes/
├── open-source-candidates.md
├── business-fit.md
├── implementation-proposal.md
└── decision.md
```

If the repository has not adopted `docs/knowledge-base/` yet, create the same files under `docs/research/YYYY-MM-DD-topic/` and note the temporary location.

## Templates

Use the reference templates instead of inventing a new structure:

- `references/paper-analysis-template.md`
- `references/open-source-evaluation-template.md`
- `references/business-fit-template.md`
- `references/implementation-proposal-template.md`

Use `assets/research-workspace.example.md` as a compact example of the full research-to-coding trace.

## Handoff To Other Skills

- Use `inspiration-box` for early ideas that are not yet validated.
- Use `autoresearch-loop` when a candidate implementation needs eval-driven experiments.
- Use `knowledge-distill` after a conclusion is verified and reusable.
- Use `self-improvement` when the research process exposes repeated mistakes, failed assumptions, or user corrections.

## Guardrails

- Do not summarize papers without extracting engineering implications.
- Do not recommend an open-source project without checking license and maintenance health.
- Do not begin implementation from one paper alone unless the user explicitly accepts that risk.
- Do not treat “has GitHub stars” as sufficient evidence of fit.
- Do not skip the business fit step; technical novelty is not business value.
