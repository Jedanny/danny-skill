# Evaluator Protocol

Use a separate independent evaluator for skill quality scoring. The evaluator must not be the same agent that made the mutation.

## Inputs

Provide only the evaluation materials needed:

- Target skill path
- Baseline `SKILL.md`
- Candidate `SKILL.md`
- Diff
- `skill-quality-rubric.md`
- Test prompts and outputs, if available
- Any failed rule evals

Avoid passing the modifying agent's rationale unless it is required to understand the diff.

## Required Output

```markdown
# Skill Quality Evaluation

## Scores
| Dimension | Before score | After score | Delta | Notes |
| --- | ---: | ---: | ---: | --- |

## Total
- Before score:
- After score:
- Delta:

## Regression Check
- New ambiguity:
- Lost behavior:
- Broken references:
- Worse prompt output:

## Recommendation
Keep | Revert | Revise and rerun

## Rationale
<short evidence-based explanation>
```

## Independence Rules

- The independent evaluator scores evidence, not intent.
- The evaluator should penalize missing files, fake references, and untested claims.
- If real prompt outputs are unavailable, the evaluator must say the effect score is provisional.
- The evaluator cannot approve a mutation that lacks a baseline.
