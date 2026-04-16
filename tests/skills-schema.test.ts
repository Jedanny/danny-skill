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
    expect(readme).toContain('skill 正文使用中文为主');
    expect(readme).toContain('frontmatter `description` 保持英文 `Use when...`');
  });

  test('skill bodies use Chinese primary section headings', () => {
    const oldEnglishHeadings = [
      'Purpose',
      'When To Use',
      'When to Use',
      'Overview',
      'Progressive Disclosure',
      'Trigger Patterns',
      'Usage Modes',
      'Workflow',
      'Process',
      'Core Concepts',
      'Output Format',
      'Knowledge Categories',
      'Learning Storage Structure',
      'Learning Entry Format',
      'Quality Checklist',
      'Quick Commands',
      'Integration',
      'Guardrails',
      'Templates',
      'Handoff To Other Skills',
      'Output Workspace',
      'Decision Gates',
      'Methodology Note',
      'Pipeline',
      'Experiment Log',
      'Eval Types',
      'Core Loop',
      'Checklists',
    ];

    for (const skillName of readdirSync(skillsDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)) {
      const content = readFileSync(join(skillsDir, skillName, 'SKILL.md'), 'utf8');

      for (const heading of oldEnglishHeadings) {
        expect(content).not.toContain(`## ${heading}`);
      }
    }
  });

  test('external reference sources are centralized in README', () => {
    const readme = readFileSync(join(process.cwd(), 'README.md'), 'utf8');

    expect(readme).toContain('## 参考来源');
    expect(readme).toContain('外部参考来源集中维护在这里');
    expect(readme).toContain('https://github.com/VoltAgent/awesome-design-md');
    expect(readme).toContain('https://github.com/karpathy/autoresearch');
    expect(readme).toContain('https://github.com/zning1994/openclaw-autoresearch');
    expect(readme).toContain('https://mp.weixin.qq.com/s/4ICQJGwa2MD616_oFmJb4w');
    expect(readme).toContain('https://github.com/forrestchang/andrej-karpathy-skills');

    for (const skillName of readdirSync(skillsDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)) {
      const content = readFileSync(join(skillsDir, skillName, 'SKILL.md'), 'utf8');

      expect(content).not.toMatch(/https?:\/\//);
      expect(content).not.toContain('参考来源');
      expect(content).not.toContain('设计参考来源');
      expect(content).not.toContain('方法论参考');
      expect(content).not.toContain('Reference source');
    }
  });

  test('skills do not hardcode repository documentation or knowledge paths', () => {
    const forbiddenPathFragments = [
      'docs/',
      'docs/knowledge-base',
      '.danny-skill/knowledge-base',
      '~/.danny-skill',
      'knowledge-base/storage-model',
    ];
    const skillFiles = readdirSync(skillsDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .flatMap((entry) => {
        const files = [join(skillsDir, entry.name, 'SKILL.md')];
        const configPath = join(skillsDir, entry.name, 'config.yaml');
        if (existsSync(configPath)) {
          files.push(configPath);
        }
        return files;
      });

    for (const file of skillFiles) {
      const content = readFileSync(file, 'utf8');

      for (const fragment of forbiddenPathFragments) {
        expect(content).not.toContain(fragment);
      }
    }

    const reusableSkillText = readFileSync(join(skillsDir, 'knowledge-distill', 'SKILL.md'), 'utf8');
    expect(reusableSkillText).toContain('<project-knowledge-base>');
    expect(reusableSkillText).toContain('<global-knowledge-base>');
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

    expect(content).toContain('Skill 质量棘轮');
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

  test('self-improvement records can be retrieved and applied by future agents', () => {
    const skillDir = join(skillsDir, 'self-improvement');
    const content = readFileSync(join(skillDir, 'SKILL.md'), 'utf8');
    const config = readFileSync(join(skillDir, 'config.yaml'), 'utf8');
    const patterns = readFileSync(
      join(process.cwd(), '.danny-skill', 'knowledge-base', 'learnings', 'patterns', 'PATTERNS.md'),
      'utf8',
    );

    for (const requiredTerm of [
      'Agent 应用协议',
      '检索顺序',
      'PATTERNS.md',
      'trigger_patterns',
      'Agent 应用',
      '默认动作',
      '例外情况',
    ]) {
      expect(content).toContain(requiredTerm);
    }

    expect(config).toContain('retrieval:');
    expect(config).toContain('index_path: "<project-knowledge-base>/learnings/patterns/PATTERNS.md"');
    expect(config).toContain('max_context_items');
    expect(patterns).toContain('Agent 使用入口');
    expect(patterns).toContain('优先使用 `pnpm`');
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
      '先想清楚再编码',
      '简单优先',
      '外科手术式修改',
      '目标驱动执行',
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
