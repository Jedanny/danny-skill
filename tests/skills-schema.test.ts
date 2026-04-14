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

  test('autoresearch-loop includes skill quality ratchet references', () => {
    const autoresearchDir = join(skillsDir, 'autoresearch-loop');
    const content = readFileSync(join(autoresearchDir, 'SKILL.md'), 'utf8');
    const rubric = readFileSync(join(autoresearchDir, 'references', 'skill-quality-rubric.md'), 'utf8');
    const evaluator = readFileSync(join(autoresearchDir, 'references', 'evaluator-protocol.md'), 'utf8');
    const hitl = readFileSync(join(autoresearchDir, 'references', 'hitl-review-template.md'), 'utf8');

    expect(content).toContain('Skill Quality Ratchet');
    expect(rubric).toContain('100');
    expect(rubric).toContain('Structure Score');
    expect(rubric).toContain('Effect Score');
    expect(rubric).toContain('Frontmatter');
    expect(rubric).toContain('Real prompt output quality');
    expect(evaluator).toContain('independent evaluator');
    expect(evaluator.toLowerCase()).toContain('before score');
    expect(evaluator.toLowerCase()).toContain('after score');
    expect(hitl).toContain('Keep');
    expect(hitl).toContain('Revert');
    expect(hitl).toContain('Revise and rerun');
  });

  test('research-to-implementation documents the paper-to-coding pipeline', () => {
    const skillDir = join(skillsDir, 'research-to-implementation');
    const skillFile = join(skillDir, 'SKILL.md');
    const content = readFileSync(skillFile, 'utf8');
    const metadata = parseFrontmatter(content);

    expect(metadata.name).toBe('research-to-implementation');
    expect(metadata.description).toMatch(/^Use when\b/);
    expect(metadata.supported_tools).toEqual(['claude-code', 'codex']);
    expect(metadata.triggers).toEqual(
      expect.arrayContaining(['paper', 'research', 'open-source', 'implementation', 'business-fit']),
    );

    for (const requiredTerm of [
      'paper search',
      'paper analysis',
      'open source evaluation',
      'business fit',
      'implementation proposal',
      'coding handoff',
    ]) {
      expect(content).toContain(requiredTerm);
    }

    for (const template of [
      'paper-analysis-template.md',
      'open-source-evaluation-template.md',
      'business-fit-template.md',
      'implementation-proposal-template.md',
    ]) {
      expect(existsSync(join(skillDir, 'references', template))).toBe(true);
    }

    expect(existsSync(join(skillDir, 'assets', 'research-workspace.example.md'))).toBe(true);
  });
});
