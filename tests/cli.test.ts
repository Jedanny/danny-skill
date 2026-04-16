import { describe, expect, test } from '@jest/globals';
import { execFileSync } from 'child_process';
import { cpSync, existsSync, mkdtempSync, readFileSync, lstatSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const cli = join(process.cwd(), 'packages', 'cli', 'danny-skill.mjs');

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
  test('validate checks the repository skill layout', () => {
    const output = runCli(['validate']);

    expect(output).toContain('valid');
    expect(output).toContain('skills');
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

    const configPath = join(root, '.danny-skill', 'config.json');
    expect(existsSync(configPath)).toBe(true);

    const config = JSON.parse(readFileSync(configPath, 'utf8'));
    expect(config.knowledge_base.project).toBe('.custom/knowledge');
    expect(config.knowledge_base.global).toBe('~/custom-knowledge');
  });

  test('knowledge init creates project knowledge directories and patterns index', () => {
    const root = tempRoot();

    runCli(['knowledge', 'init', '--project', '--target-root', root]);

    expect(existsSync(join(root, '.danny-skill', 'knowledge-base', 'inbox', 'inspiration'))).toBe(true);
    expect(existsSync(join(root, '.danny-skill', 'knowledge-base', 'ideas'))).toBe(true);
    expect(existsSync(join(root, '.danny-skill', 'knowledge-base', 'learnings', 'patterns', 'PATTERNS.md'))).toBe(true);
    expect(readFileSync(join(root, '.danny-skill', 'knowledge-base', 'learnings', 'patterns', 'PATTERNS.md'), 'utf8')).toContain('Agent 使用入口');
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
    expect(lstatSync(skillDir).isSymbolicLink()).toBe(false);
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

    expect(existsSync(join(root, '.agents', 'skills', 'coding-guardrails', 'references', 'examples.md'))).toBe(true);
    expect(existsSync(join(root, '.agents', 'skills', 'design-style', 'assets', 'preview.html'))).toBe(true);
    expect(existsSync(join(root, '.agents', 'skills', 'design-style', 'references', 'designs'))).toBe(false);
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

  test('alias generate creates Claude Code command wrappers for trigger aliases', () => {
    const root = tempRoot();

    runCli(['alias', 'generate', '--tool', 'claude-code', '--target-root', root]);

    const aliasPath = join(root, '.claude', 'commands', 'danny-idea.md');
    expect(existsSync(aliasPath)).toBe(true);
    expect(readFileSync(aliasPath, 'utf8')).toContain('/inspiration-box');
    expect(readFileSync(aliasPath, 'utf8')).toContain('$ARGUMENTS');
    expect(existsSync(join(root, '.claude', 'commands', 'danny-distill.md'))).toBe(true);
    expect(existsSync(join(root, '.claude', 'commands', 'danny-learn.md'))).toBe(true);
  });

  test('alias generate creates Cursor command wrappers for trigger aliases', () => {
    const root = tempRoot();

    runCli(['alias', 'generate', '--tool', 'cursor', '--target-root', root]);

    const aliasPath = join(root, '.cursor', 'commands', 'danny-distill.md');
    expect(existsSync(aliasPath)).toBe(true);
    expect(readFileSync(aliasPath, 'utf8')).toContain('knowledge-distill');
    expect(readFileSync(aliasPath, 'utf8')).toContain('$ARGUMENTS');
  });

  test('sync updates plugin manifests from package metadata', () => {
    const root = tempRoot();

    runCli(['sync', '--target-root', root]);

    const claudeManifest = JSON.parse(readFileSync(join(root, '.claude-plugin', 'plugin.json'), 'utf8'));
    const cursorManifest = JSON.parse(readFileSync(join(root, '.cursor-plugin', 'plugin.json'), 'utf8'));
    const marketplace = JSON.parse(readFileSync(join(root, '.claude-plugin', 'marketplace.json'), 'utf8'));

    expect(claudeManifest.name).toBe('danny-skill');
    expect(claudeManifest.version).toBe('1.0.0');
    expect(cursorManifest.version).toBe('1.0.0');
    expect(marketplace.plugins[0].version).toBe('1.0.0');
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

  test('packaged CLI can run directly from bundled dist skills', () => {
    const root = tempRoot();
    const packageRoot = join(root, 'package');

    runCli(['package', '--target-root', packageRoot, '--profile', 'minimal']);
    cpSync(join(process.cwd(), 'packages', 'cli', 'danny-skill.mjs'), join(packageRoot, 'danny-skill.mjs'));
    cpSync(join(process.cwd(), 'packages', 'cli', 'index.mjs'), join(packageRoot, 'index.mjs'));
    cpSync(join(process.cwd(), 'packages', 'cli', 'package.json'), join(packageRoot, 'package.json'));

    const output = execFileSync(process.execPath, [join(packageRoot, 'danny-skill.mjs'), 'validate'], {
      cwd: root,
      encoding: 'utf8',
      stdio: 'pipe',
    });

    expect(output).toContain('valid: 7 skills');
  });

  test('packages the CLI as a Rust N-API npm package with JS fallback', () => {
    const packageJsonPath = join(process.cwd(), 'packages', 'cli', 'package.json');
    const cargoToml = readFileSync(join(process.cwd(), 'packages', 'cli', 'Cargo.toml'), 'utf8');
    const rustLib = readFileSync(join(process.cwd(), 'packages', 'cli', 'src', 'lib.rs'), 'utf8');
    const nativeLoader = readFileSync(join(process.cwd(), 'packages', 'cli', 'index.mjs'), 'utf8');
    const binWrapper = readFileSync(join(process.cwd(), 'packages', 'cli', 'bin', 'danny-skill.mjs'), 'utf8');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

    expect(packageJson.name).toBe('@danny-skill/cli');
    expect(packageJson.bin['danny-skill']).toBe('bin/danny-skill.mjs');
    expect(packageJson.files).toContain('dist/');
    expect(packageJson.scripts['prepare:package']).toContain('--target-root . --profile full');
    expect(packageJson.scripts.build).toContain('napi build');
    expect(packageJson.devDependencies['@napi-rs/cli']).toEqual(expect.any(String));
    expect(packageJson.napi.name).toBe('danny_skill_cli');
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
    expect(nativeLoader).toContain('loadNativeBinding');
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
  });
});
