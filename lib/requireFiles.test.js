import { describe, expect, it, beforeEach, vi } from 'vitest';
import { resolve } from 'path';

// Mock before importing the module under test
vi.mock('./safeRequire.js', () => ({
  safeRequire: vi.fn(),
}));

describe('requireFiles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('merges object exports into env', async () => {
    const { safeRequire } = await import('./safeRequire.js');
    safeRequire.mockImplementation((ref) => {
      if (ref === 'pkgA') return { A: '1' };
      return null;
    });
    const { requireFiles } = await import('./requireFiles.js');

    const state = { filesToRequire: ['pkgA'] };
    const initialEnv = { EXISTING: 'x' };
    const result = await requireFiles(state, initialEnv);

    expect(result.env).toEqual({ EXISTING: 'x', A: '1' });
    // Ensure original initialEnv not mutated
    expect(initialEnv).toEqual({ EXISTING: 'x' });
  });

  it('awaits function or async function exports', async () => {
    const { safeRequire } = await import('./safeRequire.js');
    safeRequire.mockImplementation((ref) => {
      if (ref === 'pkgFunc') return async () => ({ B: '2' });
      return null;
    });
    const { requireFiles } = await import('./requireFiles.js');

    const state = { filesToRequire: ['pkgFunc'] };
    const result = await requireFiles(state, {});
    expect(result.env).toHaveProperty('B', '2');
  });

  it('ignores falsy exports', async () => {
    const { safeRequire } = await import('./safeRequire.js');
    safeRequire.mockImplementation(() => null);
    const { requireFiles } = await import('./requireFiles.js');

    const state = { filesToRequire: ['nope'] };
    const result = await requireFiles(state, { BASE: 'ok' });
    expect(result.env).toEqual({ BASE: 'ok' });
  });

  it('resolves relative paths before requiring', async () => {
    const rel = './relmod.js';
    const expectedResolved = resolve(rel);
    const { safeRequire } = await import('./safeRequire.js');
    safeRequire.mockImplementation((ref) => {
      // Return something only when the resolved path is used
      if (ref === expectedResolved) return { C: '3' };
      return null;
    });
    const { requireFiles } = await import('./requireFiles.js');

    const state = { filesToRequire: [rel] };
    const result = await requireFiles(state, {});
    expect(result.env).toHaveProperty('C', '3');
    // Verify the mock was called with the resolved path
    expect(safeRequire).toHaveBeenCalledWith(expectedResolved);
  });
});
