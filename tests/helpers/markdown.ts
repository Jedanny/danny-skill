export function parseMarkdownTable(content: string, headerLabel: string): Array<Record<string, string>> {
  const lines = content.split('\n');
  const headerIndex = lines.findIndex((line) => line.trim() === headerLabel.trim());
  if (headerIndex === -1) {
    throw new Error(`Table header not found: ${headerLabel}`);
  }

  const separatorIndex = headerIndex + 1;
  if (!lines[separatorIndex]?.includes('| ---')) {
    throw new Error(`Table separator not found after header: ${headerLabel}`);
  }

  const headers = lines[headerIndex]
    .split('|')
    .map((cell) => cell.trim())
    .filter(Boolean);

  const rows: Array<Record<string, string>> = [];
  for (let index = separatorIndex + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (!line.trim().startsWith('|')) {
      break;
    }

    const cells = line
      .split('|')
      .map((cell) => cell.trim())
      .filter(Boolean);

    if (cells.length !== headers.length) {
      continue;
    }

    rows.push(Object.fromEntries(headers.map((header, cellIndex) => [header, cells[cellIndex]])));
  }

  return rows;
}
