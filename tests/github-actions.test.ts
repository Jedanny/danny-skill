import { describe, expect, test } from '@jest/globals';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

describe('GitHub Actions CI/CD', () => {
  test('CI workflow validates JS, Rust, and CLI behavior', () => {
    const workflowPath = join(process.cwd(), '.github', 'workflows', 'ci.yml');
    expect(existsSync(workflowPath)).toBe(true);

    const workflow = readFileSync(workflowPath, 'utf8');
    expect(workflow).toContain('on:');
    expect(workflow).toContain('pull_request:');
    expect(workflow).toContain('push:');
    expect(workflow).toContain('actions/checkout@v4');
    expect(workflow).toContain('actions/setup-node@v4');
    expect(workflow).toContain('pnpm test');
    expect(workflow).toContain('pnpm exec tsc --noEmit');
    expect(workflow).toContain('pnpm cli validate');
    expect(workflow).toContain('cargo check --manifest-path packages/cli/Cargo.toml');
    expect(workflow).toContain('pnpm install --frozen-lockfile --ignore-scripts');
    expect(workflow).toContain('npm run build');
    expect(workflow).toContain('node danny-skill.mjs package --target-root . --profile standard');
    expect(workflow).toContain('npm pack --dry-run');
  });

  test('release workflow builds native artifacts and publishes CLI package', () => {
    const workflowPath = join(process.cwd(), '.github', 'workflows', 'release-cli.yml');
    expect(existsSync(workflowPath)).toBe(true);

    const workflow = readFileSync(workflowPath, 'utf8');
    expect(workflow).toContain('tags:');
    expect(workflow).toContain("'cli-v*'");
    expect(workflow).toContain('workflow_dispatch:');
    expect(workflow).toContain('strategy:');
    expect(workflow).toContain('macos-latest');
    expect(workflow).toContain('ubuntu-latest');
    expect(workflow).toContain('windows-latest');
    expect(workflow).toContain('actions/upload-artifact@v4');
    expect(workflow).toContain('actions/download-artifact@v4');
    expect(workflow).toContain('node packages/cli/danny-skill.mjs package --target-root packages/cli --profile full');
    expect(workflow).toContain('npm publish --provenance --access public');
    expect(workflow).toContain('NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}');
    expect(workflow).toContain('id-token: write');
  });
});
