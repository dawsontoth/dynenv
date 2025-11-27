import { describe, it, expect, beforeEach, vi } from 'vitest';
import { resolve, sep } from 'path';

// Mock dependencies before importing module under test
vi.mock('./listDirectory.js', () => ({
  listDirectory: vi.fn(),
}));
vi.mock('./safeRequire.js', () => ({
  safeRequire: vi.fn(),
}));

describe('parseArgs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('parses args with barrier -- into files, command, and args', async () => {
    const { parseArgs } = await import('./parseArgs.js');
    const result = await parseArgs(['./env/a.js', '--', 'node', '-v']);
    expect(result).toEqual({
      filesToRequire: ['./env/a.js'],
      nextCommand: 'node',
      nextCommandArgs: ['-v'],
    });
  });

  it('discovers dynenv files from node_modules packages when no barrier is present', async () => {
    const { listDirectory } = await import('./listDirectory.js');
    const { safeRequire } = await import('./safeRequire.js');

    const root = `/fake/node_modules`;
    const pkg1 = `${root}${sep}pkg1`;
    const scopeDir = `${root}${sep}@scope`;
    const pkg2 = `${scopeDir}${sep}pkg2`;

    // listDirectory is called first with './node_modules/'
    listDirectory.mockImplementation(async (ref) => {
      if (ref === './node_modules/') {
        return [pkg1, scopeDir];
      }
      if (ref === scopeDir) {
        return [pkg2];
      }
      return [];
    });

    // safeRequire is called with resolve(module, 'package.json')
    safeRequire.mockImplementation((ref) => {
      if (ref === resolve(pkg1, 'package.json')) {
        return { dynenv: 'env/a.js' };
      }
      if (ref === resolve(pkg2, 'package.json')) {
        return { dynenv: 'env/b.js' };
      }
      return null;
    });

    const { parseArgs } = await import('./parseArgs.js');
    const result = await parseArgs(['echo', 'ok']);

    expect(result.filesToRequire).toEqual([
      resolve(pkg1, 'env/a.js'),
      resolve(pkg2, 'env/b.js'),
    ]);
    expect(result.nextCommand).toBe('echo');
    expect(result.nextCommandArgs).toEqual(['ok']);
  });
});
