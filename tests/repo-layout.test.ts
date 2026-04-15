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
    ]) {
      expect(existsSync(join(process.cwd(), legacyPath))).toBe(false);
    }

    for (const requiredPath of [
      'docs/knowledge-base/README.md',
      'docs/knowledge-base/storage-model.md',
      'docs/knowledge-base/project/README.md',
      'docs/knowledge-base/project/inbox/inspiration',
      'docs/knowledge-base/project/ideas',
      'docs/knowledge-base/project/learnings/errors',
      'docs/knowledge-base/project/learnings/corrections',
      'docs/knowledge-base/project/learnings/successes',
      'docs/knowledge-base/project/distilled/concepts',
      'docs/knowledge-base/project/distilled/best-practices',
      'docs/knowledge-base/project/distilled/decisions',
      'docs/knowledge-base/project/distilled/lessons',
      'docs/knowledge-base/project/experiments/autoresearch',
      'docs/knowledge-base/project/research',
    ]) {
      expect(existsSync(join(process.cwd(), requiredPath))).toBe(true);
    }

    const storageModel = readFileSync(join(process.cwd(), 'docs/knowledge-base/storage-model.md'), 'utf8');
    expect(storageModel).toContain('capture -> workspace -> evidence -> distilled');
    expect(storageModel).toContain('Do not commit `.omx/` state');
  });
});
