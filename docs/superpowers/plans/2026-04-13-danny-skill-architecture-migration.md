# danny-skill Architecture Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate danny-skill into a skill-library-first repository with clear multi-tool distribution boundaries and a reserved CLI path.

**Architecture:** Keep `skills/` as the canonical source of skill content. Replace stale adapter-oriented tests and TypeScript config with asset-library validation, then align install docs, contributor docs, and scripts around Claude Code, Codex, Cursor, and OpenCode distribution.

**Tech Stack:** pnpm, Node ESM, Jest, ts-jest, Bash, Markdown, JSON.

---

## Commit Guidance

Each task includes a short commit intent line. When committing in this repository, expand it with the Lore commit trailers required by `AGENTS.md`, including at least `Confidence:`, `Scope-risk:`, `Tested:`, and `Not-tested:` where useful.

---

## File Structure Map

- `skills/*/SKILL.md`: canonical skill definitions; tests validate frontmatter and naming.
- `tests/helpers/frontmatter.ts`: small test-only parser for YAML-like frontmatter.
- `tests/skills-schema.test.ts`: validates skill directory and frontmatter conventions.
- `tests/plugin-manifest.test.ts`: validates plugin metadata files.
- `tests/repo-layout.test.ts`: prevents old `assets/`, `adapters/`, and `lib/schema.ts` architecture from returning.
- `tests/install-script.test.ts`: verifies installer behavior against temporary target roots.
- `scripts/install.sh`: supports safe tool selection, dry-run, and test target root.
- `scripts/detect-tools.sh`: detects supported tools consistently.
- `README.md`, `AGENTS.md`, `CLAUDE.md`: document the skill-library-first model.
- `.codex/INSTALL.md`, `.opencode/INSTALL.md`: document current install paths and future CLI-friendly flow.
- `tsconfig.json`, `package.json`: align scripts and TypeScript scope with the asset-library repository.

---

### Task 1: Lock the New Repository Shape With Tests

**Files:**
- Create: `tests/helpers/frontmatter.ts`
- Create: `tests/skills-schema.test.ts`
- Create: `tests/plugin-manifest.test.ts`
- Create: `tests/repo-layout.test.ts`
- Modify: `tests/schema.test.ts`
- Delete: `tests/adapters/claude-code.test.ts`

- [ ] **Step 1: Write a test-only frontmatter helper**

Create `tests/helpers/frontmatter.ts`:

```ts
export function parseFrontmatter(content: string): Record<string, string> {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) throw new Error('Missing frontmatter');

  return Object.fromEntries(
    match[1]
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const separator = line.indexOf(':');
        if (separator === -1) throw new Error(`Invalid frontmatter line: ${line}`);
        return [
          line.slice(0, separator).trim(),
          line.slice(separator + 1).trim().replace(/^["']|["']$/g, ''),
        ];
      }),
  );
}
```

- [ ] **Step 2: Add failing skill schema tests**

Create `tests/skills-schema.test.ts` to read every `skills/*/SKILL.md`, assert `name`, `description`, `version`, and `supported_tools` exist, and assert `name` equals the directory name.

- [ ] **Step 3: Add failing manifest tests**

Create `tests/plugin-manifest.test.ts` to parse `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, and `.cursor-plugin/plugin.json`; assert each has `name`, `description`, and `version` where applicable.

- [ ] **Step 4: Add failing layout guard tests**

Create `tests/repo-layout.test.ts` asserting these paths do not exist: `assets/`, `adapters/`, `lib/schema.ts`. This encodes the architecture decision.

- [ ] **Step 5: Remove stale adapter test**

Delete `tests/adapters/claude-code.test.ts` because it imports removed adapter files.

- [ ] **Step 6: Run tests and verify expected failures**

Run: `pnpm test`

Expected: failures only from assertions that expose current metadata or layout gaps, not module import errors from deleted adapter code.

- [ ] **Step 7: Commit tests**

```bash
git add tests
git commit -m "Lock skill-library repository shape"
```

---

### Task 2: Align Metadata, TypeScript Scope, and Package Scripts

**Files:**
- Modify: `package.json`
- Modify: `tsconfig.json`
- Modify: `skills/*/SKILL.md`
- Modify: `.claude-plugin/plugin.json`
- Modify: `.claude-plugin/marketplace.json`
- Modify: `.cursor-plugin/plugin.json`

- [ ] **Step 1: Update package scripts**

Add scripts:

```json
{
  "scripts": {
    "test": "node --experimental-vm-modules node_modules/jest/bin/jest.js",
    "validate": "pnpm test",
    "install:claude": "./scripts/install.sh --tool claude-code"
  }
}
```

- [ ] **Step 2: Align TypeScript config**

Set `tsconfig.json` `include` to `["tests/**/*"]` until `tools/` or `packages/cli/` contains TypeScript source. Keep strict ESM settings.

- [ ] **Step 3: Normalize skill frontmatter**

For each `skills/*/SKILL.md`, ensure `name` equals the directory name and `supported_tools` includes only `claude-code`, `codex`, `cursor`, `opencode`.

- [ ] **Step 4: Normalize plugin metadata**

Replace temporary author/repository values with stable project values or remove fields that are not yet true. Keep metadata consistent with `package.json`.

- [ ] **Step 5: Run targeted verification**

Run: `pnpm test`

Expected: skill schema, manifest, and layout tests pass.

- [ ] **Step 6: Commit metadata alignment**

```bash
git add package.json tsconfig.json skills .claude-plugin .cursor-plugin
git commit -m "Align metadata with skill-library structure"
```

---

### Task 3: Make Installation Script Safe and Testable

**Files:**
- Modify: `scripts/install.sh`
- Modify: `scripts/detect-tools.sh`
- Create: `tests/install-script.test.ts`

- [ ] **Step 1: Write failing installer tests**

Create `tests/install-script.test.ts` that runs `scripts/install.sh` with a temporary target root:

```ts
import { mkdtempSync, existsSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { execFileSync } from 'child_process';

test('installs skills into a test target root for codex', () => {
  const root = mkdtempSync(join(tmpdir(), 'danny-skill-'));
  execFileSync('./scripts/install.sh', ['--yes', '--tool', 'codex', '--target-root', root], {
    stdio: 'pipe',
  });
  expect(existsSync(join(root, '.codex', 'skills', 'inspiration-box', 'SKILL.md'))).toBe(true);
});
```

- [ ] **Step 2: Implement installer flags**

Support:

- `--yes`: non-interactive install.
- `--dry-run`: print planned writes without copying.
- `--tool claude-code|codex|cursor|opencode|all`: target one tool or all.
- `--target-root <path>`: install below a test/user root instead of real `$HOME`.

- [ ] **Step 3: Keep copy logic simple**

Use one shell function to copy every `skills/*/` directory to a tool-specific destination. Do not add symlink behavior yet.

- [ ] **Step 4: Update detection script**

Ensure `scripts/detect-tools.sh` reports `claude-code`, `codex`, `cursor`, and `opencode` consistently. Detection failures must not fail the script.

- [ ] **Step 5: Run installer tests**

Run: `pnpm test -- tests/install-script.test.ts`

Expected: temporary install succeeds without writing to real user directories.

- [ ] **Step 6: Commit installer changes**

```bash
git add scripts tests/install-script.test.ts
git commit -m "Make skill installation safe to test"
```

---

### Task 4: Update Distribution Documentation

**Files:**
- Modify: `README.md`
- Modify: `.codex/INSTALL.md`
- Modify: `.opencode/INSTALL.md`
- Modify: `AGENTS.md`
- Modify: `CLAUDE.md`

- [ ] **Step 1: Rewrite README architecture sections**

State that `skills/` is canonical, plugin directories are distribution metadata, and CLI is future work. Include install examples:

```bash
pnpm install
pnpm test
./scripts/install.sh --tool codex --yes
./scripts/install.sh --tool claude-code --yes
```

- [ ] **Step 2: Update Codex install docs**

Document copy-based install to `~/.codex/skills/` as the default path used by `scripts/install.sh`. Add a clearly labeled advanced note for symlink-based native discovery via `~/.agents/skills/danny-skill` when the user's Codex setup supports it.

- [ ] **Step 3: Update OpenCode install docs**

Document current manual copy flow. Leave plugin shim as a future enhancement unless implemented in this task.

- [ ] **Step 4: Update contributor guides**

Update `AGENTS.md` and `CLAUDE.md` so tests no longer refer to adapter tests and guidance reflects the skill-library-first design.

- [ ] **Step 5: Run docs-sensitive tests**

Run: `pnpm test`

Expected: all tests pass.

- [ ] **Step 6: Commit docs**

```bash
git add README.md .codex/INSTALL.md .opencode/INSTALL.md AGENTS.md CLAUDE.md
git commit -m "Document multi-tool skill distribution"
```

---

### Task 5: Add Future CLI Extension Points Without Implementing CLI

**Files:**
- Create: `tools/README.md`
- Create: `packages/cli/README.md`
- Modify: `.gitignore`
- Modify: `tests/repo-layout.test.ts`

- [ ] **Step 1: Create tools README**

Document that `tools/` holds lightweight validation and packaging scripts before they graduate into the CLI.

- [ ] **Step 2: Create CLI extension README**

Document intended future commands: `validate`, `install`, `package`, and `sync`. Do not add an npm package yet.

- [ ] **Step 3: Ignore generated output**

Ensure `.gitignore` ignores `dist/` and `.omx/` runtime state while keeping source plugin directories tracked.

- [ ] **Step 4: Update layout tests**

Assert `tools/README.md` and `packages/cli/README.md` exist. Do not require a built CLI.

- [ ] **Step 5: Run verification**

Run: `pnpm test`

Expected: all tests pass.

- [ ] **Step 6: Commit extension points**

```bash
git add tools packages .gitignore tests/repo-layout.test.ts
git commit -m "Reserve CLI extension points"
```

---

### Task 6: Final Verification and Cleanup

**Files:**
- Modify only files required by failures found in this task.

- [ ] **Step 1: Run full test suite**

Run: `pnpm test`

Expected: all Jest tests pass.

- [ ] **Step 2: Run type check**

Run: `pnpm exec tsc --noEmit`

Expected: TypeScript completes without diagnostics.

- [ ] **Step 3: Inspect git status**

Run: `git status --short`

Expected: only intentional changes remain; do not revert unrelated pre-existing user changes.

- [ ] **Step 4: Review changed files for generated or local state**

Ensure `.omx/`, `node_modules/`, `dist/`, temporary directories, and local settings are not staged.

- [ ] **Step 5: Final commit if needed**

If verification fixes were required:

```bash
git add <fixed-files>
git commit -m "Stabilize architecture migration"
```

- [ ] **Step 6: Report completion**

Final report must include changed files, tests run, known risks, and any intentionally deferred CLI work.
