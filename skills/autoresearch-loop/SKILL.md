---
name: autoresearch-loop
description: Use when improving a skill, prompt, workflow, or agent behavior through repeated eval-driven experiments with keep-or-revert decisions
version: "1.0"
triggers: [autoresearch, eval, experiment, prompt-optimization, skill-optimization, benchmark, self-improvement]
tags: [autoresearch, evaluation, prompt-optimization, skills, self-improvement]
supported_tools: [claude-code, codex]
---

# Autoresearch Loop

## Purpose

Use an eval-driven research loop to improve a skill, prompt, workflow, or agent behavior. This is for measurable iteration, not general note taking or vague brainstorming.

The pattern is adapted from autoresearch-style prompt optimization: establish a baseline, run evals, make one mutation, retest, then keep-or-revert based on evidence.

Reference sources:

- Karpathy autoresearch: https://github.com/karpathy/autoresearch
- openclaw-autoresearch: https://github.com/zning1994/openclaw-autoresearch
- 花叔 methodology article: https://mp.weixin.qq.com/s/4ICQJGwa2MD616_oFmJb4w

## When To Use

- A skill or prompt behaves inconsistently across realistic tasks.
- A workflow needs measurable improvement instead of manual opinion edits.
- You can define pass/fail rules, benchmark scores, or a clear quality rubric.
- You need a repeatable experiment log before changing shared agent instructions.

Do not use this when there is no stable target file, no measurable eval, or no time budget for at least one baseline and one retest.

## Core Loop

1. **Select target**: Choose exactly one target, usually `skills/<name>/SKILL.md`, `prompts/<name>.md`, or `AGENTS.md`.
2. **Define eval**: Write or select eval cases before editing. See `references/eval-format.md`.
3. **Run baseline**: Execute the eval against the unchanged target and record results.
4. **Analyze failure**: Identify one specific behavior gap. Avoid broad rewrites.
5. **Make one mutation**: Change one instruction, example, trigger, or constraint.
6. **Retest**: Run the same eval set.
7. **Keep-or-revert**: Keep only if the metric improves without regressions. Revert otherwise.
8. **Write changelog**: Record hypothesis, mutation, metric delta, and decision.
9. **Repeat within budget**: Stop at `max_experiments`, clean pass, or no useful next mutation.

## Eval Types

Use **rule evals** for deterministic checks:

- `regex`
- `contains`
- `not_contains`
- `banned_phrases`
- `word_count`

Use **LLM evals** for judgment:

- Did the agent follow baseline-first discipline?
- Did it use the right skill?
- Did it avoid unsupported claims?
- Did it preserve the required output format?

Start with rule evals whenever possible. Add LLM evals only when behavior cannot be checked deterministically.

## Skill Quality Ratchet

Use this mode when the target is a `SKILL.md` file or a collection of skills.

Phases:

1. **Inventory**: List target skills and validate referenced files exist.
2. **Baseline score**: Score each skill before edits using `references/skill-quality-rubric.md`.
3. **Pick weakest dimension**: Optimize only the lowest-scoring dimension for the current skill.
4. **Single-asset mutation**: Edit only one `SKILL.md` per experiment.
5. **Independent evaluation**: A separate evaluator scores the candidate using `references/evaluator-protocol.md`.
6. **Human in the loop**: Show diff, score delta, eval output, and risk notes using `references/hitl-review-template.md`.
7. **Keep-or-revert**: Keep only confirmed improvements; revert non-improvements.
8. **Summary**: Produce a before/after table for all optimized skills.

Limits:

- Optimize at most one skill per active experiment.
- Run at most three mutation rounds per skill unless the user explicitly raises the budget.
- Do not let the modifying agent be the only scoring agent.
- Prefer real prompt output quality over paper-perfect formatting.

## Experiment Log

Store logs under:

```text
docs/knowledge-base/project/experiments/autoresearch/<target-name>/
├── results.tsv
└── changelog.md
```

`results.tsv` columns:

```text
timestamp	experiment	target	metric	baseline	candidate	decision	notes
```

`changelog.md` entry:

```markdown
## YYYY-MM-DD experiment-name

- Target: skills/example/SKILL.md
- Objective: what behavior should improve
- Baseline: score or failures before mutation
- Mutation: exact change made
- Candidate: score or failures after mutation
- Decision: keep | revert
- Notes: why the result matters
```

## Guardrails

- No baseline, no mutation.
- No eval, no optimization claim.
- One mutation per experiment.
- Do not edit unrelated files during an experiment.
- Do not keep changes that improve one eval while breaking another required eval.
- If an eval is flawed, fix the eval first, rerun baseline, then continue.
- Commit kept mutations separately from eval/log changes when practical.

## Handoff To Other Skills

- Use `self-improvement` to record repeated failure modes or user corrections.
- Use `knowledge-distill` to turn stable discoveries into team knowledge.
- Use `design-style` when the optimization target is UI visual output quality.
