import { describe, expect, test, beforeEach } from '@jest/globals';
import { tmpdir } from 'os';
import { join } from 'path';
import { existsSync, mkdirSync, writeFileSync } from 'fs';

describe('Claude Code Adapter', () => {
  const testAssetsDir = join(tmpdir(), 'danny-skill-test-assets');

  beforeEach(() => {
    // Setup test directory structure
    if (!existsSync(testAssetsDir)) {
      mkdirSync(testAssetsDir, { recursive: true });
    }
  });

  test('should create Claude Code adapter instance', async () => {
    const { ClaudeCodeAdapter } = await import('../../adapters/claude-code/index.js');
    const adapter = new ClaudeCodeAdapter(testAssetsDir);
    expect(adapter).toBeDefined();
  });

  test('should load skills from directory', async () => {
    const { ClaudeCodeAdapter } = await import('../../adapters/claude-code/index.js');
    const adapter = new ClaudeCodeAdapter(testAssetsDir);
    const skills = await adapter.loadSkills();
    expect(Array.isArray(skills)).toBe(true);
  });
});
