# Skill Quality Rubric

Score each skill out of 100 points. The score is split into structure and effect dimensions.

## Structure Score: 60

| Dimension | Points | What To Check |
| --- | ---: | --- |
| Frontmatter | 8 | `name`, `description`, `triggers`, `version`, and supported tool metadata are valid and discoverable. |
| Workflow clarity | 15 | The skill has a clear sequence of actions with explicit start, decision, and stop points. |
| Edge cases | 10 | The skill explains what to do with ambiguous input, missing files, tool failures, unsupported contexts, or insufficient evidence. |
| User checkpoints | 7 | The skill asks for human confirmation before irreversible, subjective, or high-risk decisions. |
| Executability | 15 | Instructions are concrete enough for an agent to follow without inventing missing steps. |
| Reference paths | 5 | Every referenced file, script, asset, command, or directory exists or is clearly marked as future work. |

## Effect Score: 40

| Dimension | Points | What To Check |
| --- | ---: | --- |
| Architecture fit | 15 | The skill has the right boundaries, composes with adjacent skills, and avoids doing too much. |
| Real prompt output quality | 25 | Running realistic prompts with the skill improves output quality, consistency, or safety versus baseline. |

## Decision Rule

- `90-100`: Excellent. Keep only small targeted improvements.
- `80-89`: Strong. Improve the lowest dimension.
- `70-79`: Usable but risky. Run focused optimization.
- `<70`: Needs redesign or splitting before broad use.

Never keep a mutation that raises structure score while lowering real prompt output quality.
