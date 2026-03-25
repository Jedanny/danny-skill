import { describe, expect, test } from '@jest/globals';

describe('Schema', () => {
  test('Skill type should have required fields', () => {
    const skill = {
      name: 'read-code',
      version: '1.0',
      domain: 'common',
      tags: ['reading', 'understanding'],
      description: 'Code reading skill',
      type: 'skill',
      trigger: '/read',
      adapter: 'universal',
      content: '# Read Code\n\nThis skill helps...'
    };

    expect(skill.name).toBe('read-code');
    expect(skill.type).toBe('skill');
    expect(skill.domain).toBe('common');
  });

  test('Command type should have command field', () => {
    const cmd = {
      name: 'project-init',
      version: '1.0',
      domain: 'common',
      tags: ['init', 'setup'],
      description: 'Project initialization',
      type: 'command',
      command: 'npm init',
      adapter: 'universal'
    };

    expect(cmd.type).toBe('command');
    expect(cmd.command).toBe('npm init');
  });
});
