import { describe, expect, test } from '@jest/globals';
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
      '.danny-skill/knowledge-base/README.md',
      '.danny-skill/knowledge-base/inbox/inspiration',
      '.danny-skill/knowledge-base/ideas',
      '.danny-skill/knowledge-base/learnings/errors',
      '.danny-skill/knowledge-base/learnings/corrections',
      '.danny-skill/knowledge-base/learnings/successes',
      '.danny-skill/knowledge-base/learnings/patterns/PATTERNS.md',
      '.danny-skill/knowledge-base/distilled/concepts',
      '.danny-skill/knowledge-base/distilled/best-practices',
      '.danny-skill/knowledge-base/distilled/decisions',
      '.danny-skill/knowledge-base/distilled/lessons',
      '.danny-skill/knowledge-base/experiments/autoresearch',
      '.danny-skill/knowledge-base/research',
    ]) {
      expect(existsSync(join(process.cwd(), requiredPath))).toBe(true);
    }

    const storageModel = readFileSync(join(process.cwd(), 'docs/knowledge-base/storage-model.md'), 'utf8');
    expect(storageModel).toContain('capture -> workspace -> evidence -> distilled');
    expect(storageModel).toContain('.danny-skill/knowledge-base/');
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
    expect(cliReadme).toContain('Do not add a package manifest here');
  });
});
