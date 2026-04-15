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

      if (metadata.trigger !== undefined) {
        expect(metadata.trigger).toEqual(expect.any(String));
        expect(metadata.trigger).toMatch(/^\/danny-/);
      }

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

  test('README distinguishes official invocation from project aliases', () => {
    const readme = readFileSync(join(process.cwd(), 'README.md'), 'utf8');

    expect(readme).toContain('Claude Code standalone');
    expect(readme).toContain('Claude Code plugin');
    expect(readme).toContain('Codex');
    expect(readme).toContain('$inspiration-box');
    expect(readme).toContain('/danny-skill:inspiration-box');
    expect(readme).toContain('Project alias 是本仓库约定');
    expect(readme).toContain('不会自动变成 Claude Code 或 Codex 的原生命令');
    expect(readme).toContain('每个 skill 都可以独立使用');
    expect(readme).toContain('不要把组合示例当作强制流程');
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

  test('coding-guardrails documents Karpathy-style coding safeguards', () => {
    const skillDir = join(skillsDir, 'coding-guardrails');
    const skillFile = join(skillDir, 'SKILL.md');
    const content = readFileSync(skillFile, 'utf8');
    const metadata = parseFrontmatter(content);

    expect(metadata.name).toBe('coding-guardrails');
    expect(metadata.description).toMatch(/^Use when\b/);
    expect(metadata.triggers).toEqual(
      expect.arrayContaining(['coding', 'refactor', 'bugfix', 'verification']),
    );

    for (const requiredTerm of [
      'Think Before Coding',
      'Simplicity First',
      'Surgical Changes',
      'Goal-Driven Execution',
    ]) {
      expect(content).toContain(requiredTerm);
    }

    const examples = readFileSync(join(skillDir, 'references', 'examples.md'), 'utf8');
    expect(examples).toContain('andrej-karpathy-skills');
    expect(examples.toLowerCase()).toContain('hidden assumptions');
    expect(examples.toLowerCase()).toContain('over-abstraction');
    expect(examples.toLowerCase()).toContain('drive-by refactor');
  });
});
