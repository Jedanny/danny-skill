import { describe, expect, test } from '@jest/globals';
import { execFileSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

describe('repository layout', () => {
  test('uses skills as the canonical asset source', () => {
    for (const legacyPath of ['assets', 'adapters', 'lib/schema.ts']) {
      expect(existsSync(join(process.cwd(), legacyPath))).toBe(false);
    }

    expect(existsSync(join(process.cwd(), 'skills'))).toBe(true);
    expect(existsSync(join(process.cwd(), 'commands'))).toBe(true);
    expect(existsSync(join(process.cwd(), 'prompts'))).toBe(true);
    expect(existsSync(join(process.cwd(), 'tools', 'README.md'))).toBe(true);
    expect(existsSync(join(process.cwd(), 'packages', 'cli', 'README.md'))).toBe(true);
    expect(existsSync(join(process.cwd(), 'packages', 'cli', 'package.json'))).toBe(true);
    expect(existsSync(join(process.cwd(), 'packages', 'cli', 'Cargo.toml'))).toBe(true);
  });

  test('uses a unified project knowledge-base path', () => {
    for (const legacyPath of [
      'docs/inspiration',
      'docs/knowledge',
      'docs/learnings',
      'docs/autoresearch',
      'docs/knowledge-base/project',
    ]) {
      expect(existsSync(join(process.cwd(), legacyPath))).toBe(false);
    }

    for (const requiredPath of [
      'docs/knowledge-base/README.md',
      'docs/knowledge-base/storage-model.md',
      '.danny/knowledge-base/README.md',
      '.danny/knowledge-base/inbox/inspiration',
      '.danny/knowledge-base/ideas',
      '.danny/knowledge-base/learnings/errors',
      '.danny/knowledge-base/learnings/corrections',
      '.danny/knowledge-base/learnings/successes',
      '.danny/knowledge-base/learnings/patterns/PATTERNS.md',
      '.danny/knowledge-base/distilled/concepts',
      '.danny/knowledge-base/distilled/best-practices',
      '.danny/knowledge-base/distilled/decisions',
      '.danny/knowledge-base/distilled/lessons',
      '.danny/knowledge-base/experiments/autoresearch',
      '.danny/knowledge-base/research',
    ]) {
      expect(existsSync(join(process.cwd(), requiredPath))).toBe(true);
    }

    const storageModel = readFileSync(join(process.cwd(), 'docs/knowledge-base/storage-model.md'), 'utf8');
    expect(storageModel).toContain('capture -> workspace -> evidence -> distilled');
    expect(storageModel).toContain('.danny/knowledge-base/');
    expect(storageModel).toContain('Temporary task state');
    expect(storageModel).not.toContain('.omx');
  });

  test('documents install profiles and future CLI responsibilities', () => {
    const readme = readFileSync(join(process.cwd(), 'README.md'), 'utf8');
    const cliReadme = readFileSync(join(process.cwd(), 'packages', 'cli', 'README.md'), 'utf8');

    for (const profile of ['minimal', 'standard', 'full']) {
      expect(readme).toContain(`\`${profile}\``);
      expect(cliReadme).toContain(`\`${profile}\``);
    }

    expect(readme).toContain('当前 shell installer 安装完整 skill 目录');
    expect(cliReadme).toContain('Resolve `<project-knowledge-base>` and `<global-knowledge-base>` from config');
    expect(cliReadme).toContain('Generate project alias wrappers');
    expect(cliReadme).toContain('danny-skill install --tool codex --scope project --profile standard');
    expect(cliReadme).toContain('Rust N-API Layout');
    expect(cliReadme).toContain('validate_skills');
    expect(cliReadme).toContain('JavaScript implementation remains the compatibility fallback');
  });

  test('generated README skill table is up to date', () => {
    const output = execFileSync(
      process.execPath,
      [join(process.cwd(), 'tools', 'generate-readme-skill-table.mjs'), '--check'],
      {
        cwd: process.cwd(),
        encoding: 'utf8',
        stdio: 'pipe',
      },
    );

    expect(output).toContain('README skill table is up to date');
  });
});
