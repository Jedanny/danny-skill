import { describe, expect, test } from '@jest/globals';
import { existsSync } from 'fs';
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
});
