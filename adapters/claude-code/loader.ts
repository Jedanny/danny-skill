import { readFile, readdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import yaml from 'yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function loadAsset<T extends { name: string; type: string }>(
  filePath: string,
  type: string
): Promise<T | null> {
  try {
    const content = await readFile(filePath, 'utf-8');
    const data = yaml.parse(content);

    if (!data || data.type !== type) {
      return null;
    }

    // Load markdown content if exists
    const mdPath = filePath.replace('.yaml', '.md');
    try {
      data.content = await readFile(mdPath, 'utf-8');
    } catch {
      // Markdown content is optional
    }

    return data as T;
  } catch (error) {
    console.error(`Failed to load asset from ${filePath}:`, error);
    return null;
  }
}

export async function loadAssetsFromDir<T extends { name: string; type: string }>(
  dirPath: string,
  type: string
): Promise<T[]> {
  const assets: T[] = [];

  try {
    const entries = await readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const yamlPath = join(dirPath, entry.name, `${entry.name}.yaml`);
        const asset = await loadAsset<T>(yamlPath, type);
        if (asset) {
          assets.push(asset);
        }
      }
    }
  } catch (error) {
    // Directory might not exist, return empty array
    console.error(`Failed to load assets from ${dirPath}:`, error);
  }

  return assets;
}
