#!/usr/bin/env node
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

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

function commandValidate() {
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
  const targetRoot = resolve(String(options['target-root'] ?? process.cwd()));

  if (!['minimal', 'standard', 'full'].includes(profile)) {
    fail(`unsupported install profile: ${profile}`);
  }
  if (!['user', 'project'].includes(scope)) {
    fail(`unsupported install scope: ${scope}`);
  }

  const destination = destinationFor(tool, scope, targetRoot);
  for (const skillName of listSkillNames()) {
    installSkill(skillName, join(destination, skillName), mode, profile);
  }
  console.log(`installed ${profile} profile for ${tool} at ${destination}`);
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

  fail('usage: danny-skill <validate|config|knowledge|install> ...');
}

main(process.argv.slice(2));
