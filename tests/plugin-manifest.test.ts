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
    expect(marketplace.plugins).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'danny-skill',
          source: './',
        }),
      ]),
    );
  });
});
