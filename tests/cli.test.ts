import { describe, expect, test } from '@jest/globals';
import { execFileSync } from 'child_process';
import { cpSync, existsSync, mkdtempSync, readFileSync, lstatSync, mkdirSync, readdirSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const cli = join(process.cwd(), 'packages', 'cli', 'danny-skill.mjs');
const skillCount = readdirSync(join(process.cwd(), 'skills'), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .length;

function tempRoot() {
  return mkdtempSync(join(tmpdir(), 'danny-skill-cli-'));
}

function runCli(args: string[], cwd = process.cwd()) {
  return execFileSync(process.execPath, [cli, ...args], {
    cwd,
    encoding: 'utf8',
    stdio: 'pipe',
  });
}

describe('danny-skill CLI', () => {
  test('prints top-level help with zero exit', () => {
    const output = runCli(['--help']);

    expect(output).toContain('Usage: danny-skill');
    expect(output).toContain('Commands:');
    expect(output).toContain('install');
    expect(output).toContain('alias generate');
  });

  test('supports pnpm-style leading argument separator before help', () => {
    const output = runCli(['--', '--help']);

    expect(output).toContain('Usage: danny-skill');
  });

  test('prints command help with zero exit', () => {
    const output = runCli(['install', '--help']);

    expect(output).toContain('Usage: danny-skill install');
    expect(output).toContain('--profile minimal|standard|full');
    expect(output).toContain('--mode copy|link');
  });

  test('validate checks the repository skill layout', () => {
    const output = runCli(['validate']);

    expect(output).toContain('valid');
    expect(output).toContain('skills');
  });

  test('validate supports machine-readable JSON output on success', () => {
    const output = runCli(['validate', '--json']);
    const result = JSON.parse(output);

    expect(result).toEqual(expect.objectContaining({
      ok: true,
      skillCount: expect.any(Number),
      errorCount: 0,
      errors: [],
      errorsByCategory: {},
    }));
  });

  test('config paths set writes project and global knowledge-base paths', () => {
    const root = tempRoot();

    runCli([
      'config',
      'paths',
      'set',
      '--target-root',
      root,
      '--project',
      '.custom/knowledge',
      '--global',
      '~/custom-knowledge',
    ]);

    const configPath = join(root, '.danny', 'config.json');
    expect(existsSync(configPath)).toBe(true);

    const config = JSON.parse(readFileSync(configPath, 'utf8'));
    expect(config.knowledge_base.project).toBe('.custom/knowledge');
    expect(config.knowledge_base.global).toBe('~/custom-knowledge');
  });

  test('config paths set accepts --system as the system-level knowledge-base alias', () => {
    const root = tempRoot();

    runCli([
      'config',
      'paths',
      'set',
      '--target-root',
      root,
      '--project',
      '.danny/knowledge-base',
      '--system',
      '~/.danny/knowledge-base',
    ]);

    const config = JSON.parse(readFileSync(join(root, '.danny', 'config.json'), 'utf8'));
    expect(config.knowledge_base.project).toBe('.danny/knowledge-base');
    expect(config.knowledge_base.global).toBe('~/.danny/knowledge-base');
  });

  test('knowledge init creates project knowledge directories and patterns index', () => {
    const root = tempRoot();

    runCli(['knowledge', 'init', '--project', '--target-root', root]);

    expect(existsSync(join(root, '.danny', 'knowledge-base', 'inbox', 'inspiration'))).toBe(true);
    expect(existsSync(join(root, '.danny', 'knowledge-base', 'ideas'))).toBe(true);
    expect(existsSync(join(root, '.danny', 'knowledge-base', 'learnings', 'patterns', 'PATTERNS.md'))).toBe(true);
    expect(readFileSync(join(root, '.danny', 'knowledge-base', 'learnings', 'patterns', 'PATTERNS.md'), 'utf8')).toContain('Agent 使用入口');
  });

  test('knowledge init reads legacy .danny-skill config as a migration fallback', () => {
    const root = tempRoot();
    const legacyConfigDir = join(root, '.danny-skill');
    mkdirSync(legacyConfigDir, { recursive: true });
    writeFileSync(join(legacyConfigDir, 'config.json'), JSON.stringify({
      knowledge_base: {
        project: '.legacy/knowledge-base',
        global: '~/legacy-knowledge-base',
      },
    }));

    runCli(['knowledge', 'init', '--project', '--target-root', root]);

    expect(existsSync(join(root, '.legacy', 'knowledge-base', 'learnings', 'patterns', 'PATTERNS.md'))).toBe(true);
  });

  test('install supports minimal profile for Codex project scope', () => {
    const root = tempRoot();

    runCli([
      'install',
      '--tool',
      'codex',
      '--scope',
      'project',
      '--profile',
      'minimal',
      '--target-root',
      root,
      '--mode',
      'copy',
    ]);

    const skillDir = join(root, '.agents', 'skills', 'design-style');
    expect(existsSync(join(skillDir, 'SKILL.md'))).toBe(true);
    expect(existsSync(join(skillDir, 'assets', 'preview.html'))).toBe(false);
    expect(existsSync(join(skillDir, 'assets', 'test-prompts.json'))).toBe(false);
    expect(existsSync(join(skillDir, 'references', 'scene-templates.md'))).toBe(false);
    expect(lstatSync(skillDir).isSymbolicLink()).toBe(false);

    const autoresearchDir = join(root, '.agents', 'skills', 'autoresearch-loop');
    expect(existsSync(join(autoresearchDir, 'SKILL.md'))).toBe(true);
    expect(existsSync(join(autoresearchDir, 'config.yaml'))).toBe(true);
    expect(existsSync(join(autoresearchDir, 'assets', 'eval.example.json'))).toBe(false);
    expect(existsSync(join(autoresearchDir, 'references', 'eval-format.md'))).toBe(false);

    const researchDir = join(root, '.agents', 'skills', 'research-to-implementation');
    expect(existsSync(join(researchDir, 'SKILL.md'))).toBe(true);
    expect(existsSync(join(researchDir, 'config.yaml'))).toBe(true);
    expect(existsSync(join(researchDir, 'assets', 'research-workspace.example.md'))).toBe(false);
    expect(existsSync(join(researchDir, 'references', 'paper-analysis-template.md'))).toBe(false);

    const selfImprovementDir = join(root, '.agents', 'skills', 'self-improvement');
    expect(existsSync(join(selfImprovementDir, 'SKILL.md'))).toBe(true);
    expect(existsSync(join(selfImprovementDir, 'config.yaml'))).toBe(true);
    expect(existsSync(join(selfImprovementDir, 'references', 'PATTERNS.md'))).toBe(false);

    const knowledgeDistillDir = join(root, '.agents', 'skills', 'knowledge-distill');
    expect(existsSync(join(knowledgeDistillDir, 'SKILL.md'))).toBe(true);
    expect(existsSync(join(knowledgeDistillDir, 'config.yaml'))).toBe(true);

    const inspirationDir = join(root, '.agents', 'skills', 'inspiration-box');
    expect(existsSync(join(inspirationDir, 'SKILL.md'))).toBe(true);
    expect(existsSync(join(inspirationDir, 'config.yaml'))).toBe(true);

    const codingGuardrailsDir = join(root, '.agents', 'skills', 'coding-guardrails');
    expect(existsSync(join(codingGuardrailsDir, 'SKILL.md'))).toBe(true);
    expect(existsSync(join(codingGuardrailsDir, 'config.yaml'))).toBe(true);
    expect(existsSync(join(codingGuardrailsDir, 'references', 'examples.md'))).toBe(false);

    const usingDannyDir = join(root, '.agents', 'skills', 'using-danny');
    expect(existsSync(join(usingDannyDir, 'SKILL.md'))).toBe(true);
    expect(existsSync(join(usingDannyDir, 'config.yaml'))).toBe(true);
  });

  test('install supports standard profile without large design reference bundle', () => {
    const root = tempRoot();

    runCli([
      'install',
      '--tool',
      'codex',
      '--scope',
      'project',
      '--profile',
      'standard',
      '--target-root',
      root,
      '--mode',
      'copy',
    ]);

    expect(existsSync(join(root, '.agents', 'skills', 'coding-guardrails', 'config.yaml'))).toBe(true);
    expect(existsSync(join(root, '.agents', 'skills', 'coding-guardrails', 'references', 'examples.md'))).toBe(true);
    expect(existsSync(join(root, '.agents', 'skills', 'design-style', 'assets', 'preview.html'))).toBe(true);
    expect(existsSync(join(root, '.agents', 'skills', 'design-style', 'references', 'style-selection-guide.md'))).toBe(true);
    expect(existsSync(join(root, '.agents', 'skills', 'design-style', 'references', 'scene-templates.md'))).toBe(true);
    expect(existsSync(join(root, '.agents', 'skills', 'design-style', 'references', 'critique-guide.md'))).toBe(true);
    expect(existsSync(join(root, '.agents', 'skills', 'design-style', 'assets', 'output-checklist.md'))).toBe(true);
    expect(existsSync(join(root, '.agents', 'skills', 'design-style', 'assets', 'test-prompts.json'))).toBe(true);
    expect(existsSync(join(root, '.agents', 'skills', 'design-style', 'references', 'designs'))).toBe(false);

    const autoresearchDir = join(root, '.agents', 'skills', 'autoresearch-loop');
    expect(existsSync(join(autoresearchDir, 'SKILL.md'))).toBe(true);
    expect(existsSync(join(autoresearchDir, 'config.yaml'))).toBe(true);
    expect(existsSync(join(autoresearchDir, 'assets', 'eval.example.json'))).toBe(true);
    expect(existsSync(join(autoresearchDir, 'references', 'eval-format.md'))).toBe(true);
    expect(existsSync(join(autoresearchDir, 'references', 'evaluator-protocol.md'))).toBe(true);
    expect(existsSync(join(autoresearchDir, 'references', 'hitl-review-template.md'))).toBe(true);
    expect(existsSync(join(autoresearchDir, 'references', 'skill-quality-rubric.md'))).toBe(true);

    const researchDir = join(root, '.agents', 'skills', 'research-to-implementation');
    expect(existsSync(join(researchDir, 'SKILL.md'))).toBe(true);
    expect(existsSync(join(researchDir, 'config.yaml'))).toBe(true);
    expect(existsSync(join(researchDir, 'assets', 'research-workspace.example.md'))).toBe(true);
    expect(existsSync(join(researchDir, 'references', 'paper-analysis-template.md'))).toBe(true);
    expect(existsSync(join(researchDir, 'references', 'open-source-evaluation-template.md'))).toBe(true);
    expect(existsSync(join(researchDir, 'references', 'business-fit-template.md'))).toBe(true);
    expect(existsSync(join(researchDir, 'references', 'implementation-proposal-template.md'))).toBe(true);

    const selfImprovementDir = join(root, '.agents', 'skills', 'self-improvement');
    expect(existsSync(join(selfImprovementDir, 'SKILL.md'))).toBe(true);
    expect(existsSync(join(selfImprovementDir, 'config.yaml'))).toBe(true);
    expect(existsSync(join(selfImprovementDir, 'references', 'PATTERNS.md'))).toBe(true);

    const knowledgeDistillDir = join(root, '.agents', 'skills', 'knowledge-distill');
    expect(existsSync(join(knowledgeDistillDir, 'SKILL.md'))).toBe(true);
    expect(existsSync(join(knowledgeDistillDir, 'config.yaml'))).toBe(true);

    const inspirationDir = join(root, '.agents', 'skills', 'inspiration-box');
    expect(existsSync(join(inspirationDir, 'SKILL.md'))).toBe(true);
    expect(existsSync(join(inspirationDir, 'config.yaml'))).toBe(true);

    const codingGuardrailsDir = join(root, '.agents', 'skills', 'coding-guardrails');
    expect(existsSync(join(codingGuardrailsDir, 'SKILL.md'))).toBe(true);
    expect(existsSync(join(codingGuardrailsDir, 'config.yaml'))).toBe(true);
    expect(existsSync(join(codingGuardrailsDir, 'references', 'examples.md'))).toBe(true);

    const usingDannyDir = join(root, '.agents', 'skills', 'using-danny');
    expect(existsSync(join(usingDannyDir, 'SKILL.md'))).toBe(true);
    expect(existsSync(join(usingDannyDir, 'config.yaml'))).toBe(true);
  });

  test('install supports full profile with complete skill assets', () => {
    const root = tempRoot();

    runCli([
      'install',
      '--tool',
      'codex',
      '--scope',
      'project',
      '--profile',
      'full',
      '--target-root',
      root,
      '--mode',
      'copy',
    ]);

    expect(existsSync(join(root, '.agents', 'skills', 'design-style', 'references', 'style-selection-guide.md'))).toBe(true);
    expect(existsSync(join(root, '.agents', 'skills', 'design-style', 'references', 'scene-templates.md'))).toBe(true);
    expect(existsSync(join(root, '.agents', 'skills', 'design-style', 'references', 'critique-guide.md'))).toBe(true);
    expect(existsSync(join(root, '.agents', 'skills', 'design-style', 'assets', 'output-checklist.md'))).toBe(true);
    expect(existsSync(join(root, '.agents', 'skills', 'design-style', 'assets', 'test-prompts.json'))).toBe(true);
    expect(existsSync(join(root, '.agents', 'skills', 'design-style', 'references', 'designs'))).toBe(true);
  });

  test('install supports full profile with symlinks', () => {
    const root = tempRoot();

    runCli([
      'install',
      '--tool',
      'codex',
      '--scope',
      'project',
      '--profile',
      'full',
      '--target-root',
      root,
      '--mode',
      'link',
    ]);

    expect(lstatSync(join(root, '.agents', 'skills', 'design-style')).isSymbolicLink()).toBe(true);
  });

  test('install defaults user scope to HOME when target root is omitted', () => {
    const root = tempRoot();
    const projectRoot = tempRoot();

    execFileSync(process.execPath, [
      cli,
      'install',
      '--tool',
      'codex',
      '--scope',
      'user',
      '--profile',
      'minimal',
      '--mode',
      'copy',
    ], {
      cwd: projectRoot,
      env: { ...process.env, HOME: root },
      encoding: 'utf8',
      stdio: 'pipe',
    });

    expect(existsSync(join(root, '.agents', 'skills', 'design-style', 'SKILL.md'))).toBe(true);
    expect(existsSync(join(projectRoot, '.agents', 'skills', 'design-style', 'SKILL.md'))).toBe(false);
  });

  test('install rejects link mode for filtered profiles', () => {
    const root = tempRoot();

    expect(() =>
      runCli([
        'install',
        '--tool',
        'codex',
        '--scope',
        'project',
        '--profile',
        'minimal',
        '--target-root',
        root,
        '--mode',
        'link',
      ]),
    ).toThrow();
  });

  test('install supports Cursor project rules and commands', () => {
    const root = tempRoot();

    runCli([
      'install',
      '--tool',
      'cursor',
      '--scope',
      'project',
      '--profile',
      'standard',
      '--target-root',
      root,
      '--mode',
      'copy',
    ]);

    expect(existsSync(join(root, '.cursor', 'rules', 'design-style.mdc'))).toBe(true);
    expect(readFileSync(join(root, '.cursor', 'rules', 'design-style.mdc'), 'utf8')).toContain('name: design-style');
    expect(existsSync(join(root, '.cursor', 'commands', 'list-designs.md'))).toBe(true);
  });

  test('install rejects Cursor user scope because rules and commands are project-scoped', () => {
    const root = tempRoot();

    expect(() =>
      runCli([
        'install',
        '--tool',
        'cursor',
        '--scope',
        'user',
        '--profile',
        'standard',
        '--target-root',
        root,
        '--mode',
        'copy',
      ]),
    ).toThrow(/cursor install currently requires --scope project/i);
  });

  test('alias generate creates Claude Code command wrappers for trigger aliases', () => {
    const root = tempRoot();

    runCli(['alias', 'generate', '--tool', 'claude-code', '--target-root', root]);

    const aliasPath = join(root, '.claude', 'commands', 'danny-idea.md');
    expect(existsSync(aliasPath)).toBe(true);
    expect(readFileSync(aliasPath, 'utf8')).toContain('/inspiration-box');
    expect(readFileSync(aliasPath, 'utf8')).toContain('$ARGUMENTS');
    expect(existsSync(join(root, '.claude', 'commands', 'danny-distill.md'))).toBe(true);
    expect(existsSync(join(root, '.claude', 'commands', 'danny-learn.md'))).toBe(true);
    expect(existsSync(join(root, '.claude', 'commands', 'danny-understand.md'))).toBe(true);
    expect(existsSync(join(root, '.claude', 'commands', 'danny-review.md'))).toBe(true);
    expect(existsSync(join(root, '.claude', 'commands', 'using-danny.md'))).toBe(true);
    expect(existsSync(join(root, '.claude', 'commands', 'use-danny.md'))).toBe(false);
  });

  test('alias generate creates Cursor command wrappers for trigger aliases', () => {
    const root = tempRoot();

    runCli(['alias', 'generate', '--tool', 'cursor', '--target-root', root]);

    const aliasPath = join(root, '.cursor', 'commands', 'danny-distill.md');
    expect(existsSync(aliasPath)).toBe(true);
    expect(readFileSync(aliasPath, 'utf8')).toContain('knowledge-distill');
    expect(readFileSync(aliasPath, 'utf8')).toContain('$ARGUMENTS');
    expect(existsSync(join(root, '.cursor', 'commands', 'danny-understand.md'))).toBe(true);
    expect(existsSync(join(root, '.cursor', 'commands', 'danny-review.md'))).toBe(true);
    expect(existsSync(join(root, '.cursor', 'commands', 'using-danny.md'))).toBe(true);
    expect(existsSync(join(root, '.cursor', 'commands', 'use-danny.md'))).toBe(false);
  });

  test('sync updates plugin manifests from package metadata', () => {
    const root = tempRoot();

    runCli(['sync', '--target-root', root]);

    const claudeManifest = JSON.parse(readFileSync(join(root, '.claude-plugin', 'plugin.json'), 'utf8'));
    const cursorManifest = JSON.parse(readFileSync(join(root, '.cursor-plugin', 'plugin.json'), 'utf8'));
    const marketplace = JSON.parse(readFileSync(join(root, '.claude-plugin', 'marketplace.json'), 'utf8'));

    expect(claudeManifest.name).toBe('danny-skill');
    expect(claudeManifest.version).toBe('1.1.0');
    expect(cursorManifest.version).toBe('1.1.0');
    expect(marketplace.plugins[0].version).toBe('1.1.0');
  });

  test('package writes distributable plugin artifacts', () => {
    const root = tempRoot();

    runCli(['package', '--target-root', root, '--profile', 'minimal']);

    expect(existsSync(join(root, 'dist', 'claude-plugin', 'plugin.json'))).toBe(true);
    expect(existsSync(join(root, 'dist', 'cursor-plugin', 'plugin.json'))).toBe(true);
    expect(existsSync(join(root, 'dist', 'opencode', 'INSTALL.md'))).toBe(true);
    expect(existsSync(join(root, 'dist', 'skills', 'design-style', 'SKILL.md'))).toBe(true);
    expect(existsSync(join(root, 'dist', 'skills', 'design-style', 'assets', 'preview.html'))).toBe(false);
    expect(existsSync(join(root, 'dist', 'commands', 'list-designs.md'))).toBe(true);
  });

  test('package standard profile keeps lightweight design-style references without the large bundle', () => {
    const root = tempRoot();

    runCli(['package', '--target-root', root, '--profile', 'standard']);

    expect(existsSync(join(root, 'dist', 'skills', 'design-style', 'SKILL.md'))).toBe(true);
    expect(existsSync(join(root, 'dist', 'skills', 'design-style', 'config.yaml'))).toBe(true);
    expect(existsSync(join(root, 'dist', 'skills', 'design-style', 'references', 'style-selection-guide.md'))).toBe(true);
    expect(existsSync(join(root, 'dist', 'skills', 'design-style', 'references', 'scene-templates.md'))).toBe(true);
    expect(existsSync(join(root, 'dist', 'skills', 'design-style', 'references', 'critique-guide.md'))).toBe(true);
    expect(existsSync(join(root, 'dist', 'skills', 'design-style', 'assets', 'output-checklist.md'))).toBe(true);
    expect(existsSync(join(root, 'dist', 'skills', 'design-style', 'assets', 'test-prompts.json'))).toBe(true);
    expect(existsSync(join(root, 'dist', 'skills', 'design-style', 'references', 'designs'))).toBe(false);

    expect(existsSync(join(root, 'dist', 'skills', 'autoresearch-loop', 'SKILL.md'))).toBe(true);
    expect(existsSync(join(root, 'dist', 'skills', 'autoresearch-loop', 'config.yaml'))).toBe(true);
    expect(existsSync(join(root, 'dist', 'skills', 'autoresearch-loop', 'assets', 'eval.example.json'))).toBe(true);
    expect(existsSync(join(root, 'dist', 'skills', 'autoresearch-loop', 'references', 'eval-format.md'))).toBe(true);
    expect(existsSync(join(root, 'dist', 'skills', 'autoresearch-loop', 'references', 'evaluator-protocol.md'))).toBe(true);
    expect(existsSync(join(root, 'dist', 'skills', 'autoresearch-loop', 'references', 'hitl-review-template.md'))).toBe(true);
    expect(existsSync(join(root, 'dist', 'skills', 'autoresearch-loop', 'references', 'skill-quality-rubric.md'))).toBe(true);

    expect(existsSync(join(root, 'dist', 'skills', 'research-to-implementation', 'SKILL.md'))).toBe(true);
    expect(existsSync(join(root, 'dist', 'skills', 'research-to-implementation', 'config.yaml'))).toBe(true);
    expect(existsSync(join(root, 'dist', 'skills', 'research-to-implementation', 'assets', 'research-workspace.example.md'))).toBe(true);
    expect(existsSync(join(root, 'dist', 'skills', 'research-to-implementation', 'references', 'paper-analysis-template.md'))).toBe(true);
    expect(existsSync(join(root, 'dist', 'skills', 'research-to-implementation', 'references', 'open-source-evaluation-template.md'))).toBe(true);
    expect(existsSync(join(root, 'dist', 'skills', 'research-to-implementation', 'references', 'business-fit-template.md'))).toBe(true);
    expect(existsSync(join(root, 'dist', 'skills', 'research-to-implementation', 'references', 'implementation-proposal-template.md'))).toBe(true);

    expect(existsSync(join(root, 'dist', 'skills', 'self-improvement', 'SKILL.md'))).toBe(true);
    expect(existsSync(join(root, 'dist', 'skills', 'self-improvement', 'config.yaml'))).toBe(true);
    expect(existsSync(join(root, 'dist', 'skills', 'self-improvement', 'references', 'PATTERNS.md'))).toBe(true);

    expect(existsSync(join(root, 'dist', 'skills', 'knowledge-distill', 'SKILL.md'))).toBe(true);
    expect(existsSync(join(root, 'dist', 'skills', 'knowledge-distill', 'config.yaml'))).toBe(true);

    expect(existsSync(join(root, 'dist', 'skills', 'inspiration-box', 'SKILL.md'))).toBe(true);
    expect(existsSync(join(root, 'dist', 'skills', 'inspiration-box', 'config.yaml'))).toBe(true);

    expect(existsSync(join(root, 'dist', 'skills', 'coding-guardrails', 'SKILL.md'))).toBe(true);
    expect(existsSync(join(root, 'dist', 'skills', 'coding-guardrails', 'config.yaml'))).toBe(true);
    expect(existsSync(join(root, 'dist', 'skills', 'coding-guardrails', 'references', 'examples.md'))).toBe(true);

    expect(existsSync(join(root, 'dist', 'skills', 'using-danny', 'SKILL.md'))).toBe(true);
    expect(existsSync(join(root, 'dist', 'skills', 'using-danny', 'config.yaml'))).toBe(true);
  });

  test('packaged CLI can run directly from bundled dist skills', () => {
    const root = tempRoot();
    const packageRoot = join(root, 'package');

    runCli(['package', '--target-root', packageRoot, '--profile', 'minimal']);
    cpSync(join(process.cwd(), 'packages', 'cli', 'danny-skill.mjs'), join(packageRoot, 'danny-skill.mjs'));
    cpSync(join(process.cwd(), 'packages', 'cli', 'index.mjs'), join(packageRoot, 'index.mjs'));
    cpSync(join(process.cwd(), 'packages', 'cli', 'manifest.mjs'), join(packageRoot, 'manifest.mjs'));
    cpSync(join(process.cwd(), 'packages', 'cli', 'package.json'), join(packageRoot, 'package.json'));

    const output = execFileSync(process.execPath, [join(packageRoot, 'danny-skill.mjs'), 'validate'], {
      cwd: root,
      encoding: 'utf8',
      stdio: 'pipe',
    });

    expect(output).toContain(`valid: ${skillCount} skills`);
  });

  test('validate fails when a manifest-declared JSON asset is invalid', () => {
    const root = tempRoot();
    const packageRoot = join(root, 'package');

    runCli(['package', '--target-root', packageRoot, '--profile', 'standard']);
    cpSync(join(process.cwd(), 'packages', 'cli', 'danny-skill.mjs'), join(packageRoot, 'danny-skill.mjs'));
    cpSync(join(process.cwd(), 'packages', 'cli', 'index.mjs'), join(packageRoot, 'index.mjs'));
    cpSync(join(process.cwd(), 'packages', 'cli', 'manifest.mjs'), join(packageRoot, 'manifest.mjs'));
    cpSync(join(process.cwd(), 'packages', 'cli', 'package.json'), join(packageRoot, 'package.json'));

    writeFileSync(
      join(packageRoot, 'dist', 'skills', 'autoresearch-loop', 'assets', 'eval.example.json'),
      '{\n',
    );

    expect(() => execFileSync(process.execPath, [join(packageRoot, 'danny-skill.mjs'), 'validate'], {
      cwd: root,
      encoding: 'utf8',
      stdio: 'pipe',
    })).toThrow(/\[json_files\] invalid json file assets\/eval\.example\.json/);
  });

  test('validate supports machine-readable JSON output on failure', () => {
    const root = tempRoot();
    const packageRoot = join(root, 'package');

    runCli(['package', '--target-root', packageRoot, '--profile', 'standard']);
    cpSync(join(process.cwd(), 'packages', 'cli', 'danny-skill.mjs'), join(packageRoot, 'danny-skill.mjs'));
    cpSync(join(process.cwd(), 'packages', 'cli', 'index.mjs'), join(packageRoot, 'index.mjs'));
    cpSync(join(process.cwd(), 'packages', 'cli', 'manifest.mjs'), join(packageRoot, 'manifest.mjs'));
    cpSync(join(process.cwd(), 'packages', 'cli', 'package.json'), join(packageRoot, 'package.json'));

    writeFileSync(
      join(packageRoot, 'dist', 'skills', 'autoresearch-loop', 'assets', 'eval.example.json'),
      '{\n',
    );

    try {
      execFileSync(process.execPath, [join(packageRoot, 'danny-skill.mjs'), 'validate', '--json'], {
        cwd: root,
        encoding: 'utf8',
        stdio: 'pipe',
      });
      throw new Error('validate --json was expected to fail');
    } catch (error) {
      const stderr = String((error as { stderr?: string }).stderr ?? '');
      const result = JSON.parse(stderr);

      expect(result.ok).toBe(false);
      expect(result.skillCount).toBe(skillCount);
      expect(result.errorCount).toBeGreaterThan(0);
      expect(Array.isArray(result.errors)).toBe(true);
      expect(result.errors).toContain('autoresearch-loop: [json_files] invalid json file assets/eval.example.json');
      expect(result.errorsByCategory).toEqual(expect.objectContaining({
        json_files: expect.arrayContaining([
          'autoresearch-loop: [json_files] invalid json file assets/eval.example.json',
        ]),
      }));
    }
  });

  test('packages the CLI as a Rust N-API npm package with JS fallback', () => {
    const packageJsonPath = join(process.cwd(), 'packages', 'cli', 'package.json');
    const cargoToml = readFileSync(join(process.cwd(), 'packages', 'cli', 'Cargo.toml'), 'utf8');
    const rustLib = readFileSync(join(process.cwd(), 'packages', 'cli', 'src', 'lib.rs'), 'utf8');
    const nativeLoader = readFileSync(join(process.cwd(), 'packages', 'cli', 'index.mjs'), 'utf8');
    const binWrapper = readFileSync(join(process.cwd(), 'packages', 'cli', 'bin', 'danny-skill.mjs'), 'utf8');
    const template = readFileSync(join(process.cwd(), 'packages', 'cli', 'templates', 'PATTERNS.md'), 'utf8');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

    expect(packageJson.name).toBe('@dannyok/cli');
    expect(packageJson.version).toBe('1.1.0');
    expect(packageJson.repository.url).toBe('git+https://github.com/Jedanny/danny-skill.git');
    expect(packageJson.repository.directory).toBe('packages/cli');
    expect(packageJson.bin['danny-skill']).toBe('bin/danny-skill.mjs');
    expect(packageJson.files).toContain('manifest.mjs');
    expect(packageJson.files).toContain('dist/');
    expect(packageJson.files).toContain('templates/');
    expect(packageJson.scripts['prepare:package']).toContain('--target-root . --profile full');
    expect(packageJson.scripts.build).toContain('napi build --platform --release');
    expect(packageJson.scripts['build:debug']).toContain('napi build --platform');
    expect(packageJson.devDependencies['@napi-rs/cli']).toEqual(expect.any(String));
    expect(packageJson.napi.binaryName).toBe('danny_skill_cli');
    expect(packageJson.napi.name).toBeUndefined();
    expect(packageJson.napi.triples).toBeUndefined();
    expect(packageJson.napi.targets).toEqual(
      expect.arrayContaining([
        'x86_64-apple-darwin',
        'aarch64-apple-darwin',
        'x86_64-pc-windows-msvc',
        'x86_64-unknown-linux-gnu',
        'aarch64-unknown-linux-gnu',
      ]),
    );
    expect(cargoToml).toContain('crate-type = ["cdylib"]');
    expect(cargoToml).toContain('napi');
    expect(cargoToml).toContain('napi-derive');
    expect(rustLib).toContain('#[napi]');
    expect(rustLib).toContain('validate_skills');
    expect(rustLib).toContain('write_config_paths');
    expect(rustLib).toContain('init_project_knowledge');
    expect(rustLib).toContain('sync_plugin_manifests');
    expect(rustLib).toContain('generate_aliases');
    expect(rustLib).toContain('build_package_plan');
    expect(rustLib).toContain('include_str!("../templates/PATTERNS.md")');
    expect(nativeLoader).toContain('loadNativeBinding');
    expect(nativeLoader).toContain("DANNY_SKILL_DISABLE_NATIVE === '1'");
    expect(nativeLoader).toContain('validateSkillsNative');
    expect(nativeLoader).toContain('writeConfigPathsNative');
    expect(nativeLoader).toContain('initProjectKnowledgeNative');
    expect(nativeLoader).toContain('syncPluginManifestsNative');
    expect(nativeLoader).toContain('generateAliasesNative');
    expect(nativeLoader).toContain('buildPackagePlanNative');
    expect(nativeLoader).toContain('nativeBindingCandidates');
    expect(nativeLoader).toContain('linux-x64-gnu');
    expect(nativeLoader).toContain('darwin-arm64');
    expect(nativeLoader).toContain('win32-x64-msvc');
    expect(binWrapper).toContain("import '../danny-skill.mjs'");
    expect(template).toContain('Agent 使用入口');
  });
});
