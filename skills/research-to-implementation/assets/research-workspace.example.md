# Research Workspace Example

## Research Brief
- Business problem: reduce manual review time for generated UI prototypes.
- Target metric: reviewer time per prototype.
- Constraint: must work inside existing Claude Code/Codex workflow.
- Non-goal: training a custom model.

## Paper Matrix
| Paper | Core idea | Code | Fit | Decision |
| --- | --- | --- | --- | --- |
| Example paper | preference-guided generation | yes | medium | Adapt |

## Open Source Candidates
| Repo | License | Health | Integration cost | Decision |
| --- | --- | --- | --- | --- |
| example/repo | MIT | active | medium | Research More |

## Business Fit
- Candidate workflow: use design-style references to constrain prototype generation.
- MVP: add eval prompts that score visual consistency against selected design systems.

## Implementation Proposal
- First slice: add an eval file for one design system and run autoresearch-loop against prompt wording.
- Handoff: use autoresearch-loop before coding a full CLI runner.
