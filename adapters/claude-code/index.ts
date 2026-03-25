import { Skill, Command, Prompt, Workflow, Asset } from '../../lib/schema.js';
import { loadAsset, loadAssetsFromDir } from './loader.js';
import { installToClaudeCode, uninstallFromClaudeCode } from './installer.js';

export class ClaudeCodeAdapter {
  private assetsPath: string;

  constructor(assetsPath: string) {
    this.assetsPath = assetsPath;
  }

  async loadSkills(domain?: string): Promise<Skill[]> {
    const dir = domain
      ? `${this.assetsPath}/skills/${domain}`
      : `${this.assetsPath}/skills`;
    return loadAssetsFromDir<Skill>(dir, 'skill');
  }

  async loadCommands(domain?: string): Promise<Command[]> {
    const dir = domain
      ? `${this.assetsPath}/commands/${domain}`
      : `${this.assetsPath}/commands`;
    return loadAssetsFromDir<Command>(dir, 'command');
  }

  async loadPrompts(domain?: string): Promise<Prompt[]> {
    const dir = domain
      ? `${this.assetsPath}/prompts/${domain}`
      : `${this.assetsPath}/prompts`;
    return loadAssetsFromDir<Prompt>(dir, 'prompt');
  }

  async install(): Promise<void> {
    await installToClaudeCode(this.assetsPath);
  }

  async uninstall(): Promise<void> {
    await uninstallFromClaudeCode();
  }
}

export default ClaudeCodeAdapter;
