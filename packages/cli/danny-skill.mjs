#!/usr/bin/env node
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { validateSkillsNative } from './index.mjs';

const cliDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(cliDir, '..', '..');

function fail(message) {
  console.error(message);
  process.exit(1);
}

function parseOptions(args) {
  const options = {};
  const positionals = [];

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (!arg.startsWith('--')) {
      positionals.push(arg);
      continue;
    }

    const key = arg.slice(2);
    const next = args[index + 1];

    if (next === undefined || next.startsWith('--')) {
      options[key] = true;
    } else {
      options[key] = next;
      index += 1;
    }
  }

  return { options, positionals };
}

function listSkillNames() {
  const skillsDir = join(repoRoot, 'skills');
  return readdirSync(skillsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

function parseFrontmatter(content) {
  if (!content.startsWith('---\n')) {
    return {};
  }

  const end = content.indexOf('\n---', 4);
  if (end === -1) {
    return {};
  }

  const metadata = {};
  for (const line of content.slice(4, end).split('\n')) {
    const match = line.match(/^([A-Za-z_]+):\s*(.*)$/);
    if (!match) {
      continue;
    }
    metadata[match[1]] = match[2].trim().replace(/^"|"$/g, '');
  }
  return metadata;
}

function skillMetadata(skillName) {
  const skillPath = join(repoRoot, 'skills', skillName, 'SKILL.md');
  return parseFrontmatter(readFileSync(skillPath, 'utf8'));
}

function commandValidate() {
  const nativeResult = validateSkillsNative(repoRoot);
  if (nativeResult) {
    if (!nativeResult.ok) {
      fail(`invalid skills:\n${nativeResult.errors.join('\n')}`);
    }
    console.log(`valid: ${nativeResult.skillCount} skills`);
    return;
  }

  const skillNames = listSkillNames();
  const failures = [];

  for (const skillName of skillNames) {
    const skillPath = join(repoRoot, 'skills', skillName, 'SKILL.md');
    if (!existsSync(skillPath)) {
      failures.push(`${skillName}: missing SKILL.md`);
      continue;
    }

    const metadata = parseFrontmatter(readFileSync(skillPath, 'utf8'));
    if (metadata.name !== skillName) {
      failures.push(`${skillName}: frontmatter name must match directory`);
    }
    if (!metadata.description?.startsWith('Use when')) {
      failures.push(`${skillName}: description must start with "Use when"`);
    }
  }

  if (failures.length > 0) {
    fail(`invalid skills:\n${failures.join('\n')}`);
  }

  console.log(`valid: ${skillNames.length} skills`);
}

function writeJson(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function rootPackageMetadata() {
  const packageJson = readJson(join(repoRoot, 'package.json'));
  return {
    name: packageJson.name,
    version: packageJson.version,
    description: packageJson.description,
  };
}

function commandConfig(args) {
  const { options, positionals } = parseOptions(args);
  if (positionals.join(' ') !== 'paths set') {
    fail('usage: danny-skill config paths set --project <path> --global <path> [--target-root <path>]');
  }

  if (typeof options.project !== 'string' || typeof options.global !== 'string') {
    fail('config paths set requires --project and --global');
  }

  const targetRoot = resolve(String(options['target-root'] ?? process.cwd()));
  writeJson(join(targetRoot, '.danny-skill', 'config.json'), {
    knowledge_base: {
      project: options.project,
      global: options.global,
    },
  });

  console.log(`wrote ${join(targetRoot, '.danny-skill', 'config.json')}`);
}

function readProjectKnowledgePath(targetRoot) {
  const configPath = join(targetRoot, '.danny-skill', 'config.json');
  if (existsSync(configPath)) {
    const config = JSON.parse(readFileSync(configPath, 'utf8'));
    if (typeof config?.knowledge_base?.project === 'string') {
      return config.knowledge_base.project;
    }
  }
  return '.danny-skill/knowledge-base';
}

function ensureKnowledgeTree(basePath) {
  for (const relativePath of [
    'inbox/inspiration',
    'ideas',
    'research',
    'experiments/autoresearch',
    'learnings/errors',
    'learnings/corrections',
    'learnings/successes',
    'learnings/patterns',
    'distilled/concepts',
    'distilled/best-practices',
    'distilled/decisions',
    'distilled/lessons',
  ]) {
    mkdirSync(join(basePath, relativePath), { recursive: true });
  }

  const patternsPath = join(basePath, 'learnings', 'patterns', 'PATTERNS.md');
  if (!existsSync(patternsPath)) {
    writeFileSync(patternsPath, [
      '# Learning Patterns',
      '',
      '## Agent 使用入口',
      '',
      '后续 Agent 执行任务前，先按任务关键词、工具和错误信息扫描本文件。',
      '',
    ].join('\n'));
  }
}

function commandKnowledge(args) {
  const { options, positionals } = parseOptions(args);
  if (positionals[0] !== 'init') {
    fail('usage: danny-skill knowledge init --project [--target-root <path>]');
  }
  if (options.project !== true) {
    fail('knowledge init currently requires --project');
  }

  const targetRoot = resolve(String(options['target-root'] ?? process.cwd()));
  const projectKnowledgePath = readProjectKnowledgePath(targetRoot);
  const basePath = resolve(targetRoot, projectKnowledgePath);
  ensureKnowledgeTree(basePath);
  console.log(`initialized ${basePath}`);
}

function destinationFor(tool, scope, targetRoot) {
  if (tool === 'codex') {
    return join(targetRoot, scope === 'project' ? '.agents/skills' : '.agents/skills');
  }
  if (tool === 'claude-code') {
    return join(targetRoot, scope === 'project' ? '.claude/skills' : '.claude/skills');
  }
  if (tool === 'cursor') {
    if (scope !== 'project') {
      fail('cursor install currently requires --scope project');
    }
    return join(targetRoot, '.cursor');
  }
  fail(`unsupported install tool: ${tool}`);
}

function copyMinimalSkill(skillName, targetDir) {
  const sourceDir = join(repoRoot, 'skills', skillName);
  mkdirSync(targetDir, { recursive: true });
  cpSync(join(sourceDir, 'SKILL.md'), join(targetDir, 'SKILL.md'));

  const configPath = join(sourceDir, 'config.yaml');
  if (existsSync(configPath)) {
    cpSync(configPath, join(targetDir, 'config.yaml'));
  }
}

function copyStandardSkill(skillName, targetDir) {
  const sourceDir = join(repoRoot, 'skills', skillName);
  copyMinimalSkill(skillName, targetDir);

  for (const childName of ['references', 'assets']) {
    const childPath = join(sourceDir, childName);
    if (!existsSync(childPath)) {
      continue;
    }

    if (skillName === 'design-style' && childName === 'references') {
      continue;
    }

    cpSync(childPath, join(targetDir, childName), { recursive: true });
  }
}

function copyProfileSkill(skillName, targetDir, profile) {
  rmSync(targetDir, { recursive: true, force: true });
  if (profile === 'minimal') {
    copyMinimalSkill(skillName, targetDir);
    return;
  }
  if (profile === 'standard') {
    copyStandardSkill(skillName, targetDir);
    return;
  }
  if (profile === 'full') {
    cpSync(join(repoRoot, 'skills', skillName), targetDir, { recursive: true });
    return;
  }
  fail(`unsupported package profile: ${profile}`);
}

function installSkill(skillName, targetDir, mode, profile) {
  const sourceDir = join(repoRoot, 'skills', skillName);
  rmSync(targetDir, { recursive: true, force: true });
  mkdirSync(dirname(targetDir), { recursive: true });

  if (profile === 'minimal') {
    if (mode !== 'copy') {
      fail('minimal profile requires --mode copy');
    }
    copyMinimalSkill(skillName, targetDir);
    return;
  }

  if (profile === 'standard') {
    if (mode !== 'copy') {
      fail('standard profile requires --mode copy');
    }
    copyStandardSkill(skillName, targetDir);
    return;
  }

  if (mode === 'copy') {
    cpSync(sourceDir, targetDir, { recursive: true });
  } else if (mode === 'link') {
    symlinkSync(sourceDir, targetDir, 'dir');
  } else {
    fail(`unsupported install mode: ${mode}`);
  }
}

function commandInstall(args) {
  const { options } = parseOptions(args);
  const tool = String(options.tool ?? '');
  const scope = String(options.scope ?? 'user');
  const profile = String(options.profile ?? 'full');
  const mode = String(options.mode ?? 'link');

  if (!['minimal', 'standard', 'full'].includes(profile)) {
    fail(`unsupported install profile: ${profile}`);
  }
  if (!['user', 'project'].includes(scope)) {
    fail(`unsupported install scope: ${scope}`);
  }

  const defaultTargetRoot = scope === 'user' ? homedir() : process.cwd();
  const targetRoot = resolve(String(options['target-root'] ?? defaultTargetRoot));

  if (tool === 'cursor') {
    installCursorProject(targetRoot, mode, profile);
    console.log(`installed ${profile} profile for cursor at ${join(targetRoot, '.cursor')}`);
    return;
  }

  const destination = destinationFor(tool, scope, targetRoot);
  for (const skillName of listSkillNames()) {
    installSkill(skillName, join(destination, skillName), mode, profile);
  }
  console.log(`installed ${profile} profile for ${tool} at ${destination}`);
}

function copyOrLinkFile(source, target, mode) {
  rmSync(target, { force: true });
  mkdirSync(dirname(target), { recursive: true });
  if (mode === 'copy') {
    cpSync(source, target);
  } else if (mode === 'link') {
    symlinkSync(source, target);
  } else {
    fail(`unsupported install mode: ${mode}`);
  }
}

function installCursorProject(targetRoot, mode, profile) {
  if (profile !== 'full' && mode !== 'copy') {
    fail(`${profile} profile requires --mode copy`);
  }

  const rulesDir = join(targetRoot, '.cursor', 'rules');
  const commandsDir = join(targetRoot, '.cursor', 'commands');
  mkdirSync(rulesDir, { recursive: true });
  mkdirSync(commandsDir, { recursive: true });

  for (const skillName of listSkillNames()) {
    const source = join(repoRoot, 'skills', skillName, 'SKILL.md');
    const target = join(rulesDir, `${skillName}.mdc`);
    copyOrLinkFile(source, target, mode);
  }

  const commandDir = join(repoRoot, 'commands');
  for (const commandName of readdirSync(commandDir).filter((name) => name.endsWith('.md'))) {
    copyOrLinkFile(join(commandDir, commandName), join(commandsDir, commandName), mode);
  }
}

function syncedPluginManifest(baseManifest, metadata) {
  return {
    ...baseManifest,
    name: baseManifest.name ?? 'danny-skill',
    description: metadata.description,
    version: metadata.version,
  };
}

function commandSync(args) {
  const { options } = parseOptions(args);
  const targetRoot = resolve(String(options['target-root'] ?? process.cwd()));
  const metadata = rootPackageMetadata();

  const claudeManifest = syncedPluginManifest(readJson(join(repoRoot, '.claude-plugin', 'plugin.json')), metadata);
  const cursorManifest = syncedPluginManifest(readJson(join(repoRoot, '.cursor-plugin', 'plugin.json')), metadata);
  const marketplace = readJson(join(repoRoot, '.claude-plugin', 'marketplace.json'));
  marketplace.plugins = marketplace.plugins.map((plugin) => ({
    ...plugin,
    version: metadata.version,
    description: metadata.description,
  }));

  writeJson(join(targetRoot, '.claude-plugin', 'plugin.json'), claudeManifest);
  writeJson(join(targetRoot, '.cursor-plugin', 'plugin.json'), cursorManifest);
  writeJson(join(targetRoot, '.claude-plugin', 'marketplace.json'), marketplace);

  console.log(`synced plugin manifests to ${targetRoot}`);
}

function copyDirectoryIfExists(source, target) {
  if (existsSync(source)) {
    rmSync(target, { recursive: true, force: true });
    cpSync(source, target, { recursive: true });
  }
}

function commandPackage(args) {
  const { options } = parseOptions(args);
  const targetRoot = resolve(String(options['target-root'] ?? process.cwd()));
  const profile = String(options.profile ?? 'full');
  if (!['minimal', 'standard', 'full'].includes(profile)) {
    fail(`unsupported package profile: ${profile}`);
  }

  const distDir = join(targetRoot, 'dist');
  rmSync(distDir, { recursive: true, force: true });
  mkdirSync(distDir, { recursive: true });

  for (const skillName of listSkillNames()) {
    copyProfileSkill(skillName, join(distDir, 'skills', skillName), profile);
  }

  copyDirectoryIfExists(join(repoRoot, 'commands'), join(distDir, 'commands'));
  copyDirectoryIfExists(join(repoRoot, '.opencode'), join(distDir, 'opencode'));

  commandSync(['--target-root', distDir]);
  copyDirectoryIfExists(join(distDir, '.claude-plugin'), join(distDir, 'claude-plugin'));
  copyDirectoryIfExists(join(distDir, '.cursor-plugin'), join(distDir, 'cursor-plugin'));
  rmSync(join(distDir, '.claude-plugin'), { recursive: true, force: true });
  rmSync(join(distDir, '.cursor-plugin'), { recursive: true, force: true });

  console.log(`packaged ${profile} profile to ${distDir}`);
}

function aliasTargetDir(tool, targetRoot) {
  if (tool === 'claude-code') {
    return join(targetRoot, '.claude', 'commands');
  }
  if (tool === 'cursor') {
    return join(targetRoot, '.cursor', 'commands');
  }
  fail(`unsupported alias tool: ${tool}`);
}

function aliasContent(tool, trigger, skillName) {
  if (tool === 'claude-code') {
    return [
      `# ${trigger}`,
      '',
      `Use the \`/${skillName}\` skill with the following input:`,
      '',
      '$ARGUMENTS',
      '',
    ].join('\n');
  }

  return [
    `# ${trigger}`,
    '',
    `Use the \`${skillName}\` skill/rule with the following input:`,
    '',
    '$ARGUMENTS',
    '',
  ].join('\n');
}

function commandAlias(args) {
  const { options, positionals } = parseOptions(args);
  if (positionals[0] !== 'generate') {
    fail('usage: danny-skill alias generate --tool <claude-code|cursor> [--target-root <path>]');
  }

  const tool = String(options.tool ?? '');
  const targetRoot = resolve(String(options['target-root'] ?? process.cwd()));
  const targetDir = aliasTargetDir(tool, targetRoot);
  mkdirSync(targetDir, { recursive: true });

  let count = 0;
  for (const skillName of listSkillNames()) {
    const metadata = skillMetadata(skillName);
    if (typeof metadata.trigger !== 'string' || !metadata.trigger.startsWith('/')) {
      continue;
    }
    const aliasName = `${metadata.trigger.slice(1)}.md`;
    writeFileSync(join(targetDir, aliasName), aliasContent(tool, metadata.trigger, skillName));
    count += 1;
  }

  console.log(`generated ${count} aliases for ${tool} at ${targetDir}`);
}

function main(argv) {
  const [command, ...rest] = argv;

  if (command === 'validate') {
    commandValidate();
    return;
  }
  if (command === 'config') {
    commandConfig(rest);
    return;
  }
  if (command === 'knowledge') {
    commandKnowledge(rest);
    return;
  }
  if (command === 'install') {
    commandInstall(rest);
    return;
  }
  if (command === 'sync') {
    commandSync(rest);
    return;
  }
  if (command === 'package') {
    commandPackage(rest);
    return;
  }
  if (command === 'alias') {
    commandAlias(rest);
    return;
  }

  fail('usage: danny-skill <validate|config|knowledge|install|sync|package|alias> ...');
}

main(process.argv.slice(2));
