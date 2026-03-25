import { existsSync, mkdirSync, symlinkSync, readdirSync, statSync, copyFileSync } from 'fs';
import { join, dirname } from 'path';
import { homedir } from 'os';

const CLAUDE_CODE_CONFIG_DIR = join(homedir(), '.claude');
const CLAUDE_CODE_SKILLS_DIR = join(CLAUDE_CODE_CONFIG_DIR, 'skills');

export async function installToClaudeCode(assetsPath: string): Promise<void> {
  // Ensure Claude Code config directory exists
  if (!existsSync(CLAUDE_CODE_CONFIG_DIR)) {
    mkdirSync(CLAUDE_CODE_CONFIG_DIR, { recursive: true });
  }

  // Install skills
  const skillsSource = join(assetsPath, 'skills');
  if (existsSync(skillsSource)) {
    const targetDir = CLAUDE_CODE_SKILLS_DIR;

    if (!existsSync(targetDir)) {
      mkdirSync(targetDir, { recursive: true });
    }

    // Copy skill files
    await copyDirRecursive(skillsSource, targetDir);
  }

  console.log('Successfully installed assets to Claude Code');
}

export async function uninstallFromClaudeCode(): Promise<void> {
  if (existsSync(CLAUDE_CODE_SKILLS_DIR)) {
    // Remove installed skills
    const { rmSync } = await import('fs');
    rmSync(CLAUDE_CODE_SKILLS_DIR, { recursive: true, force: true });
  }

  console.log('Successfully uninstalled assets from Claude Code');
}

async function copyDirRecursive(src: string, dest: string): Promise<void> {
  mkdirSync(dest, { recursive: true });

  const entries = readdirSync(src);

  for (const entry of entries) {
    const srcPath = join(src, entry);
    const destPath = join(dest, entry);
    const stat = statSync(srcPath);

    if (stat.isDirectory()) {
      await copyDirRecursive(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}

export function getClaudeCodeSkillsDir(): string {
  return CLAUDE_CODE_SKILLS_DIR;
}
