# Coding Guardrails Examples

Adapted from `forrestchang/andrej-karpathy-skills` (MIT licensed).
Source: https://github.com/forrestchang/andrej-karpathy-skills

## Hidden assumptions

Bad:

```text
User asks for "add auth"; agent silently chooses OAuth, adds a new dependency, and changes routing.
```

Better:

```text
State the assumption: "I will add the existing session-token auth path because the repo already uses it."
```

## Over-abstraction

Bad:

```text
Create a plugin framework for one extra formatter.
```

Better:

```text
Add the formatter beside the existing formatter and extract only if a second real duplicate appears.
```

## Drive-by refactor

Bad:

```text
Fix one failing test and also rename unrelated helpers, reformat old files, and remove comments.
```

Better:

```text
Change only the failing path. Leave unrelated cleanup for a separate request.
```

## Vague goal vs verifiable goal

Bad:

```text
"Improve performance" with no baseline, no target, and no measurement.
```

Better:

```text
"Reduce command startup from 900ms to under 500ms; verify with scripts/bench-startup.sh."
```
