export type FrontmatterValue = string | string[];

export function parseFrontmatter(content: string): Record<string, FrontmatterValue> {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) {
    throw new Error('Missing frontmatter');
  }

  return Object.fromEntries(
    match[1]
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const separator = line.indexOf(':');
        if (separator === -1) {
          throw new Error(`Invalid frontmatter line: ${line}`);
        }

        const key = line.slice(0, separator).trim();
        const rawValue = line.slice(separator + 1).trim();

        if (rawValue.startsWith('[') && rawValue.endsWith(']')) {
          return [
            key,
            rawValue
              .slice(1, -1)
              .split(',')
              .map((value) => value.trim())
              .filter(Boolean),
          ];
        }

        return [key, rawValue.replace(/^["']|["']$/g, '')];
      }),
  );
}
