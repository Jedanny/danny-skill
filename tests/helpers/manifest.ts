export type ManifestValue =
  | string
  | number
  | boolean
  | null
  | ManifestObject
  | ManifestValue[];

export interface ManifestObject {
  [key: string]: ManifestValue;
}

interface ParsedLine {
  indent: number,
  trimmed: string,
}

function parseScalar(raw: string): ManifestValue {
  const value = raw.trim();

  if (
    (value.startsWith('"') && value.endsWith('"'))
    || (value.startsWith('\'') && value.endsWith('\''))
  ) {
    return value.slice(1, -1);
  }

  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  if (value === 'null') {
    return null;
  }

  if (/^-?\d+$/.test(value)) {
    return Number(value);
  }

  if (value.startsWith('[') && value.endsWith(']')) {
    const inner = value.slice(1, -1).trim();
    if (inner === '') {
      return [];
    }

    return inner
      .split(',')
      .map((item) => parseScalar(item.trim()));
  }

  return value;
}

function nextMeaningful(lines: ParsedLine[], index: number): number {
  let cursor = index;
  while (cursor < lines.length) {
    if (lines[cursor].trimmed !== '' && !lines[cursor].trimmed.startsWith('#')) {
      return cursor;
    }
    cursor += 1;
  }
  return cursor;
}

function parseMap(lines: ParsedLine[], start: number, indent: number): [ManifestObject, number] {
  const result: ManifestObject = {};
  let index = start;

  while (index < lines.length) {
    index = nextMeaningful(lines, index);
    if (index >= lines.length) {
      break;
    }

    const line = lines[index];
    if (line.indent < indent) {
      break;
    }
    if (line.indent !== indent || line.trimmed.startsWith('- ')) {
      break;
    }

    const match = line.trimmed.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!match) {
      throw new Error(`Invalid manifest line: ${line.trimmed}`);
    }

    const [, key, rest] = match;
    index += 1;

    if (rest !== '') {
      result[key] = parseScalar(rest);
      continue;
    }

    const childIndex = nextMeaningful(lines, index);
    if (childIndex >= lines.length || lines[childIndex].indent <= indent) {
      result[key] = {};
      index = childIndex;
      continue;
    }

    if (lines[childIndex].trimmed.startsWith('- ')) {
      const [list, nextIndex] = parseList(lines, childIndex, indent + 2);
      result[key] = list;
      index = nextIndex;
      continue;
    }

    const [child, nextIndex] = parseMap(lines, childIndex, indent + 2);
    result[key] = child;
    index = nextIndex;
  }

  return [result, index];
}

function parseList(lines: ParsedLine[], start: number, indent: number): [ManifestValue[], number] {
  const result: ManifestValue[] = [];
  let index = start;

  while (index < lines.length) {
    index = nextMeaningful(lines, index);
    if (index >= lines.length) {
      break;
    }

    const line = lines[index];
    if (line.indent < indent) {
      break;
    }
    if (line.indent !== indent || !line.trimmed.startsWith('- ')) {
      break;
    }

    const rest = line.trimmed.slice(2).trim();
    index += 1;

    if (rest === '') {
      const childIndex = nextMeaningful(lines, index);
      if (childIndex >= lines.length || lines[childIndex].indent <= indent) {
        result.push(null);
        index = childIndex;
        continue;
      }

      if (lines[childIndex].trimmed.startsWith('- ')) {
        const [list, nextIndex] = parseList(lines, childIndex, indent + 2);
        result.push(list);
        index = nextIndex;
      } else {
        const [obj, nextIndex] = parseMap(lines, childIndex, indent + 2);
        result.push(obj);
        index = nextIndex;
      }
      continue;
    }

    const keyMatch = rest.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!keyMatch) {
      result.push(parseScalar(rest));
      continue;
    }

    const [, key, inlineValue] = keyMatch;
    const item: ManifestObject = {};
    if (inlineValue !== '') {
      item[key] = parseScalar(inlineValue);
    } else {
      const childIndex = nextMeaningful(lines, index);
      if (childIndex >= lines.length || lines[childIndex].indent <= indent) {
        item[key] = {};
        index = childIndex;
      } else if (lines[childIndex].trimmed.startsWith('- ')) {
        const [list, nextIndex] = parseList(lines, childIndex, indent + 2);
        item[key] = list;
        index = nextIndex;
      } else {
        const [obj, nextIndex] = parseMap(lines, childIndex, indent + 2);
        item[key] = obj;
        index = nextIndex;
      }
    }

    const extraIndex = nextMeaningful(lines, index);
    if (extraIndex < lines.length && lines[extraIndex].indent === indent + 2 && !lines[extraIndex].trimmed.startsWith('- ')) {
      const [extra, nextIndex] = parseMap(lines, extraIndex, indent + 2);
      Object.assign(item, extra);
      index = nextIndex;
    }

    result.push(item);
  }

  return [result, index];
}

export function parseManifest(content: string): ManifestObject {
  const lines = content.split('\n').map((line) => ({
    indent: line.match(/^ */)?.[0].length ?? 0,
    trimmed: line.trim(),
  }));
  const [manifest] = parseMap(lines, 0, 0);
  return manifest;
}
