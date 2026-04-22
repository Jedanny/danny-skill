# Design Style Capability Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade `design-style` from a brand-style index into a reusable design workflow skill with scene templates, critique guidance, and regression prompts.

**Architecture:** Keep `skills/design-style/` as the single canonical asset bundle. Expand the skill in-place with lightweight `references/` and `assets/` that improve generation quality without introducing new runtime dependencies or broad CLI changes. Use Jest coverage to lock the new assets into repository and packaging expectations.

**Tech Stack:** Markdown, JSON, pnpm, Jest, ts-jest, existing Rust/JS CLI packaging behavior.

---

## Commit Guidance

Each task includes a short commit intent line. When committing in this repository, expand it with the Lore commit trailers required by `AGENTS.md`, including at least `Confidence:`, `Scope-risk:`, `Tested:`, and `Not-tested:` where useful.

---

## Scope Guard

This plan covers only the first-phase `design-style` upgrade:

- Rewrite the skill workflow.
- Add `scene-templates`, `critique-guide`, `style-selection-guide`, `output-checklist`, and `test-prompts`.
- Update documentation and tests so the new assets are validated and shipped in the expected install profiles.

This plan does **not** include:

- New CLI commands such as `design-style validate`.
- LLM-based automated design scoring.
- Generic skill-productization infrastructure for every skill.
- Any changes to `scripts/install.sh` or `packages/cli/src/lib.rs` packaging logic unless a failing test proves current behavior is insufficient.

---

## File Structure Map

- `skills/design-style/SKILL.md`: primary workflow contract for style selection and generation.
- `skills/design-style/references/designs/*/DESIGN.md`: existing 58-brand reference corpus; keep unchanged in this phase.
- `skills/design-style/references/style-selection-guide.md`: new guide for mapping user intent to style families.
- `skills/design-style/references/scene-templates.md`: new scene-specific scaffolds for common design outputs.
- `skills/design-style/references/critique-guide.md`: new structured review rubric for generated outputs.
- `skills/design-style/assets/output-checklist.md`: short post-generation self-check.
- `skills/design-style/assets/test-prompts.json`: regression prompt suite for future `autoresearch-loop` and manual spot checks.
- `README.md`: top-level skill description and reference-source table.
- `tests/skills-schema.test.ts`: repository assertions for `design-style` bundled assets.
- `tests/cli.test.ts`: packaging/install-profile assertions for new `design-style` assets.

---

### Task 1: Lock the Upgraded Design-Style Shape With Tests

**Files:**
- Modify: `tests/skills-schema.test.ts`
- Modify: `tests/cli.test.ts`

- [ ] **Step 1: Extend the repository-level `design-style` asset test**

Update `tests/skills-schema.test.ts` so the existing `design-style bundles its visual preview and design references` test also asserts these files exist:

```ts
expect(existsSync(join(designStyleDir, 'references', 'style-selection-guide.md'))).toBe(true);
expect(existsSync(join(designStyleDir, 'references', 'scene-templates.md'))).toBe(true);
expect(existsSync(join(designStyleDir, 'references', 'critique-guide.md'))).toBe(true);
expect(existsSync(join(designStyleDir, 'assets', 'output-checklist.md'))).toBe(true);
expect(existsSync(join(designStyleDir, 'assets', 'test-prompts.json'))).toBe(true);
```

- [ ] **Step 2: Add failing install-profile assertions for the new assets**

Update `tests/cli.test.ts`:

- In the `minimal` profile test, assert these files do **not** exist:

```ts
expect(existsSync(join(skillDir, 'assets', 'test-prompts.json'))).toBe(false);
expect(existsSync(join(skillDir, 'references', 'scene-templates.md'))).toBe(false);
```

- In the `standard` profile test, assert these files **do** exist while the large design bundle remains excluded:

```ts
expect(existsSync(join(root, '.agents', 'skills', 'design-style', 'references', 'scene-templates.md'))).toBe(true);
expect(existsSync(join(root, '.agents', 'skills', 'design-style', 'references', 'critique-guide.md'))).toBe(true);
expect(existsSync(join(root, '.agents', 'skills', 'design-style', 'assets', 'test-prompts.json'))).toBe(true);
expect(existsSync(join(root, '.agents', 'skills', 'design-style', 'references', 'designs'))).toBe(false);
```

- In the `full` profile test, assert the new files and the existing `references/designs` directory are all present.

- [ ] **Step 3: Run the focused test file and verify it fails for the right reason**

Run: `pnpm test -- tests/skills-schema.test.ts tests/cli.test.ts`

Expected: failures only because the new `design-style` files do not exist yet.

- [ ] **Step 4: Commit the test lock**

```bash
git add tests/skills-schema.test.ts tests/cli.test.ts
git commit -m "Lock design-style capability bundle shape"
```

---

### Task 2: Rewrite `design-style` as a Workflow Skill

**Files:**
- Modify: `skills/design-style/SKILL.md`

- [ ] **Step 1: Replace the current “index/catalog” framing with a four-step workflow**

Restructure `skills/design-style/SKILL.md` around:

1. `选择风格`
2. `选择场景模板`
3. `生成设计`
4. `使用 critique-guide 复评`

Keep the current progressive-loading explanation, but remove any implication that the skill stops at “extract tokens from DESIGN.md”.

- [ ] **Step 2: Keep the existing brand corpus, but narrow the skill’s promises**

Edit the body so it explicitly states:

- The 58 design references are inspiration inputs, not official design systems.
- The skill should choose the smallest relevant subset of references.
- Scene template selection comes before generation.
- Generation should end with checklist + critique, not with first-pass code output.

- [ ] **Step 3: Remove stale command claims that are not implemented**

Delete or rewrite the current “CLI 工具” section if it implies commands that do not exist, such as:

```md
design-style list
design-style get vercel
design-style preview
design-style validate
```

Replace that section with repository-realistic guidance, for example:

- open `assets/preview.html` for browsing
- read `references/style-selection-guide.md` for mapping intent to style
- read `references/scene-templates.md` before generating
- run the prompt suite in `assets/test-prompts.json` for manual regression checks

- [ ] **Step 4: Add explicit handoff rules between the new assets**

Add a short “资源使用顺序” section such as:

```md
1. 不明确风格 -> 先读 `references/style-selection-guide.md`
2. 不明确输出形态 -> 再读 `references/scene-templates.md`
3. 生成完成 -> 用 `assets/output-checklist.md` 自查
4. 需要复盘或比较方案 -> 用 `references/critique-guide.md`
```

- [ ] **Step 5: Run the focused test file and verify the skill still satisfies schema constraints**

Run: `pnpm test -- tests/skills-schema.test.ts`

Expected: no frontmatter regressions; only missing-file assertions should remain, if any.

- [ ] **Step 6: Commit the workflow rewrite**

```bash
git add skills/design-style/SKILL.md
git commit -m "Turn design-style into a workflow skill"
```

---

### Task 3: Add the New Design-Style Reference and Asset Bundle

**Files:**
- Create: `skills/design-style/references/style-selection-guide.md`
- Create: `skills/design-style/references/scene-templates.md`
- Create: `skills/design-style/references/critique-guide.md`
- Create: `skills/design-style/assets/output-checklist.md`
- Create: `skills/design-style/assets/test-prompts.json`

- [ ] **Step 1: Write `style-selection-guide.md`**

Create a compact mapping from design intent to reference families. Organize by user outcome rather than industry label. Include at least these buckets:

- `developer credibility`
- `consumer warmth`
- `premium minimalism`
- `playful creativity`
- `enterprise trust`

For each bucket, list:

- `适用场景`
- `推荐品牌`
- `避免误用`
- `默认组合策略`

- [ ] **Step 2: Write `scene-templates.md`**

Create five scene templates:

- `landing page`
- `product page`
- `dashboard`
- `mobile app screen`
- `presentation / one-pager`

For each template, include:

- goal
- required sections
- optional sections
- information-density rules
- component guidance
- anti-slop warnings

- [ ] **Step 3: Write `critique-guide.md`**

Create a five-dimension review rubric:

- `风格一致性`
- `视觉层级`
- `信息密度`
- `组件细节`
- `品牌辨识度`

For each dimension, include:

- what to inspect
- common failure modes
- revision guidance

End the document with a short verdict template:

```md
## Verdict
- Keep:
- Fix:
- Re-test:
```

- [ ] **Step 4: Write `output-checklist.md`**

Create a short post-generation checklist with yes/no checks such as:

- one dominant visual direction
- no mixed brand signals
- section order fits the chosen scene
- typography hierarchy is obvious
- CTA style is consistent

Keep it short enough to be usable inline by an agent.

- [ ] **Step 5: Write `test-prompts.json`**

Create a small JSON array or object-based suite with 10-15 prompts covering:

- direct brand match
- style-only request
- scene-specific request
- ambiguous request needing style selection
- failure-prone request that should avoid over-mixing references

Use a structure that is readable and future-proof, for example:

```json
{
  "prompts": [
    {
      "id": "landing-vercel-devtools",
      "category": "brand-plus-scene",
      "prompt": "Create a developer tools landing page with a Vercel-like style.",
      "checks": ["uses scene template", "keeps developer-focused hierarchy"]
    }
  ]
}
```

- [ ] **Step 6: Run the focused test file and verify the new assets satisfy the failing assertions**

Run: `pnpm test -- tests/skills-schema.test.ts tests/cli.test.ts`

Expected: repository and packaging assertions for the new files now pass, assuming no README gaps remain.

- [ ] **Step 7: Commit the asset bundle**

```bash
git add skills/design-style/references skills/design-style/assets
git commit -m "Add design-style workflow assets"
```

---

### Task 4: Align Top-Level Documentation With the Upgraded Skill

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Update the `design-style` row in the skill tables**

Adjust `README.md` wherever it currently describes `design-style` as only “参考 58 套网站设计系统生成 UI 风格”. Replace it with language that reflects:

- style selection
- scene templates
- critique/review guidance
- bundled prompt suite

- [ ] **Step 2: Update the skill capability boundary section**

In the `技能能力边界` table, revise the `design-style` row so the `主要产物` mentions:

- `references/designs/`
- `references/style-selection-guide.md`
- `references/scene-templates.md`
- `references/critique-guide.md`
- `assets/output-checklist.md`
- `assets/test-prompts.json`

- [ ] **Step 3: Record the external reference source centrally**

In the `## 参考来源` table, add the `huashu-design` repository as a source for `design-style` evolution while keeping URLs centralized in `README.md`, not in the skill body.

- [ ] **Step 4: Run the schema/readme tests that depend on centralized references**

Run: `pnpm test -- tests/skills-schema.test.ts tests/repo-layout.test.ts`

Expected: README reference-source assertions still pass and the skill body still contains no direct URLs.

- [ ] **Step 5: Commit the documentation update**

```bash
git add README.md
git commit -m "Document upgraded design-style workflow"
```

---

### Task 5: Run Full Verification and Package-Profile Spot Checks

**Files:**
- Modify: none

- [ ] **Step 1: Run the full repository test suite**

Run: `pnpm test`

Expected: all Jest suites pass.

- [ ] **Step 2: Run TypeScript no-emit check if any test code changed shape materially**

Run: `pnpm exec tsc --noEmit`

Expected: no type errors.

- [ ] **Step 3: Run targeted CLI install-profile spot checks in a temp root**

Run:

```bash
node packages/cli/danny-skill.mjs install --tool codex --scope project --profile minimal --target-root /tmp/ds-min --mode copy
node packages/cli/danny-skill.mjs install --tool codex --scope project --profile standard --target-root /tmp/ds-std --mode copy
node packages/cli/danny-skill.mjs install --tool codex --scope project --profile full --target-root /tmp/ds-full --mode copy
```

Then verify:

- `minimal`: `SKILL.md` exists, new `references/*.md` and `assets/test-prompts.json` do not
- `standard`: new lightweight `references/*.md` and `assets/*.md/json` exist, `references/designs/` does not
- `full`: all of the above exist, including `references/designs/`

- [ ] **Step 4: Perform three manual prompt spot checks**

Use three prompts from `skills/design-style/assets/test-prompts.json`:

- one direct-brand prompt
- one style-only ambiguous prompt
- one scene-specific prompt

For each result, verify manually that the output:

- chooses a style explicitly
- applies a scene template
- can be critiqued with the new rubric

- [ ] **Step 5: Commit the final verified state**

```bash
git add skills tests README.md
git commit -m "Ship design-style capability upgrade"
```

---

## Execution Notes

- Prefer deletion or tightening of misleading copy over adding more prose.
- Do not modify the 58 `references/designs/*` files in this phase.
- Do not add new dependencies.
- If any packaging test unexpectedly fails because the current CLI excludes new lightweight assets, then and only then add a follow-up plan for `packages/cli/src/lib.rs` and `tests/cli.test.ts`.

## Success Criteria

- `design-style` documents a workflow, not just a catalog.
- The new guides and prompt suite exist and are covered by tests.
- `minimal`, `standard`, and `full` install profiles behave as intended for the new files.
- README accurately describes the upgraded skill and centralized sources.
