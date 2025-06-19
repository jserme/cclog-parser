import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';
import { parseChangelog } from '../src/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

function getFix(name: string): string {
  return join(__dirname, `./fixtures/${name}`);
}

function readFix(name: string): string {
  return readFileSync(getFix(name), 'utf-8');
}

describe('cclog-parser', () => {
  const empty = readFix('empty.md');
  const simple = readFix('simple.md');
  const karma = readFix('karma.md');
  const conventionalcommits = readFix('conventionalcommits.md');
  // mixed <a name="{Version}"></a> and [{Version}]()
  const converntionalchangelog2 = readFix('converntional_changelog2.md');

  it('simple parse', () => {
    const rst = parseChangelog(simple);

    expect(rst.versions.length).toBe(2);
    expect(rst.versions).toContain('0.0.1');
    expect(rst.versions).toContain('0.1.0');

    expect(Object.keys(rst.changes)).toContain('0.0.1');
    expect(rst.changes['0.0.1']?.fixes.length).toBe(2);
    expect(rst.changes['0.0.1']?.features.length).toBe(2);

    expect(rst.changes['0.0.1']?.fixes[0]).toBe('fixc ([17c2c43](https://abc/commit/abc))');
  });

  it('empty parse', () => {
    const rst = parseChangelog(empty);
    expect(rst.versions.length).toBe(0);
    expect(Object.keys(rst.changes).length).toBe(0);
  });

  it('large parse', () => {
    const rst = parseChangelog(karma);
    expect(rst.versions.length).toBeGreaterThan(10);
    expect(Object.keys(rst.changes).length).toBeGreaterThan(10);
    expect(Object.keys(rst.changes).length).toBe(rst.versions.length);
  });

  it('conventionalcommits parse', () => {
    const rst = parseChangelog(conventionalcommits);
    expect(rst.versions.length).toBeGreaterThan(10);
    expect(Object.keys(rst.changes).length).toBeGreaterThan(10);
    expect(Object.keys(rst.changes).length).toBe(rst.versions.length);
    // make sure breakingChanges has parsed correctly
    expect(Object.keys(rst.changes).some(v => rst.changes[v]?.breakingChanges.length > 0)).toBe(
      true
    );
  });

  it('parse conventional-changelog@2.0.0+ format', () => {
    const rst = parseChangelog(converntionalchangelog2);
    expect(rst.changes['3.0.0']?.fixes.length).toBe(2);
    expect(rst.changes['3.0.0']?.features.length).toBe(0);
    expect(rst.changes['3.0.0']?.breakingChanges.length).toBe(1);
    expect(rst.changes['2.0.0']?.fixes.length).toBe(0);
    expect(rst.changes['2.0.0']?.features.length).toBe(0);
    expect(rst.changes['3.0.0']?.breakingChanges.length).toBe(1);
  });

  it('should handle includeDetails option', () => {
    const rst = parseChangelog(simple, { includeDetails: false });

    expect(rst.versions.length).toBe(2);
    expect(rst.versions).toContain('0.0.1');
    expect(rst.versions).toContain('0.1.0');
  });

  it('should export as default', async () => {
    const { default: parseChangelogDefault } = await import('../src/index.js');
    expect(parseChangelogDefault).toBe(parseChangelog);
  });
});
