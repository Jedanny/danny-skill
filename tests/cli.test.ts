import { describe, expect, test } from '@jest/globals';
import { execFileSync } from 'child_process';
import { existsSync, mkdtempSync, readFileSync, lstatSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const cli = join(process.cwd(), 'packages', 'cli', 'danny-skill.mjs');

function tempRoot() {
  return mkdtempSync(join(tmpdir(), 'danny-skill-cli-'));
}

function runCli(args: string[], cwd = process.cwd()) {
  return execFileSync(process.execPath, [cli, ...args], {
    cwd,
    encoding: 'utf8',
    stdio: 'pipe',
  });
}

describe('danny-skill CLI', () => {
  test('validate checks the repository skill layout', () => {
    const output = runCli(['validate']);

    expect(output).toContain('valid');
    expect(output).toContain('skills');
  });

  test('config paths set writes project and global knowledge-base paths', () => {
    const root = tempRoot();

    runCli([
      'config',
      'paths',
      'set',
      '--target-root',
      root,
      '--project',
      '.custom/knowledge',
      '--global',
      '~/custom-knowledge',
    ]);

    const configPath = join(root, '.danny-skill', 'config.json');
    expect(existsSync(configPath)).toBe(true);

    const config = JSON.parse(readFileSync(configPath, 'utf8'));
    expect(config.knowledge_base.project).toBe('.custom/knowledge');
    expect(config.knowledge_base.global).toBe('~/custom-knowledge');
  });

  test('knowledge init creates project knowledge directories and patterns index', () => {
    const root = tempRoot();

    runCli(['knowledge', 'init', '--project', '--target-root', root]);

    expect(existsSync(join(root, '.danny-skill', 'knowledge-base', 'inbox', 'inspiration'))).toBe(true);
    expect(existsSync(join(root, '.danny-skill', 'knowledge-base', 'ideas'))).toBe(true);
    expect(existsSync(join(root, '.danny-skill', 'knowledge-base', 'learnings', 'patterns', 'PATTERNS.md'))).toBe(true);
    expect(readFileSync(join(root, '.danny-skill', 'knowledge-base', 'learnings', 'patterns', 'PATTERNS.md'), 'utf8')).toContain('Agent 使用入口');
  });

  test('install supports minimal profile for Codex project scope', () => {
    const root = tempRoot();

    runCli([
      'install',
      '--tool',
      'codex',
      '--scope',
      'project',
      '--profile',
      'minimal',
      '--target-root',
      root,
      '--mode',
      'copy',
    ]);

    const skillDir = join(root, '.agents', 'skills', 'design-style');
    expect(existsSync(join(skillDir, 'SKILL.md'))).toBe(true);
    expect(existsSync(join(skillDir, 'assets', 'preview.html'))).toBe(false);
    expect(lstatSync(skillDir).isSymbolicLink()).toBe(false);
  });

  test('install supports standard profile without large design reference bundle', () => {
    const root = tempRoot();

    runCli([
      'install',
      '--tool',
      'codex',
      '--scope',
      'project',
      '--profile',
      'standard',
      '--target-root',
      root,
      '--mode',
      'copy',
    ]);

    expect(existsSync(join(root, '.agents', 'skills', 'coding-guardrails', 'references', 'examples.md'))).toBe(true);
    expect(existsSync(join(root, '.agents', 'skills', 'design-style', 'assets', 'preview.html'))).toBe(true);
    expect(existsSync(join(root, '.agents', 'skills', 'design-style', 'references', 'designs'))).toBe(false);
  });

  test('install supports full profile with complete skill assets', () => {
    const root = tempRoot();

    runCli([
      'install',
      '--tool',
      'codex',
      '--scope',
      'project',
      '--profile',
      'full',
      '--target-root',
      root,
      '--mode',
      'copy',
    ]);

    expect(existsSync(join(root, '.agents', 'skills', 'design-style', 'references', 'designs'))).toBe(true);
  });
});
