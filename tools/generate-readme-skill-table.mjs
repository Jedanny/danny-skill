#!/usr/bin/env node
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseManifest } from '../packages/cli/manifest.mjs';

const toolDir = fileURLToPath(new URL('.', import.meta.url));
const repoRoot = resolve(toolDir, '..');
const skillsDir = join(repoRoot, 'skills');
const readmePath = join(repoRoot, 'README.md');

const skillTableStartMarker = '<!-- GENERATED:SKILL_TABLE:START -->';
const skillTableEndMarker = '<!-- GENERATED:SKILL_TABLE:END -->';
const boundaryTableStartMarker = '<!-- GENERATED:SKILL_BOUNDARY_TABLE:START -->';
const boundaryTableEndMarker = '<!-- GENERATED:SKILL_BOUNDARY_TABLE:END -->';

const preferredOrder = [
  'using-danny',
  'inspiration-box',
  'socratic-learning',
  'knowledge-distill',
  'retrieval-and-spacing',
  'self-improvement',
  'design-style',
  'autoresearch-loop',
  'research-to-implementation',
  'coding-guardrails',
];

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) {
    throw new Error('Missing frontmatter');
  }

  return Object.fromEntries(
    match[1]
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const separator = line.indexOf(':');
        if (separator === -1) {
          throw new Error(`Invalid frontmatter line: ${line}`);
        }

        return [
          line.slice(0, separator).trim(),
          line.slice(separator + 1).trim().replace(/^["']|["']$/g, ''),
        ];
      }),
  );
}

function skillRows() {
  const skillNames = readdirSync(skillsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((left, right) => {
      const leftOrder = preferredOrder.indexOf(left);
      const rightOrder = preferredOrder.indexOf(right);
      if (leftOrder !== -1 || rightOrder !== -1) {
        return (leftOrder === -1 ? Number.MAX_SAFE_INTEGER : leftOrder)
          - (rightOrder === -1 ? Number.MAX_SAFE_INTEGER : rightOrder);
      }
      return left.localeCompare(right);
    });

  return skillNames.map((skillName) => {
    const skillDir = join(skillsDir, skillName);
    const skillContent = readFileSync(join(skillDir, 'SKILL.md'), 'utf8');
    const configContent = readFileSync(join(skillDir, 'config.yaml'), 'utf8');
    const frontmatter = parseFrontmatter(skillContent);
    const manifest = parseManifest(configContent);
    const projectAlias = typeof frontmatter.trigger === 'string' ? frontmatter.trigger : '自动触发';
    const summary = manifest.docs?.summary ?? frontmatter.description ?? '';

    return [
      `\`${skillName}\``,
      `/${skillName}`,
      `/danny-skill:${skillName}`,
      `$${skillName}`,
      projectAlias,
      summary,
    ];
  });
}

function formatArtifact(value) {
  if (value.startsWith('skills/')) {
    return `[${value}](${value})`;
  }
  return value;
}

function abilityRows() {
  const skillNames = readdirSync(skillsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((left, right) => {
      const leftOrder = preferredOrder.indexOf(left);
      const rightOrder = preferredOrder.indexOf(right);
      if (leftOrder !== -1 || rightOrder !== -1) {
        return (leftOrder === -1 ? Number.MAX_SAFE_INTEGER : leftOrder)
          - (rightOrder === -1 ? Number.MAX_SAFE_INTEGER : rightOrder);
      }
      return left.localeCompare(right);
    });

  return skillNames.map((skillName) => {
    const configContent = readFileSync(join(skillsDir, skillName, 'config.yaml'), 'utf8');
    const manifest = parseManifest(configContent);
    const docs = manifest.docs ?? {};
    return [
      `[\`${skillName}\`](skills/${skillName}/SKILL.md)`,
      docs.handles ?? '',
      docs.not_for ?? '',
      (docs.artifacts ?? []).map((artifact) => formatArtifact(String(artifact))).join('、'),
    ];
  });
}

function renderSkillTable() {
  const rows = skillRows();
  const lines = [
    skillTableStartMarker,
    '| Skill | Claude Code standalone | Claude Code plugin | Codex | Project alias | Description |',
    '| --- | --- | --- | --- | --- | --- |',
    ...rows.map((row) => `| ${row.join(' | ')} |`),
    skillTableEndMarker,
  ];
  return lines.join('\n');
}

function renderBoundaryTable() {
  const rows = abilityRows();
  const lines = [
    boundaryTableStartMarker,
    '| Skill | 适合处理 | 不适合处理 | 主要产物 |',
    '| --- | --- | --- | --- |',
    ...rows.map((row) => `| ${row.join(' | ')} |`),
    boundaryTableEndMarker,
  ];
  return lines.join('\n');
}

function replaceGeneratedSection(readme, startMarker, endMarker, replacement) {
  const pattern = new RegExp(`${startMarker}[\\s\\S]*?${endMarker}`);
  if (!pattern.test(readme)) {
    throw new Error(`README is missing generated markers: ${startMarker}`);
  }
  return readme.replace(pattern, replacement);
}

function main() {
  const mode = process.argv.includes('--check') ? 'check' : 'write';
  const readme = readFileSync(readmePath, 'utf8');
  const nextReadme = replaceGeneratedSection(
    replaceGeneratedSection(readme, skillTableStartMarker, skillTableEndMarker, renderSkillTable()),
    boundaryTableStartMarker,
    boundaryTableEndMarker,
    renderBoundaryTable(),
  );

  if (mode === 'check') {
    if (nextReadme !== readme) {
      console.error('README skill table is out of date. Run: node tools/generate-readme-skill-table.mjs');
      process.exit(1);
    }
    console.log('README skill table is up to date');
    return;
  }

  writeFileSync(readmePath, nextReadme);
  console.log(`Updated ${readmePath}`);
}

main();
