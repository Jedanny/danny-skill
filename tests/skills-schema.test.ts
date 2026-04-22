import { describe, expect, test } from '@jest/globals';
import { existsSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { parseFrontmatter } from './helpers/frontmatter';
import { parseMarkdownTable } from './helpers/markdown';
import { parseManifest, type ManifestObject, type ManifestValue } from './helpers/manifest';

const skillsDir = join(process.cwd(), 'skills');
const supportedTools = ['claude-code', 'codex', 'cursor', 'opencode'];

function objectField(value: ManifestValue | undefined): ManifestObject {
  expect(value).toEqual(expect.any(Object));
  expect(Array.isArray(value)).toBe(false);
  return value as ManifestObject;
}

function stringList(value: ManifestValue | undefined): string[] {
  expect(Array.isArray(value)).toBe(true);
  return value as string[];
}

function objectList(value: ManifestValue | undefined): ManifestObject[] {
  expect(Array.isArray(value)).toBe(true);
  return value as ManifestObject[];
}

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
        expect(metadata.trigger).toMatch(/^\/(?:danny-|using-danny$)/);
      }

      for (const tool of metadata.supported_tools as string[]) {
        expect(supportedTools).toContain(tool);
      }
    }
  });

  test('all config manifests share the common manifest skeleton', () => {
    const configPaths = readdirSync(skillsDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => join(skillsDir, entry.name, 'config.yaml'))
      .filter((configPath) => existsSync(configPath));

    expect(configPaths.length).toBeGreaterThan(0);

    for (const configPath of configPaths) {
      const manifest = parseManifest(readFileSync(configPath, 'utf8'));
      const runtime = objectField(manifest.runtime);
      const profileBehavior = objectField(runtime.profile_behavior);
      const packaging = objectField(manifest.packaging);
      const minimal = objectField(packaging.minimal);
      const standard = objectField(packaging.standard);
      const full = objectField(packaging.full);
      const validation = objectField(manifest.validation);
      const docs = objectField(manifest.docs);

      expect(manifest.version).toBe(1);
      expect(typeof runtime.kind).toBe('string');
      expect(typeof profileBehavior.minimal).toBe('string');
      expect(typeof profileBehavior.standard).toBe('string');
      expect(typeof profileBehavior.full).toBe('string');

      const minimalInclude = stringList(minimal.include);
      const standardInclude = stringList(standard.include);
      const fullInclude = stringList(full.include);
      const docsArtifacts = stringList(docs.artifacts);

      expect(Array.isArray(validation.required_files)).toBe(true);
      expect(typeof docs.summary).toBe('string');
      expect((docs.summary as string).length).toBeGreaterThan(0);
      expect(minimalInclude).toContain('SKILL.md');
      expect(minimalInclude).toContain('config.yaml');
      expect(standardInclude).toContain('SKILL.md');
      expect(standardInclude).toContain('config.yaml');
      expect(fullInclude).toContain('**');
      expect(docsArtifacts.length).toBeGreaterThan(0);
    }
  });

  test('test manifest parser stays aligned with CLI shared parser', async () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error manifest.mjs is an ESM runtime module without a TypeScript declaration file
    const cliManifestModule = await import('../packages/cli/manifest.mjs') as {
      parseManifest: (content: string) => ManifestObject,
      parsePackagingIncludeList: (content: string, profile: string) => string[] | null,
      parseValidationSpec: (content: string) => {
        requiredFiles: string[],
        jsonFiles: string[],
        markdownContracts: Array<{ path: string, mustContain: string[] }>,
      },
    };
    const { parseManifest: parseManifestCli, parsePackagingIncludeList, parseValidationSpec } = cliManifestModule;

    const configPaths = readdirSync(skillsDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => join(skillsDir, entry.name, 'config.yaml'))
      .filter((configPath) => existsSync(configPath));

    for (const configPath of configPaths) {
      const content = readFileSync(configPath, 'utf8');
      const parsedByTest = parseManifest(content);
      const parsedByCli = parseManifestCli(content);

      expect(parsedByCli).toEqual(parsedByTest);

      const packaging = objectField(parsedByTest.packaging);
      for (const profile of ['minimal', 'standard', 'full']) {
        const profileConfig = objectField(packaging[profile]);
        expect(parsePackagingIncludeList(content, profile)).toEqual(profileConfig.include ?? null);
      }

      const validation = objectField(parsedByTest.validation);
      const markdownContracts = 'markdown_contracts' in validation
        ? objectList(validation.markdown_contracts).map((contract) => {
          const item = objectField(contract);
          return {
            path: item.path as string,
            mustContain: stringList(item.must_contain),
          };
        })
        : [];

      expect(parseValidationSpec(content)).toEqual({
        requiredFiles: validation.required_files ?? [],
        jsonFiles: validation.json_files ?? [],
        markdownContracts,
      });
    }
  });

  test('manifest validation contracts resolve against real files', () => {
    const skillNames = readdirSync(skillsDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .filter((skillName) => existsSync(join(skillsDir, skillName, 'config.yaml')));

    for (const skillName of skillNames) {
      const skillDir = join(skillsDir, skillName);
      const manifest = parseManifest(readFileSync(join(skillDir, 'config.yaml'), 'utf8'));
      const validation = objectField(manifest.validation);

      const requiredFiles = stringList(validation.required_files);
      for (const relativePath of requiredFiles) {
        expect(existsSync(join(skillDir, relativePath))).toBe(true);
      }

      if ('json_files' in validation) {
        const jsonFiles = stringList(validation.json_files);
        for (const relativePath of jsonFiles) {
          const raw = readFileSync(join(skillDir, relativePath), 'utf8');
          expect(() => JSON.parse(raw)).not.toThrow();
        }
      }

      if ('markdown_contracts' in validation) {
        const contracts = objectList(validation.markdown_contracts);
        for (const contract of contracts) {
          expect(typeof contract.path).toBe('string');
          const markdownPath = join(skillDir, contract.path as string);
          expect(existsSync(markdownPath)).toBe(true);

          const content = readFileSync(markdownPath, 'utf8');
          const mustContain = stringList(contract.must_contain);
          for (const needle of mustContain) {
            expect(content).toContain(needle);
          }
        }
      }
    }
  });

  test('JSON asset files are structurally valid for their declared purpose', () => {
    const autoresearchEval = JSON.parse(
      readFileSync(join(skillsDir, 'autoresearch-loop', 'assets', 'eval.example.json'), 'utf8'),
    );
    expect(autoresearchEval).toEqual(expect.objectContaining({
      target: expect.any(String),
      objective: expect.any(String),
      metric: expect.any(String),
      max_experiments: expect.any(Number),
      evals: expect.any(Array),
    }));
    expect(autoresearchEval.evals.length).toBeGreaterThan(0);
    for (const entry of autoresearchEval.evals) {
      expect(entry).toEqual(expect.objectContaining({
        name: expect.any(String),
        type: expect.any(String),
      }));
      if (entry.type === 'rule') {
        expect(entry).toEqual(expect.objectContaining({
          rule: expect.any(String),
          path: expect.any(String),
          expected: expect.any(String),
        }));
      }
      if (entry.type === 'llm') {
        expect(entry).toEqual(expect.objectContaining({
          prompt: expect.any(String),
          rubric: expect.any(String),
        }));
      }
    }

    const designPrompts = JSON.parse(
      readFileSync(join(skillsDir, 'design-style', 'assets', 'test-prompts.json'), 'utf8'),
    );
    expect(designPrompts).toEqual(expect.objectContaining({
      prompts: expect.any(Array),
    }));
    expect(designPrompts.prompts.length).toBeGreaterThanOrEqual(10);
    for (const prompt of designPrompts.prompts) {
      expect(prompt).toEqual(expect.objectContaining({
        id: expect.any(String),
        category: expect.any(String),
        prompt: expect.any(String),
        checks: expect.any(Array),
      }));
      expect(prompt.checks.length).toBeGreaterThan(0);
      if ('expected_scene' in prompt) {
        expect(prompt.expected_scene).toEqual(expect.any(String));
      }
      if ('expected_bucket' in prompt) {
        expect(prompt.expected_bucket).toEqual(expect.any(String));
      }
      if ('must_reject_mix' in prompt) {
        expect(typeof prompt.must_reject_mix).toBe('boolean');
      }
    }
  });

  test('design-style bundles its visual preview and design references', () => {
    const designStyleDir = join(skillsDir, 'design-style');
    const designsDir = join(designStyleDir, 'references', 'designs');
    const designReferences = readdirSync(designsDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .filter((entry) => existsSync(join(designsDir, entry.name, 'DESIGN.md')));

    expect(existsSync(join(designStyleDir, 'config.yaml'))).toBe(true);
    expect(existsSync(join(designStyleDir, 'assets', 'preview.html'))).toBe(true);
    expect(existsSync(join(designStyleDir, 'references', 'style-selection-guide.md'))).toBe(true);
    expect(existsSync(join(designStyleDir, 'references', 'scene-templates.md'))).toBe(true);
    expect(existsSync(join(designStyleDir, 'references', 'critique-guide.md'))).toBe(true);
    expect(existsSync(join(designStyleDir, 'assets', 'output-checklist.md'))).toBe(true);
    expect(existsSync(join(designStyleDir, 'assets', 'test-prompts.json'))).toBe(true);
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

  test('README skill descriptions stay aligned with manifest docs.summary', () => {
    const readme = readFileSync(join(process.cwd(), 'README.md'), 'utf8');
    const rows = parseMarkdownTable(
      readme,
      '| Skill | Claude Code standalone | Claude Code plugin | Codex | Project alias | Description |',
    );

    const descriptions = Object.fromEntries(
      rows.map((row) => [row.Skill.replace(/[`]/g, ''), row.Description]),
    );

    for (const skillName of readdirSync(skillsDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .filter((skillName) => existsSync(join(skillsDir, skillName, 'config.yaml')))) {
      const manifest = parseManifest(readFileSync(join(skillsDir, skillName, 'config.yaml'), 'utf8'));
      const docs = objectField(manifest.docs);
      expect(descriptions[skillName]).toBe(docs.summary);
    }
  });

  test('README skill artifacts stay aligned with manifest docs.artifacts', () => {
    const readme = readFileSync(join(process.cwd(), 'README.md'), 'utf8');
    const rows = parseMarkdownTable(
      readme,
      '| Skill | 适合处理 | 不适合处理 | 主要产物 |',
    );

    const artifactsBySkill = Object.fromEntries(
      rows.map((row) => [row.Skill.replace(/\[|\]|\(.+?\)|`/g, ''), row['主要产物']]),
    );

    for (const skillName of readdirSync(skillsDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .filter((skillName) => existsSync(join(skillsDir, skillName, 'config.yaml')))) {
      const manifest = parseManifest(readFileSync(join(skillsDir, skillName, 'config.yaml'), 'utf8'));
      const docs = objectField(manifest.docs);
      const artifacts = stringList(docs.artifacts);
      const readmeArtifacts = artifactsBySkill[skillName];

      expect(readmeArtifacts).toEqual(expect.any(String));
      for (const artifact of artifacts) {
        expect(readmeArtifacts).toContain(artifact);
      }
    }
  });

  test('README skill boundary rows stay aligned with manifest docs.handles and docs.not_for', () => {
    const readme = readFileSync(join(process.cwd(), 'README.md'), 'utf8');
    const rows = parseMarkdownTable(
      readme,
      '| Skill | 适合处理 | 不适合处理 | 主要产物 |',
    );

    const rowsBySkill = Object.fromEntries(
      rows.map((row) => [row.Skill.replace(/\[|\]|\(.+?\)|`/g, ''), row]),
    );

    for (const skillName of readdirSync(skillsDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .filter((skillName) => existsSync(join(skillsDir, skillName, 'config.yaml')))) {
      const manifest = parseManifest(readFileSync(join(skillsDir, skillName, 'config.yaml'), 'utf8'));
      const docs = objectField(manifest.docs);
      const row = rowsBySkill[skillName];

      expect(row).toEqual(expect.any(Object));
      expect(row['适合处理']).toBe(docs.handles);
      expect(row['不适合处理']).toBe(docs.not_for);
    }
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
      '.danny/knowledge-base',
      '~/.danny',
      'knowledge-base/storage-model',
    ];
    const skillFiles = readdirSync(skillsDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => join(skillsDir, entry.name, 'SKILL.md'));

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

    expect(existsSync(join(autoresearchDir, 'config.yaml'))).toBe(true);
    expect(existsSync(join(autoresearchDir, 'references', 'eval-format.md'))).toBe(true);
    expect(existsSync(join(autoresearchDir, 'assets', 'eval.example.json'))).toBe(true);
  });

  test('autoresearch-loop includes skill quality ratchet references', () => {
    const autoresearchDir = join(skillsDir, 'autoresearch-loop');
    const content = readFileSync(join(autoresearchDir, 'SKILL.md'), 'utf8');
    const evalFormat = readFileSync(join(autoresearchDir, 'references', 'eval-format.md'), 'utf8');
    const rubric = readFileSync(join(autoresearchDir, 'references', 'skill-quality-rubric.md'), 'utf8');
    const evaluator = readFileSync(join(autoresearchDir, 'references', 'evaluator-protocol.md'), 'utf8');
    const hitl = readFileSync(join(autoresearchDir, 'references', 'hitl-review-template.md'), 'utf8');

    expect(content).toContain('Skill 质量棘轮');
    expect(evalFormat).toContain('## Top-Level Fields');
    expect(evalFormat).toContain('## Rule Eval');
    expect(evalFormat).toContain('## LLM Eval');
    expect(evalFormat).toContain('## Decision Rule');
    expect(rubric).toContain('100');
    expect(rubric).toContain('Structure Score');
    expect(rubric).toContain('Effect Score');
    expect(rubric).toContain('Frontmatter');
    expect(rubric).toContain('Real prompt output quality');
    expect(evaluator).toContain('independent evaluator');
    expect(evaluator).toContain('## Inputs');
    expect(evaluator).toContain('## Required Output');
    expect(evaluator).toContain('## Independence Rules');
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
    const paperTemplate = readFileSync(join(skillDir, 'references', 'paper-analysis-template.md'), 'utf8');
    const openSourceTemplate = readFileSync(join(skillDir, 'references', 'open-source-evaluation-template.md'), 'utf8');
    const businessFitTemplate = readFileSync(join(skillDir, 'references', 'business-fit-template.md'), 'utf8');
    const implementationTemplate = readFileSync(join(skillDir, 'references', 'implementation-proposal-template.md'), 'utf8');
    const workspaceExample = readFileSync(join(skillDir, 'assets', 'research-workspace.example.md'), 'utf8');

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

    expect(existsSync(join(skillDir, 'config.yaml'))).toBe(true);
    for (const template of [
      'paper-analysis-template.md',
      'open-source-evaluation-template.md',
      'business-fit-template.md',
      'implementation-proposal-template.md',
    ]) {
      expect(existsSync(join(skillDir, 'references', template))).toBe(true);
    }

    expect(existsSync(join(skillDir, 'assets', 'research-workspace.example.md'))).toBe(true);
    expect(paperTemplate).toContain('# Paper Analysis:');
    expect(paperTemplate).toContain('## Bibliography');
    expect(paperTemplate).toContain('## Problem');
    expect(paperTemplate).toContain('## Method');
    expect(paperTemplate).toContain('## Evidence');
    expect(paperTemplate).toContain('## Engineering Translation');
    expect(paperTemplate).toContain('## Fit Notes');
    expect(openSourceTemplate).toContain('# Open Source Candidate:');
    expect(openSourceTemplate).toContain('## Identity');
    expect(openSourceTemplate).toContain('## Health');
    expect(openSourceTemplate).toContain('## Technical Fit');
    expect(openSourceTemplate).toContain('## Risk');
    expect(openSourceTemplate).toContain('## Decision');
    expect(businessFitTemplate).toContain('# Business Fit:');
    expect(businessFitTemplate).toContain('## Current Workflow');
    expect(businessFitTemplate).toContain('## Opportunity');
    expect(businessFitTemplate).toContain('## Brainstormed Use Cases');
    expect(businessFitTemplate).toContain('## Constraints');
    expect(businessFitTemplate).toContain('## Decision');
    expect(implementationTemplate).toContain('# Implementation Proposal:');
    expect(implementationTemplate).toContain('## Goal');
    expect(implementationTemplate).toContain('## MVP Scope');
    expect(implementationTemplate).toContain('## Architecture');
    expect(implementationTemplate).toContain('## Validation');
    expect(implementationTemplate).toContain('## Risks');
    expect(implementationTemplate).toContain('## Coding Handoff');
    expect(workspaceExample).toContain('## Research Brief');
    expect(workspaceExample).toContain('## Paper Matrix');
    expect(workspaceExample).toContain('## Open Source Candidates');
    expect(workspaceExample).toContain('## Business Fit');
    expect(workspaceExample).toContain('## Implementation Proposal');
  });

  test('self-improvement records can be retrieved and applied by future agents', () => {
    const skillDir = join(skillsDir, 'self-improvement');
    const content = readFileSync(join(skillDir, 'SKILL.md'), 'utf8');
    const config = readFileSync(join(skillDir, 'config.yaml'), 'utf8');
    const referencePatterns = readFileSync(join(skillDir, 'references', 'PATTERNS.md'), 'utf8');
    const patterns = readFileSync(
      join(process.cwd(), '.danny', 'knowledge-base', 'learnings', 'patterns', 'PATTERNS.md'),
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
    expect(referencePatterns).toContain('# Pattern Index');
    expect(referencePatterns).toContain('## Command Patterns');
    expect(referencePatterns).toContain('## Error Patterns');
    expect(patterns).toContain('Agent 使用入口');
    expect(patterns).toContain('优先使用 `pnpm`');
  });

  test('knowledge-distill defines distillation categories and storage contracts', () => {
    const skillDir = join(skillsDir, 'knowledge-distill');
    const content = readFileSync(join(skillDir, 'SKILL.md'), 'utf8');

    expect(existsSync(join(skillDir, 'config.yaml'))).toBe(true);
    expect(content).toContain('### 1. 概念与定义 (Concepts)');
    expect(content).toContain('### 2. 最佳实践 (Best Practices)');
    expect(content).toContain('### 3. 决策记录 (Decisions)');
    expect(content).toContain('### 4. 教训与坑点 (Lessons Learned)');
    expect(content).toContain('<project-knowledge-base>/distilled/');
    expect(content).toContain('├── concepts/');
    expect(content).toContain('├── best-practices/');
    expect(content).toContain('├── decisions/');
    expect(content).toContain('└── lessons/');
  });

  test('inspiration-box defines capture states and workspace structure', () => {
    const skillDir = join(skillsDir, 'inspiration-box');
    const content = readFileSync(join(skillDir, 'SKILL.md'), 'utf8');

    expect(existsSync(join(skillDir, 'config.yaml'))).toBe(true);
    expect(content).toContain('### 1. 灵感生命周期');
    expect(content).toContain('### 2. 灵感状态');
    expect(content).toContain('<project-knowledge-base>/');
    expect(content).toContain('├── inbox/inspiration/');
    expect(content).toContain('└── ideas/');
    expect(content).toContain('├── feature/');
    expect(content).toContain('├── tech/');
    expect(content).toContain('├── process/');
    expect(content).toContain('└── exploration/');
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

    expect(existsSync(join(skillDir, 'config.yaml'))).toBe(true);
    const examples = readFileSync(join(skillDir, 'references', 'examples.md'), 'utf8');
    expect(examples).toContain('andrej-karpathy-skills');
    expect(examples).toContain('# Coding Guardrails Examples');
    expect(examples).toContain('## Hidden assumptions');
    expect(examples).toContain('## Over-abstraction');
    expect(examples).toContain('## Drive-by refactor');
    expect(examples).toContain('## Vague goal vs verifiable goal');
    expect(examples.toLowerCase()).toContain('hidden assumptions');
    expect(examples.toLowerCase()).toContain('over-abstraction');
    expect(examples.toLowerCase()).toContain('drive-by refactor');
  });

  test('using-danny documents danny skill routing and onboarding', () => {
    const skillDir = join(skillsDir, 'using-danny');
    const content = readFileSync(join(skillDir, 'SKILL.md'), 'utf8');
    const metadata = parseFrontmatter(content);

    expect(metadata.name).toBe('using-danny');
    expect(metadata.trigger).toBe('/using-danny');
    expect(metadata.description).toMatch(/^Use when\b/);
    expect(metadata.supported_tools).toEqual(['claude-code', 'codex', 'cursor', 'opencode']);
    expect(existsSync(join(skillDir, 'config.yaml'))).toBe(true);

    for (const requiredTerm of [
      'Claude Code',
      'Codex',
      'Cursor',
      '每个 skill 都可以独立使用',
      '<project-knowledge-base>',
      'inspiration-box',
      'research-to-implementation',
      'self-improvement',
    ]) {
      expect(content).toContain(requiredTerm);
    }

    for (const section of [
      '## 快速入口',
      '## 选择哪个 skill',
      '## 安装和激活',
      '## 知识库占位符',
      '## 使用原则',
      '## 常见组合',
    ]) {
      expect(content).toContain(section);
    }
  });

  test('using-danny is the only danny onboarding skill name', () => {
    const searchableFiles = [
      'README.md',
      'skills/using-danny/SKILL.md',
    ];

    for (const file of searchableFiles) {
      const content = readFileSync(join(process.cwd(), file), 'utf8');
      expect(content).not.toContain('/use-danny');
      expect(content).not.toContain('$use-danny');
      expect(content).not.toContain('skills/use-danny');
    }

    expect(existsSync(join(skillsDir, 'use-danny'))).toBe(false);
    expect(existsSync(join(skillsDir, 'using-danny', 'SKILL.md'))).toBe(true);
  });
});
