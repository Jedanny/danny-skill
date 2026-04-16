import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

function nativePlatformTriple() {
  if (process.platform === 'darwin' && process.arch === 'arm64') {
    return 'darwin-arm64';
  }
  if (process.platform === 'darwin' && process.arch === 'x64') {
    return 'darwin-x64';
  }
  if (process.platform === 'win32' && process.arch === 'x64') {
    return 'win32-x64-msvc';
  }
  if (process.platform === 'win32' && process.arch === 'arm64') {
    return 'win32-arm64-msvc';
  }
  if (process.platform === 'linux' && process.arch === 'x64') {
    return 'linux-x64-gnu';
  }
  if (process.platform === 'linux' && process.arch === 'arm64') {
    return 'linux-arm64-gnu';
  }
  return `${process.platform}-${process.arch}`;
}

export function nativeBindingCandidates() {
  const triple = nativePlatformTriple();
  return [
    `./danny_skill_cli.${triple}.node`,
    `./danny-skill-cli.${triple}.node`,
    './danny_skill_cli.node',
    './danny-skill-cli.node',
  ];
}

export function loadNativeBinding() {
  for (const candidate of nativeBindingCandidates()) {
    try {
      return require(candidate);
    } catch (error) {
      if (error?.code !== 'MODULE_NOT_FOUND') {
        throw error;
      }
    }
  }

  return null;
}

export function validateSkillsNative(root) {
  const binding = loadNativeBinding();
  if (binding?.validateSkills) {
    return binding.validateSkills(root);
  }
  return null;
}
