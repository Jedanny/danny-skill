import { describe, expect, test } from '@jest/globals';
import { execFileSync } from 'child_process';
import { existsSync, lstatSync, mkdtempSync, readlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

function tempRoot() {
  return mkdtempSync(join(tmpdir(), 'danny-skill-'));
}

describe('install script', () => {
  test('links skills into a test target root for Codex by default', () => {
    const root = tempRoot();

    execFileSync('./scripts/install.sh', ['--yes', '--tool', 'codex', '--target-root', root], {
      cwd: process.cwd(),
      stdio: 'pipe',
    });

    const linkedSkill = join(root, '.codex', 'skills', 'inspiration-box');
    expect(lstatSync(linkedSkill).isSymbolicLink()).toBe(true);
    expect(readlinkSync(linkedSkill)).toBe(join(process.cwd(), 'skills', 'inspiration-box'));
    expect(existsSync(join(root, '.codex', 'skills', 'design-style', 'SKILL.md'))).toBe(true);
    expect(existsSync(join(root, '.codex', 'skills', 'knowledge-distill', 'SKILL.md'))).toBe(true);
    expect(existsSync(join(root, '.codex', 'skills', 'self-improvement', 'SKILL.md'))).toBe(true);
  });

  test('supports explicit copy mode for environments that cannot use links', () => {
    const root = tempRoot();

    execFileSync('./scripts/install.sh', ['--yes', '--mode', 'copy', '--tool', 'codex', '--target-root', root], {
      cwd: process.cwd(),
      stdio: 'pipe',
    });

    const copiedSkill = join(root, '.codex', 'skills', 'inspiration-box');
    expect(lstatSync(copiedSkill).isSymbolicLink()).toBe(false);
    expect(existsSync(join(copiedSkill, 'SKILL.md'))).toBe(true);
  });

  test('links Codex project-scope skills under .codex/skills', () => {
    execFileSync('./scripts/install.sh', ['--yes', '--tool', 'codex', '--scope', 'project', '--replace'], {
      cwd: process.cwd(),
      stdio: 'pipe',
    });

    const linkedSkill = join(process.cwd(), '.codex', 'skills', 'design-style');
    expect(lstatSync(linkedSkill).isSymbolicLink()).toBe(true);
    expect(readlinkSync(linkedSkill)).toBe(join(process.cwd(), 'skills', 'design-style'));
  });

  test('rejects project scope for non-Codex tools', () => {
    expect(() =>
      execFileSync('./scripts/install.sh', ['--yes', '--tool', 'claude-code', '--scope', 'project'], {
        cwd: process.cwd(),
        stdio: 'pipe',
      }),
    ).toThrow();
  });

  test('dry-run reports planned writes without copying skills', () => {
    const root = tempRoot();
    const output = execFileSync(
      './scripts/install.sh',
      ['--yes', '--dry-run', '--tool', 'claude-code', '--target-root', root],
      {
        cwd: process.cwd(),
        encoding: 'utf8',
        stdio: 'pipe',
      },
    );

    expect(output).toContain('DRY RUN');
    expect(output).toContain('would link');
    expect(output).toContain(join(root, '.claude', 'skills'));
    expect(existsSync(join(root, '.claude', 'skills'))).toBe(false);
  });

  test('rejects unsupported tools', () => {
    expect(() =>
      execFileSync('./scripts/install.sh', ['--yes', '--tool', 'unknown', '--target-root', tempRoot()], {
        cwd: process.cwd(),
        stdio: 'pipe',
      }),
    ).toThrow();
  });
});
