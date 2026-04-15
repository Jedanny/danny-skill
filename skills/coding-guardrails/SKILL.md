---
name: coding-guardrails
description: Use when writing, fixing, refactoring, or reviewing code where assumptions, scope creep, overengineering, or unverifiable changes could cause avoidable mistakes
version: "1.0"
triggers: [coding, refactor, bugfix, simplify, assumptions, verification, surgical-change, overengineering]
tags: [coding, quality, refactoring, verification, simplicity]
supported_tools: [claude-code, codex, cursor]
---

# Coding Guardrails

## Purpose

Reduce common coding-agent mistakes during implementation, debugging, refactoring, and review. Use this skill as a compact behavioral guardrail before changing code.

Adapted from the principles in `forrestchang/andrej-karpathy-skills`. See `references/examples.md` for examples and source attribution.

## Core Rules

### 1. Think Before Coding

- Identify the actual goal before editing.
- Surface assumptions when scope is ambiguous.
- Ask only when ambiguity blocks safe progress; otherwise state the assumption and proceed.
- For bugs, reproduce or identify the failing behavior before fixing when practical.

### 2. Simplicity First

- Prefer the smallest implementation that satisfies the request.
- Avoid speculative features, configuration knobs, and one-use abstractions.
- Reuse existing project patterns before inventing a new layer.
- If a simpler design solves the problem, choose it.

### 3. Surgical Changes

- Touch only files and lines required by the task.
- Do not perform drive-by refactors.
- Preserve comments, naming, and formatting unless they are part of the issue.
- Every changed line should map to the user request, a failing test, or a documented verification need.

### 4. Goal-Driven Execution

- Define what completion means before claiming completion.
- Run targeted tests for the changed behavior.
- Run broader verification when touching shared behavior.
- Report evidence, not confidence theater.

## When To Ask

Ask a concise question when:

- The request has multiple plausible product meanings.
- Security, privacy, data deletion, or irreversible behavior is unclear.
- The change would broaden scope beyond the requested task.
- Required credentials, files, or environment are unavailable.

Do not ask for obvious reversible next steps.

## Checklists

### Before Editing

- What is the smallest useful change?
- What existing pattern should be followed?
- What will prove the change works?
- What should remain untouched?

### Before Final Response

- Relevant tests or diagnostics were run.
- No unrelated files were modified.
- No temporary debug code remains.
- Known gaps are stated clearly.

## Integration

- Use `research-to-implementation` before coding when the task starts from papers, open-source options, or feasibility analysis.
- Use `autoresearch-loop` when the code or prompt needs measurable iterative optimization.
- Use `self-improvement` when a mistake or user correction reveals a repeated failure mode.
