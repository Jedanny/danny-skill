# HITL Review Template

Use this template when a mutation changes shared skill behavior.

```markdown
# HITL Review: <skill-name>

## Summary
- Target:
- Objective:
- Before score:
- After score:
- Delta:
- Recommendation: Keep | Revert | Revise and rerun

## Changed Files
- <file>

## Diff Summary
- <what changed>

## Eval Output
- Rule evals:
- LLM evals:
- Real prompt outputs:

## Risks
- Behavior regressions:
- Missing references:
- Ambiguous instructions:
- Tool/path assumptions:

## Human Decision
- [ ] Keep
- [ ] Revert
- [ ] Revise and rerun

## Notes
<human reviewer notes>
```

Do not continue to the next skill until the human decision is recorded.
