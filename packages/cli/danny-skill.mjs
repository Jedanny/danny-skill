#!/usr/bin/env node
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';
import {
  buildPackagePlanNative,
  generateAliasesNative,
  initProjectKnowledgeNative,
  syncPluginManifestsNative,
  validateSkillsNative,
  writeConfigPathsNative,
} from './index.mjs';
import { parsePackagingIncludeList as parsePackagingIncludeListShared, parseValidationSpec as parseValidationSpecShared } from './manifest.mjs';

const cliDir = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = resolve(cliDir, '..', '..');
const packageDistRoot = join(cliDir, 'dist');
const repoRoot = existsSync(join(packageDistRoot, 'skills')) ? packageDistRoot : workspaceRoot;
const configDirectory = '.danny';
const legacyConfigDirectory = '.danny-skill';
const defaultProjectKnowledgePath = '.danny/knowledge-base';

function fail(message) {
  console.error(message);
  process.exit(1);
}

function printHelp(command = '') {
  const help = {
    '': `Usage: danny-skill <command> [options]

Commands:
  validate                      Check skill frontmatter and layout
  config paths set              Write knowledge-base path mappings
  knowledge init                Initialize project knowledge directories
  install                       Install skills for Claude Code, Codex, or Cursor
  alias generate                Generate tool command aliases from skill triggers
  sync                          Sync plugin manifests from package metadata
  package                       Generate distributable dist artifacts

Run "danny-skill <command> --help" for command options.
`,
    install: `Usage: danny-skill install --tool <claude-code|codex|cursor> [options]

Options:
  --scope user|project          Install scope (default: user)
  --profile minimal|standard|full
  --mode copy|link              minimal/standard require copy; full supports copy or link
  --target-root <path>          Override HOME/user root or project root
`,
    config: `Usage: danny-skill config paths set --project <path> (--global <path>|--system <path>) [--target-root <path>]`,
    knowledge: `Usage: danny-skill knowledge init --project [--target-root <path>]`,
    alias: `Usage: danny-skill alias generate --tool <claude-code|cursor> [--target-root <path>]`,
    package: `Usage: danny-skill package [--profile minimal|standard|full] [--target-root <path>]`,
    sync: `Usage: danny-skill sync [--target-root <path>]`,
    validate: `Usage: danny-skill validate [--json]`,
  };

  console.log(help[command] ?? help['']);
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

function skillPackagingIncludeList(skillName, profile) {
  const configPath = join(repoRoot, 'skills', skillName, 'config.yaml');
  if (!existsSync(configPath)) {
    return null;
  }

  return parsePackagingIncludeListShared(readFileSync(configPath, 'utf8'), profile);
}

function pushValidationFailure(failures, skillName, category, message) {
  failures.push(`${skillName}: [${category}] ${message}`);
}

function groupValidationErrors(errors) {
  const grouped = {};

  for (const error of errors) {
    const match = error.match(/^\s*[^:]+:\s+\[([^\]]+)\]\s+/);
    const category = match?.[1] ?? 'unknown';
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(error);
  }

  return grouped;
}

function validationJsonPayload(skillCount, errors) {
  return {
    ok: errors.length === 0,
    skillCount,
    errorCount: errors.length,
    errors,
    errorsByCategory: groupValidationErrors(errors),
  };
}

function copyManifestSkill(skillName, targetDir, profile) {
  const sourceDir = join(repoRoot, 'skills', skillName);
  const includeList = skillPackagingIncludeList(skillName, profile);
  if (!includeList) {
    return false;
  }

  mkdirSync(targetDir, { recursive: true });

  for (const includePath of includeList) {
    if (includePath === '**') {
      cpSync(sourceDir, targetDir, { recursive: true });
      continue;
    }

    const normalizedPath = includePath.replace(/\/$/, '');
    const sourcePath = join(sourceDir, normalizedPath);
    const targetPath = join(targetDir, normalizedPath);
    if (!existsSync(sourcePath)) {
      continue;
    }

    mkdirSync(dirname(targetPath), { recursive: true });
    cpSync(sourcePath, targetPath, { recursive: true });
  }

  return true;
}

function commandValidate() {
  const { options } = parseOptions(process.argv.slice(2));
  const jsonOutput = options.json === true;
  const packagedValidation = repoRoot === packageDistRoot;
  const nativeResult = validateSkillsNative(repoRoot);
  if (nativeResult) {
    if (!nativeResult.ok) {
      if (jsonOutput) {
        console.error(`${JSON.stringify(
          {
            ok: false,
            skillCount: nativeResult.skillCount,
            errorCount: nativeResult.errorCount ?? nativeResult.errors.length,
            errors: nativeResult.errors,
            errorsByCategory: nativeResult.errorsByCategory ?? groupValidationErrors(nativeResult.errors),
          },
          null,
          2,
        )}\n`);
        process.exit(1);
      }
      fail(`invalid skills:\n${nativeResult.errors.join('\n')}`);
    }
    if (jsonOutput) {
      console.log(JSON.stringify({
        ok: true,
        skillCount: nativeResult.skillCount,
        errorCount: nativeResult.errorCount ?? 0,
        errors: [],
        errorsByCategory: nativeResult.errorsByCategory ?? {},
      }, null, 2));
      return;
    }
    console.log(`valid: ${nativeResult.skillCount} skills`);
    return;
  }

  const skillNames = listSkillNames();
  const failures = [];

  for (const skillName of skillNames) {
    const skillDir = join(repoRoot, 'skills', skillName);
    const skillPath = join(skillDir, 'SKILL.md');
    if (!existsSync(skillPath)) {
      pushValidationFailure(failures, skillName, 'structure', 'missing SKILL.md');
      continue;
    }

    const metadata = parseFrontmatter(readFileSync(skillPath, 'utf8'));
    if (metadata.name !== skillName) {
      pushValidationFailure(failures, skillName, 'frontmatter', 'frontmatter name must match directory');
    }
    if (!metadata.description?.startsWith('Use when')) {
      pushValidationFailure(failures, skillName, 'frontmatter', 'description must start with "Use when"');
    }

    const configPath = join(skillDir, 'config.yaml');
    if (!existsSync(configPath)) {
      continue;
    }

    const validation = parseValidationSpecShared(readFileSync(configPath, 'utf8'));
    for (const relativePath of validation.requiredFiles) {
      if (!existsSync(join(skillDir, relativePath)) && !packagedValidation) {
        pushValidationFailure(failures, skillName, 'required_files', `missing required file ${relativePath}`);
      }
    }

    for (const relativePath of validation.jsonFiles) {
      const jsonPath = join(skillDir, relativePath);
      if (!existsSync(jsonPath)) {
        if (!packagedValidation) {
          pushValidationFailure(failures, skillName, 'json_files', `missing json file ${relativePath}`);
        }
        continue;
      }

      try {
        JSON.parse(readFileSync(jsonPath, 'utf8'));
      } catch {
        pushValidationFailure(failures, skillName, 'json_files', `invalid json file ${relativePath}`);
      }
    }

    for (const contract of validation.markdownContracts) {
      const markdownPath = join(skillDir, contract.path);
      if (!existsSync(markdownPath)) {
        if (!packagedValidation) {
          pushValidationFailure(failures, skillName, 'markdown_contracts', `missing markdown contract file ${contract.path}`);
        }
        continue;
      }

      const markdown = readFileSync(markdownPath, 'utf8');
      for (const needle of contract.mustContain) {
        if (!markdown.includes(needle)) {
          pushValidationFailure(
            failures,
            skillName,
            'markdown_contracts',
            `markdown contract ${contract.path} missing "${needle}"`,
          );
        }
      }
    }
  }

  if (failures.length > 0) {
    if (jsonOutput) {
      console.error(`${JSON.stringify(
        validationJsonPayload(skillNames.length, failures),
        null,
        2,
      )}\n`);
      process.exit(1);
    }
    fail(`invalid skills:\n${failures.join('\n')}`);
  }

  if (jsonOutput) {
    console.log(JSON.stringify(validationJsonPayload(skillNames.length, []), null, 2));
    return;
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
  const packageJsonPath = existsSync(join(workspaceRoot, 'package.json'))
    ? join(workspaceRoot, 'package.json')
    : join(cliDir, 'package.json');
  const packageJson = readJson(packageJsonPath);
  return {
    name: packageJson.name,
    version: packageJson.version,
    description: packageJson.description,
  };
}

function commandConfig(args) {
  const { options, positionals } = parseOptions(args);
  if (positionals.join(' ') !== 'paths set') {
    fail('usage: danny-skill config paths set --project <path> (--global <path>|--system <path>) [--target-root <path>]');
  }

  const globalPath = typeof options.global === 'string' ? options.global : options.system;

  if (typeof options.project !== 'string' || typeof globalPath !== 'string') {
    fail('config paths set requires --project and --global or --system');
  }

  const targetRoot = resolve(String(options['target-root'] ?? process.cwd()));
  const nativeConfigPath = writeConfigPathsNative(targetRoot, options.project, globalPath);
  if (nativeConfigPath) {
    console.log(`wrote ${nativeConfigPath}`);
    return;
  }

  const configPath = join(targetRoot, configDirectory, 'config.json');
  writeJson(configPath, {
    knowledge_base: {
      project: options.project,
      global: globalPath,
    },
  });

  console.log(`wrote ${configPath}`);
}

function readProjectKnowledgePath(targetRoot) {
  const configPaths = [
    join(targetRoot, configDirectory, 'config.json'),
    join(targetRoot, legacyConfigDirectory, 'config.json'),
  ];

  for (const configPath of configPaths) {
    if (!existsSync(configPath)) {
      continue;
    }

    const config = JSON.parse(readFileSync(configPath, 'utf8'));
    if (typeof config?.knowledge_base?.project === 'string') {
      return config.knowledge_base.project;
    }
  }

  return defaultProjectKnowledgePath;
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
  const nativeBasePath = initProjectKnowledgeNative(targetRoot, projectKnowledgePath);
  if (nativeBasePath) {
    console.log(`initialized ${nativeBasePath}`);
    return;
  }

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
  if (copyManifestSkill(skillName, targetDir, 'minimal')) {
    return;
  }

  const sourceDir = join(repoRoot, 'skills', skillName);
  mkdirSync(targetDir, { recursive: true });
  cpSync(join(sourceDir, 'SKILL.md'), join(targetDir, 'SKILL.md'));

  const configPath = join(sourceDir, 'config.yaml');
  if (existsSync(configPath)) {
    cpSync(configPath, join(targetDir, 'config.yaml'));
  }
}

function copyStandardSkill(skillName, targetDir) {
  if (copyManifestSkill(skillName, targetDir, 'standard')) {
    return;
  }

  const sourceDir = join(repoRoot, 'skills', skillName);
  copyMinimalSkill(skillName, targetDir);

  for (const childName of ['references', 'assets']) {
    const childPath = join(sourceDir, childName);
    if (!existsSync(childPath)) {
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
    if (!copyManifestSkill(skillName, targetDir, 'full')) {
      cpSync(join(repoRoot, 'skills', skillName), targetDir, { recursive: true });
    }
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
    if (scope !== 'project') {
      fail('cursor install currently requires --scope project');
    }
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
  const nativeTarget = syncPluginManifestsNative(repoRoot, targetRoot);
  if (nativeTarget) {
    console.log(`synced plugin manifests to ${nativeTarget}`);
    return;
  }

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

  const nativePackagePlan = buildPackagePlanNative(repoRoot, profile);
  if (nativePackagePlan) {
    for (const { skillName, relativePath } of nativePackagePlan) {
      const source = join(repoRoot, 'skills', skillName, relativePath);
      const target = join(distDir, 'skills', skillName, relativePath);
      mkdirSync(dirname(target), { recursive: true });
      cpSync(source, target);
    }
  } else {
    for (const skillName of listSkillNames()) {
      copyProfileSkill(skillName, join(distDir, 'skills', skillName), profile);
    }
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
  const nativeCount = generateAliasesNative(repoRoot, targetRoot, tool);
  if (nativeCount !== null) {
    const targetDir = aliasTargetDir(tool, targetRoot);
    console.log(`generated ${nativeCount} aliases for ${tool} at ${targetDir}`);
    return;
  }

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
  const normalizedArgv = argv[0] === '--' ? argv.slice(1) : argv;
  const [command, ...rest] = normalizedArgv;

  if (command === undefined || command === '--help' || command === '-h') {
    printHelp();
    return;
  }

  if (rest.includes('--help') || rest.includes('-h')) {
    printHelp(command);
    return;
  }

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
