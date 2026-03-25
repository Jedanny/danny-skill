// Asset base interface
export interface Asset {
  name: string;
  version: string;
  domain: Domain;
  tags: string[];
  description: string;
  adapter: string | 'universal';
}

// Domain categories
export type Domain = 'frontend' | 'backend' | 'devops' | 'quality' | 'docs' | 'common';

// Skill extends Asset
export interface Skill extends Asset {
  type: 'skill';
  trigger?: string;
  requires?: string[];
  content: string; // Markdown content
}

// Command extends Asset
export interface Command extends Asset {
  type: 'command';
  command: string;
  content?: string;
}

// Prompt extends Asset
export interface Prompt extends Asset {
  type: 'prompt';
  template: string;
  variables?: string[];
}

// Workflow extends Asset
export interface Workflow extends Asset {
  type: 'workflow';
  steps: WorkflowStep[];
}

export interface WorkflowStep {
  name: string;
  type: 'skill' | 'command' | 'prompt';
  ref: string;
}

// Loader result
export interface AssetLoadResult<T extends Asset> {
  success: boolean;
  asset?: T;
  error?: string;
}

// Load asset from YAML file
export async function loadAsset<T extends Asset>(filePath: string): Promise<AssetLoadResult<T>> {
  // Implementation in loader.ts
  return { success: false, error: 'Not implemented' };
}
