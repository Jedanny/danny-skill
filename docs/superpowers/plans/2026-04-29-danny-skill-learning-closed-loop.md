# danny-skill Learning Closed Loop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a complete learning closed loop to danny-skill by introducing `socratic-learning` and `retrieval-and-spacing`, upgrading the existing knowledge skills, and syncing README plus tests to the new capability model.

**Architecture:** Keep the existing skill-library-first structure. Add two new focused skills for understanding and retention, strengthen three existing skills so they align with the new loop, and update the README generation path so discovery, boundaries, and sequencing stay consistent with the new system.

**Tech Stack:** Markdown skills, YAML manifests, Node.js README generator, Jest, TypeScript test suite

---

## File Structure Plan

### New files

- `skills/socratic-learning/SKILL.md`
- `skills/socratic-learning/config.yaml`
- `skills/retrieval-and-spacing/SKILL.md`
- `skills/retrieval-and-spacing/config.yaml`

### Modified files

- `skills/knowledge-distill/SKILL.md`
- `skills/knowledge-distill/config.yaml`
- `skills/self-improvement/SKILL.md`
- `skills/self-improvement/config.yaml`
- `skills/inspiration-box/SKILL.md`
- `skills/inspiration-box/config.yaml`
- `README.md`
- `tools/generate-readme-skill-table.mjs`
- `tests/repo-layout.test.ts`

### Verification surface

- `tests/skills-schema.test.ts`
- `tests/repo-layout.test.ts`
- generated README sections in `README.md`

### Responsibility boundaries

- Each `SKILL.md` owns workflow, constraints, templates, and storage guidance.
- Each `config.yaml` owns packaging, validation, docs summaries, and ability-table metadata.
- `tools/generate-readme-skill-table.mjs` owns ordering and generated table rendering.
- `README.md` owns high-level learning-loop documentation plus generated skill tables.
- `tests/repo-layout.test.ts` owns repo-level contract assertions for the learning-loop docs.

---

### Task 1: Scaffold `socratic-learning`

**Files:**
- Create: `skills/socratic-learning/SKILL.md`
- Create: `skills/socratic-learning/config.yaml`
- Test: `tests/skills-schema.test.ts`

- [ ] **Step 1: Write the failing schema expectation indirectly by creating the new skill directory skeleton**

Create:
```text
skills/socratic-learning/
├── SKILL.md
└── config.yaml
```

- [ ] **Step 2: Write `skills/socratic-learning/SKILL.md` with required frontmatter and the agreed workflow**

Include:
- frontmatter with `name`, `description`, `trigger`, `triggers`, `version`, `domain`, `tags`, `supported_tools`
- purpose and use cases
- core principles
- five-step flow
- `Socratic Stress Test` template
- hard guardrails

Expected critical strings:
```text
Use when learning a concept, article, framework, or method
/danny-understand
### Socratic Stress Test
### 当前理解
### 重建解释
### 下一步
```

- [ ] **Step 3: Write `skills/socratic-learning/config.yaml` with the standard manifest skeleton**

Include:
```yaml
version: 1
runtime.kind: "interrogate"
packaging.minimal.include: ["SKILL.md", "config.yaml"]
packaging.standard.include: ["SKILL.md", "config.yaml"]
packaging.full.include: ["**"]
validation.required_files:
  - "SKILL.md"
  - "config.yaml"
validation.markdown_contracts[0].must_contain:
  - "### 当前理解"
  - "### Socratic Stress Test"
  - "### 重建解释"
  - "### 下一步"
docs.summary: "概念理解压测"
docs.handles: "学懂概念、框架、文章、方法"
docs.not_for: "直接替代长期知识归档或研究报告"
```

- [ ] **Step 4: Run the schema test subset**

Run:
```bash
pnpm test -- --runTestsByPath tests/skills-schema.test.ts
```

Expected:
```text
PASS tests/skills-schema.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add skills/socratic-learning/SKILL.md skills/socratic-learning/config.yaml
git commit -m "Add a dedicated Socratic learning skill for concept interrogation"
```

---

### Task 2: Upgrade `knowledge-distill` for concept pressure-testing

**Files:**
- Modify: `skills/knowledge-distill/SKILL.md`
- Modify: `skills/knowledge-distill/config.yaml`
- Test: `tests/skills-schema.test.ts`

- [ ] **Step 1: Write a failing contract mentally by choosing the new required content before editing**

Required additions:
- `Distillation Gates`
- `Concept Gate`
- `Practice Gate`
- `Decision Gate`
- strength dimension
- fields for definition, non-definition, boundaries, evidence, and failure conditions

- [ ] **Step 2: Update `skills/knowledge-distill/SKILL.md` with the new gates and stronger template**

Add:
```text
## Distillation Gates
### Concept Gate
### Practice Gate
### Decision Gate
**强度**: tentative | tested | stable
### 一句话定义
### 它不是什么
### 相邻概念区分
### 为什么成立
### 适用边界
### 反例 / 失败条件
### 来源证据
### 可复用规则
```

- [ ] **Step 3: Update `skills/knowledge-distill/config.yaml` validation and docs metadata**

Adjust:
- `runtime.kind` remains `distill`
- `validation.markdown_contracts` must include the new gate strings
- `docs.handles` reflects “从讨论、学习和研究中提炼经过压力测试的知识”
- `docs.not_for` explicitly rejects untested raw notes
- `docs.artifacts` remain under `.danny/knowledge-base/distilled/`

- [ ] **Step 4: Run the schema test subset**

Run:
```bash
pnpm test -- --runTestsByPath tests/skills-schema.test.ts
```

Expected:
```text
PASS tests/skills-schema.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add skills/knowledge-distill/SKILL.md skills/knowledge-distill/config.yaml
git commit -m "Strengthen knowledge distillation with gates and evidence boundaries"
```

---

### Task 3: Upgrade `self-improvement` into a falsification-oriented learning recorder

**Files:**
- Modify: `skills/self-improvement/SKILL.md`
- Modify: `skills/self-improvement/config.yaml`
- Test: `tests/skills-schema.test.ts`

- [ ] **Step 1: Add the new falsification structure to the skill document**

Required additions:
```text
## Falsification Loop
### Prior Rule
### Disconfirming Evidence
### Revised Rule
### Boundary
### Verification Plan
```

- [ ] **Step 2: Tighten the application rules in `skills/self-improvement/SKILL.md`**

Make sure the prose says:
- this skill records evidence-level corrections
- single events do not automatically become stable truth
- repeated corrections can later flow into `knowledge-distill`

- [ ] **Step 3: Update `skills/self-improvement/config.yaml`**

Adjust:
- `docs.handles` to mention rule correction and boundary repair
- `docs.not_for` to keep “general knowledge整理” out
- `validation.markdown_contracts` to require `Falsification Loop` and the new fields

- [ ] **Step 4: Run the schema test subset**

Run:
```bash
pnpm test -- --runTestsByPath tests/skills-schema.test.ts
```

Expected:
```text
PASS tests/skills-schema.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add skills/self-improvement/SKILL.md skills/self-improvement/config.yaml
git commit -m "Turn self-improvement into a falsification-oriented correction loop"
```

---

### Task 4: Scaffold `retrieval-and-spacing`

**Files:**
- Create: `skills/retrieval-and-spacing/SKILL.md`
- Create: `skills/retrieval-and-spacing/config.yaml`
- Test: `tests/skills-schema.test.ts`

- [ ] **Step 1: Create the new skill directory skeleton**

Create:
```text
skills/retrieval-and-spacing/
├── SKILL.md
└── config.yaml
```

- [ ] **Step 2: Write `skills/retrieval-and-spacing/SKILL.md`**

Include:
- retrieval-first principles
- card types
- review cadence
- generation rules
- failure handling rules

Expected critical strings:
```text
Use when turning learned knowledge into retrieval questions
/danny-review
## Card
**Type**: definition | contrast | boundary | mechanism | application
D+1
D+3
D+7
D+14
```

- [ ] **Step 3: Write `skills/retrieval-and-spacing/config.yaml`**

Include:
```yaml
version: 1
runtime.kind: "retain"
validation.required_files:
  - "SKILL.md"
  - "config.yaml"
validation.markdown_contracts[0].must_contain:
  - "## Card"
  - "### 1. Definition"
  - "### 2. Contrast"
  - "### 3. Boundary"
  - "### 4. Mechanism"
  - "### 5. Application"
docs.summary: "检索练习与间隔复习"
docs.handles: "把已蒸馏知识转成 review cards 和复习提示"
docs.not_for: "原始材料总结、知识真实性判断"
```

- [ ] **Step 4: Run the schema test subset**

Run:
```bash
pnpm test -- --runTestsByPath tests/skills-schema.test.ts
```

Expected:
```text
PASS tests/skills-schema.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add skills/retrieval-and-spacing/SKILL.md skills/retrieval-and-spacing/config.yaml
git commit -m "Add a retrieval-and-spacing skill for memory reinforcement"
```

---

### Task 5: Upgrade `inspiration-box` to support hypotheses

**Files:**
- Modify: `skills/inspiration-box/SKILL.md`
- Modify: `skills/inspiration-box/config.yaml`
- Test: `tests/skills-schema.test.ts`

- [ ] **Step 1: Update the status model in `skills/inspiration-box/SKILL.md`**

Change the lifecycle to include:
```text
raw -> tagged -> hypothesis -> developed -> archived
```

- [ ] **Step 2: Add the hypothesis template and handoff wording**

Required additions:
```text
### Hypothesis
### Why this may be true
### Alternative explanations
### Smallest useful test
```

Also say that hypothesis-stage ideas can flow into `socratic-learning` or `research-to-implementation`.

- [ ] **Step 3: Update `skills/inspiration-box/config.yaml`**

Adjust:
- `docs.handles` to include “可验证假设”
- `validation.markdown_contracts` to require `hypothesis`
- keep artifacts under `.danny/knowledge-base/inbox/inspiration/` and `.danny/knowledge-base/ideas/`

- [ ] **Step 4: Run the schema test subset**

Run:
```bash
pnpm test -- --runTestsByPath tests/skills-schema.test.ts
```

Expected:
```text
PASS tests/skills-schema.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add skills/inspiration-box/SKILL.md skills/inspiration-box/config.yaml
git commit -m "Let inspiration-box promote raw ideas into testable hypotheses"
```

---

### Task 6: Update README generation order and learning-loop documentation

**Files:**
- Modify: `tools/generate-readme-skill-table.mjs`
- Modify: `README.md`
- Test: `tests/repo-layout.test.ts`

- [ ] **Step 1: Update `tools/generate-readme-skill-table.mjs` preferred ordering**

Insert the new skills so the conceptual order is:
```js
[
  'using-danny',
  'inspiration-box',
  'socratic-learning',
  'knowledge-distill',
  'retrieval-and-spacing',
  'self-improvement',
  'design-style',
  'autoresearch-loop',
  'research-to-implementation',
  'coding-guardrails',
]
```

- [ ] **Step 2: Add the learning-loop overview prose to `README.md`**

Add a section that explains:
- capture
- interrogate
- stabilize
- retain
- correct
- re-distill

And include the explicit chain:
```text
inspiration-box
-> socratic-learning
-> knowledge-distill
-> retrieval-and-spacing
-> self-improvement
-> knowledge-distill
```

- [ ] **Step 3: Regenerate the README tables**

Run:
```bash
node tools/generate-readme-skill-table.mjs
```

Expected:
```text
Updated /.../README.md
```

- [ ] **Step 4: Add or update repo-level assertions in `tests/repo-layout.test.ts`**

Assert that `README.md` contains:
```text
学习与知识闭环
socratic-learning
retrieval-and-spacing
capture：记录原始想法、问题、材料和直觉
```

- [ ] **Step 5: Run focused verification**

Run:
```bash
pnpm test -- --runTestsByPath tests/repo-layout.test.ts tests/skills-schema.test.ts
```

Expected:
```text
PASS tests/repo-layout.test.ts
PASS tests/skills-schema.test.ts
```

- [ ] **Step 6: Commit**

```bash
git add tools/generate-readme-skill-table.mjs README.md tests/repo-layout.test.ts
git commit -m "Document and order the new learning closed loop"
```

---

### Task 7: Run full verification and prepare handoff

**Files:**
- Test: `tests/skills-schema.test.ts`
- Test: `tests/repo-layout.test.ts`
- Test: `README.md` generated sections

- [ ] **Step 1: Run the full test suite**

Run:
```bash
pnpm test
```

Expected:
```text
All relevant test suites pass, including skills schema and repo layout checks
```

- [ ] **Step 2: Run TypeScript verification**

Run:
```bash
pnpm exec tsc --noEmit
```

Expected:
```text
Exit code 0
```

- [ ] **Step 3: Verify README tables are up to date**

Run:
```bash
node tools/generate-readme-skill-table.mjs --check
```

Expected:
```text
README skill table is up to date
```

- [ ] **Step 4: Review the diff for scope discipline**

Run:
```bash
git diff -- skills README.md tools/generate-readme-skill-table.mjs tests/repo-layout.test.ts
```

Confirm:
- only the planned skills changed
- README changes are limited to the learning-loop section plus generated table updates
- no unrelated files were touched

- [ ] **Step 5: Final commit**

```bash
git add skills README.md tools/generate-readme-skill-table.mjs tests/repo-layout.test.ts
git commit -m "Complete the learning closed loop across skills, docs, and validation"
```

---

## Notes for the Implementer

- Keep the new skills minimal: only `SKILL.md` and `config.yaml` unless a concrete need for references emerges during implementation.
- Preserve the current project convention that `description` starts with `Use when`.
- Do not forget the manifest `docs.*` fields; the ability boundary table depends on them.
- Do not manually edit the generated README skill tables after changing skill manifests. Always regenerate via `node tools/generate-readme-skill-table.mjs`.
- Keep the learning-loop wording consistent with the spec file:
  - `docs/superpowers/specs/2026-04-29-danny-skill-learning-closed-loop-design.md`
