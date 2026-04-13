import { describe, expect, test } from '@jest/globals';

describe('canonical asset metadata', () => {
  test('skill metadata uses the shared SKILL.md shape', () => {
    const skill = {
      name: 'knowledge-distill',
      version: '1.0',
      tags: ['knowledge', 'documentation'],
      description: 'Team knowledge distillation skill',
      trigger: '/danny-distill',
      supported_tools: ['claude-code', 'codex', 'cursor', 'opencode'],
      content: '# Knowledge Distill Skill',
    };

    expect(skill.name).toBe('knowledge-distill');
    expect(skill.supported_tools).toContain('codex');
    expect(skill.trigger).toMatch(/^\/danny-/);
  });

  test('command assets stay separate from skills', () => {
    const cmd = {
      name: 'project-init',
      tags: ['init', 'setup'],
      description: 'Project initialization',
      path: 'commands/project-init.md',
    };

    expect(cmd.path).toBe('commands/project-init.md');
    expect(cmd.name).not.toBe('knowledge-distill');
  });
});
