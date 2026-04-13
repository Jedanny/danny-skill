import { describe, expect, test } from '@jest/globals';
import { execFileSync } from 'child_process';
import { existsSync, mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

function tempRoot() {
  return mkdtempSync(join(tmpdir(), 'danny-skill-'));
}

describe('install script', () => {
  test('installs skills into a test target root for Codex', () => {
    const root = tempRoot();

    execFileSync('./scripts/install.sh', ['--yes', '--tool', 'codex', '--target-root', root], {
      cwd: process.cwd(),
      stdio: 'pipe',
    });

    expect(existsSync(join(root, '.codex', 'skills', 'inspiration-box', 'SKILL.md'))).toBe(true);
    expect(existsSync(join(root, '.codex', 'skills', 'knowledge-distill', 'SKILL.md'))).toBe(true);
    expect(existsSync(join(root, '.codex', 'skills', 'self-improvement', 'SKILL.md'))).toBe(true);
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
