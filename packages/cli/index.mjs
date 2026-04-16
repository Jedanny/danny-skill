import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

export function loadNativeBinding() {
  for (const candidate of ['./danny_skill_cli.node', './danny-skill-cli.node']) {
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
