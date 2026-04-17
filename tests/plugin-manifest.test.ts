import { describe, expect, test } from '@jest/globals';
import { readFileSync } from 'fs';
import { join } from 'path';

function readJson(path: string) {
  return JSON.parse(readFileSync(join(process.cwd(), path), 'utf8'));
}

describe('plugin manifests', () => {
  test.each([
    '.claude-plugin/plugin.json',
    '.cursor-plugin/plugin.json',
  ])('%s has required package metadata', (path) => {
    const manifest = readJson(path);

    expect(manifest.name).toBe('danny-skill');
    expect(manifest.description).toEqual(expect.any(String));
    expect(manifest.version).toEqual(expect.any(String));
  });

  test('Claude marketplace references the danny-skill plugin', () => {
    const marketplace = readJson('.claude-plugin/marketplace.json');

    expect(marketplace.name).toEqual(expect.any(String));
    expect(marketplace.description).toContain('design style');
    expect(marketplace.description).toContain('autoresearch');
    expect(marketplace.description).toContain('research-to-implementation');
    expect(marketplace.description).toContain('coding guardrails');
    expect(marketplace.plugins).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'danny-skill',
          description: expect.stringContaining('design style'),
          source: './',
        }),
      ]),
    );
  });

  test('Cursor install docs describe official project rules and commands', () => {
    const installDoc = readFileSync(join(process.cwd(), '.cursor-plugin', 'INSTALL.md'), 'utf8');

    expect(installDoc).toContain('.cursor/rules');
    expect(installDoc).toContain('.cursor/commands');
  });

  test('root and CLI package metadata point to the public repository and npm org', () => {
    const rootPackage = readJson('package.json');
    const cliPackage = readJson('packages/cli/package.json');

    expect(rootPackage.repository.url).toBe('git+https://github.com/Jedanny/danny-skill.git');
    expect(cliPackage.name).toBe('@dannyok/cli');
    expect(cliPackage.version).toBe('1.0.1');
    expect(cliPackage.repository.url).toBe('git+https://github.com/Jedanny/danny-skill.git');
    expect(cliPackage.repository.directory).toBe('packages/cli');
  });
});
