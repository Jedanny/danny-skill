# Learning Closed Loop

This document explains the current learning-oriented skill design in `danny-skill`.

It is intended as a repo-friendly English overview for contributors, reviewers, and tool users who want a quick mental model of how the knowledge and learning skills fit together.

## Why This Exists

The repository already had good coverage for:

- capturing ideas
- distilling reusable knowledge
- recording mistakes and corrections
- turning research into implementation proposals

What it lacked was a complete learning loop:

- a way to pressure-test understanding before calling something "learned"
- a way to turn stable knowledge into retrieval practice
- a clearer path from errors and corrections back into durable knowledge

The current design closes those gaps.

## The Loop

The learning loop is:

```text
capture
-> interrogate
-> stabilize
-> retain
-> correct
-> re-distill
```

Mapped to repository skills:

```text
inspiration-box
-> socratic-learning
-> knowledge-distill
-> retrieval-and-spacing
-> self-improvement
-> knowledge-distill
```

## Skill Roles

### `inspiration-box`

Use this when the input is still raw:

- ideas
- intuitions
- questions
- possible directions

Its job is to capture and organize, not to prove correctness.

It now supports a `hypothesis` stage so an idea can become a testable claim before it moves deeper into the system.

### `socratic-learning`

Use this when the goal is genuine understanding rather than summarization.

It pressures a concept, article, framework, or method with:

- definition checks
- boundary checks
- nearby-concept comparison
- counterexamples
- causal explanation

The core question is not "can I repeat it?" but "can I explain what it is, what it is not, why it works, and where it fails?"

### `knowledge-distill`

Use this only after the material is sufficiently clear.

Its job is to turn tested understanding into reusable knowledge with:

- definition
- non-definition
- boundaries
- failure conditions
- evidence
- reusable rules

It is intentionally stricter than a note-taking tool. Raw impressions should not go directly into `distilled/`.

### `retrieval-and-spacing`

Use this after knowledge has become stable enough to practice.

Its job is to convert learned material into:

- retrieval questions
- spaced review prompts
- review cards

The emphasis is on active recall, not rereading.

### `self-improvement`

Use this when something failed, was corrected, or revealed a repeated rule.

It is the evidence layer of the loop, not the final truth layer.

It focuses on:

- the prior rule
- the evidence against it
- the revised rule
- the rule boundary
- the next verification step

Repeatedly validated corrections can later move back into `knowledge-distill`.

### `research-to-implementation`

This skill is adjacent to the loop, not the center of it.

Use it when the input is:

- papers
- technical reports
- open-source candidates
- implementation feasibility questions

It can feed the loop, especially through `socratic-learning` and `knowledge-distill`.

## Maturity Model

The repository uses two related but different models:

### Storage Model

```text
capture -> workspace -> evidence -> distilled
```

This is about where knowledge lives.

### Maturity Model

```text
raw -> hypothesis -> tested -> stable
```

This is about how trustworthy or mature the knowledge is.

Do not confuse storage layer with knowledge strength.

## Practical Guidance

Use the loop like this:

- Start with `inspiration-box` when the idea is still rough.
- Use `socratic-learning` when the next need is understanding.
- Use `knowledge-distill` when the content is clear enough to formalize.
- Use `retrieval-and-spacing` when the goal is retention and transfer.
- Use `self-improvement` when failure, correction, or contradiction changes the rule.

## Design Principles

The current design follows a few rules:

- each skill should do one job clearly
- raw capture should not be confused with stable knowledge
- summarization is not enough to count as understanding
- retrieval should begin from distilled knowledge, not from raw source material
- corrections should improve future behavior, not just record history

## What This Design Is Not

It is not:

- a single giant "learning-system" skill
- a philosophical essay
- a spaced repetition app
- a replacement for research or implementation planning

It is a composable repository-level workflow for knowledge work.

## Related Files

- `skills/inspiration-box/SKILL.md`
- `skills/socratic-learning/SKILL.md`
- `skills/knowledge-distill/SKILL.md`
- `skills/retrieval-and-spacing/SKILL.md`
- `skills/self-improvement/SKILL.md`
- `docs/knowledge-base/storage-model.md`
- `docs/superpowers/specs/2026-04-29-danny-skill-learning-closed-loop-design.md`

## Current Status

This document reflects the current repository design after the learning-loop upgrade.

If the skill boundaries or handoff rules change, this document should be updated together with:

- the relevant `SKILL.md`
- the corresponding `config.yaml`
- the generated README sections
- test expectations that depend on routing or discovery behavior
