# Autoresearch Eval Format

Use a small JSON file to define the optimization target, experiment budget, and eval cases.

## Top-Level Fields

```json
{
  "target": "skills/example/SKILL.md",
  "objective": "Improve trigger clarity",
  "metric": "pass_rate",
  "max_experiments": 5,
  "evals": []
}
```

- `target`: File being optimized.
- `objective`: Behavior or quality goal.
- `metric`: Primary decision metric.
- `max_experiments`: Maximum mutation attempts before stopping.
- `evals`: Rule or LLM eval cases.

## Rule Eval

Use rule evals for deterministic checks.

```json
{
  "name": "description_starts_with_use_when",
  "type": "rule",
  "rule": "regex",
  "path": "skills/example/SKILL.md",
  "expected": "^description: \"Use when"
}
```

Supported rules:

- `regex`: file content must match the regex.
- `contains`: file content must include the expected string.
- `not_contains`: file content must not include the expected string.
- `banned_phrases`: file content must not include any listed phrase.
- `word_count`: file content must fit min/max word limits.

## LLM Eval

Use LLM evals when the behavior requires judgment.

```json
{
  "name": "agent_runs_baseline_first",
  "type": "llm",
  "prompt": "Given this transcript, did the agent run baseline before editing?",
  "rubric": "Pass only if baseline was executed before mutation."
}
```

LLM evals should include a clear rubric and avoid hidden expectations. Keep them small enough to rerun often.

## Decision Rule

Keep a mutation only when:

1. The primary metric improves or all required evals pass.
2. No previously passing required eval regresses.
3. The mutation is smaller and clearer than the alternatives.

Otherwise revert the target file and record the failed hypothesis.
