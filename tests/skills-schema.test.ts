import { describe, expect, test } from '@jest/globals';
import { existsSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { parseFrontmatter } from './helpers/frontmatter';

const skillsDir = join(process.cwd(), 'skills');
const supportedTools = ['claude-code', 'codex', 'cursor', 'opencode'];

describe('skill library schema', () => {
  test('every skill has a SKILL.md with required frontmatter', () => {
    const skillNames = readdirSync(skillsDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);

    expect(skillNames.length).toBeGreaterThan(0);

    for (const skillName of skillNames) {
      const skillFile = join(skillsDir, skillName, 'SKILL.md');
      expect(existsSync(skillFile)).toBe(true);

      const metadata = parseFrontmatter(readFileSync(skillFile, 'utf8'));

      expect(metadata.name).toBe(skillName);
      expect(metadata.description).toEqual(expect.any(String));
      expect(metadata.description).toMatch(/^Use when\b/);
      expect(metadata.version).toEqual(expect.any(String));
      expect(Array.isArray(metadata.triggers)).toBe(true);
      expect(Array.isArray(metadata.supported_tools)).toBe(true);

      expect((metadata.triggers as string[]).length).toBeGreaterThan(0);

      for (const tool of metadata.supported_tools as string[]) {
        expect(supportedTools).toContain(tool);
      }
    }
  });

  test('design-style bundles its visual preview and design references', () => {
    const designStyleDir = join(skillsDir, 'design-style');
    const designsDir = join(designStyleDir, 'references', 'designs');
    const designReferences = readdirSync(designsDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .filter((entry) => existsSync(join(designsDir, entry.name, 'DESIGN.md')));

    expect(existsSync(join(designStyleDir, 'assets', 'preview.html'))).toBe(true);
    expect(designReferences).toHaveLength(58);
  });

  test('autoresearch-loop documents the eval-driven optimization loop', () => {
    const autoresearchDir = join(skillsDir, 'autoresearch-loop');
    const skillFile = join(autoresearchDir, 'SKILL.md');
    const content = readFileSync(skillFile, 'utf8');
    const metadata = parseFrontmatter(content);

    expect(metadata.name).toBe('autoresearch-loop');
    expect(metadata.description).toMatch(/^Use when\b/);
    expect(metadata.supported_tools).toEqual(['claude-code', 'codex']);
    expect(metadata.triggers).toEqual(
      expect.arrayContaining(['autoresearch', 'eval', 'experiment', 'prompt-optimization']),
    );

    for (const requiredTerm of ['baseline', 'eval', 'mutation', 'keep-or-revert', 'changelog', 'max_experiments']) {
      expect(content).toContain(requiredTerm);
    }

    expect(existsSync(join(autoresearchDir, 'references', 'eval-format.md'))).toBe(true);
    expect(existsSync(join(autoresearchDir, 'assets', 'eval.example.json'))).toBe(true);
  });
});
