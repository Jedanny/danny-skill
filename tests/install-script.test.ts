import { describe, expect, test } from '@jest/globals';
import { execFileSync } from 'child_process';
import { cpSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readlinkSync, realpathSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

function tempRoot() {
  return mkdtempSync(join(tmpdir(), 'danny-skill-'));
}

function installFixtureRoot() {
  const root = tempRoot();
  for (const entry of ['scripts', 'skills', 'commands']) {
    cpSync(join(process.cwd(), entry), join(root, entry), { recursive: true });
  }
  return root;
}

describe('install script', () => {
  test('links skills into a test target root for Codex by default', () => {
    const root = tempRoot();

    execFileSync('./scripts/install.sh', ['--yes', '--tool', 'codex', '--target-root', root], {
      cwd: process.cwd(),
      stdio: 'pipe',
    });

    const linkedSkill = join(root, '.agents', 'skills', 'inspiration-box');
    expect(lstatSync(linkedSkill).isSymbolicLink()).toBe(true);
    expect(readlinkSync(linkedSkill)).toBe(join(process.cwd(), 'skills', 'inspiration-box'));
    expect(existsSync(join(root, '.agents', 'skills', 'design-style', 'SKILL.md'))).toBe(true);
    expect(existsSync(join(root, '.agents', 'skills', 'knowledge-distill', 'SKILL.md'))).toBe(true);
    expect(existsSync(join(root, '.agents', 'skills', 'self-improvement', 'SKILL.md'))).toBe(true);
  });

  test('supports explicit copy mode for environments that cannot use links', () => {
    const root = tempRoot();

    execFileSync('./scripts/install.sh', ['--yes', '--mode', 'copy', '--tool', 'codex', '--target-root', root], {
      cwd: process.cwd(),
      stdio: 'pipe',
    });

    const copiedSkill = join(root, '.agents', 'skills', 'inspiration-box');
    expect(lstatSync(copiedSkill).isSymbolicLink()).toBe(false);
    expect(existsSync(join(copiedSkill, 'SKILL.md'))).toBe(true);
  });

  test('links Codex project-scope skills under .agents/skills', () => {
    const root = installFixtureRoot();

    execFileSync('./scripts/install.sh', ['--yes', '--tool', 'codex', '--scope', 'project', '--replace'], {
      cwd: root,
      stdio: 'pipe',
    });

    const linkedSkill = join(root, '.agents', 'skills', 'design-style');
    expect(lstatSync(linkedSkill).isSymbolicLink()).toBe(true);
    expect(realpathSync(linkedSkill)).toBe(realpathSync(join(root, 'skills', 'design-style')));
  });

  test('links Claude Code project-scope skills under .claude/skills', () => {
    const root = installFixtureRoot();

    execFileSync('./scripts/install.sh', ['--yes', '--tool', 'claude-code', '--scope', 'project', '--replace'], {
      cwd: root,
      stdio: 'pipe',
    });

    const linkedSkill = join(root, '.claude', 'skills', 'design-style');
    expect(lstatSync(linkedSkill).isSymbolicLink()).toBe(true);
    expect(realpathSync(linkedSkill)).toBe(realpathSync(join(root, 'skills', 'design-style')));
  });

  test('links Cursor project-scope rules and commands using official directories', () => {
    const root = installFixtureRoot();

    execFileSync('./scripts/install.sh', ['--yes', '--tool', 'cursor', '--scope', 'project', '--replace'], {
      cwd: root,
      stdio: 'pipe',
    });

    const linkedRule = join(root, '.cursor', 'rules', 'design-style.mdc');
    const linkedCommand = join(root, '.cursor', 'commands', 'list-designs.md');
    expect(lstatSync(linkedRule).isSymbolicLink()).toBe(true);
    expect(realpathSync(linkedRule)).toBe(realpathSync(join(root, 'skills', 'design-style', 'SKILL.md')));
    expect(lstatSync(linkedCommand).isSymbolicLink()).toBe(true);
    expect(realpathSync(linkedCommand)).toBe(realpathSync(join(root, 'commands', 'list-designs.md')));
  });

  test('rejects Cursor user-scope installs because no portable official path exists', () => {
    expect(() =>
      execFileSync('./scripts/install.sh', ['--yes', '--tool', 'cursor', '--target-root', tempRoot()], {
        cwd: process.cwd(),
        stdio: 'pipe',
      }),
    ).toThrow(/Cursor install requires --scope project/);
  });

  test('rejects project scope for tools without official project skill paths', () => {
    expect(() =>
      execFileSync('./scripts/install.sh', ['--yes', '--tool', 'opencode', '--scope', 'project'], {
        cwd: process.cwd(),
        stdio: 'pipe',
      }),
    ).toThrow();
  });

  test('all user-scope installs skip Cursor because it is project-scoped', () => {
    const root = tempRoot();
    const output = execFileSync('./scripts/install.sh', ['--yes', '--tool', 'all', '--target-root', root], {
      cwd: process.cwd(),
      encoding: 'utf8',
      stdio: 'pipe',
    });

    expect(output).toContain('Skipping cursor');
    expect(existsSync(join(root, '.agents', 'skills', 'design-style', 'SKILL.md'))).toBe(true);
    expect(existsSync(join(root, '.claude', 'skills', 'design-style', 'SKILL.md'))).toBe(true);
    expect(existsSync(join(root, '.cursor'))).toBe(false);
  });

  test('detected mode skips Cursor instead of failing through user-scope install', () => {
    const root = tempRoot();
    mkdirSync(join(root, '.cursor'), { recursive: true });
    mkdirSync(join(root, '.claude'), { recursive: true });

    const output = execFileSync('./scripts/install.sh', ['--yes', '--target-root', root], {
      cwd: process.cwd(),
      encoding: 'utf8',
      stdio: 'pipe',
    });

    expect(output).toContain('Skipping cursor');
    expect(output).toContain('claude-code detected');
    expect(existsSync(join(root, '.claude', 'skills', 'design-style', 'SKILL.md'))).toBe(true);
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
