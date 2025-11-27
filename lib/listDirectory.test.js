import { describe, it, expect, beforeEach, vi } from 'vitest';
import { join } from 'path';

// Mock fs before importing the module under test
const readdirMock = vi.fn();
vi.mock('fs', () => ({
  readdir: (...args) => readdirMock(...args),
}));

describe('listDirectory', () => {
  beforeEach(() => {
    readdirMock.mockReset();
    vi.resetModules();
  });

  it('lists child paths joined with the parent directory', async () => {
    const { listDirectory } = await import('./listDirectory.js');
    const ref = '/root/dir';
    readdirMock.mockImplementation((path, cb) => {
      cb(null, ['a', 'b']);
    });

    const results = await listDirectory(ref);
    expect(results).toEqual([join(ref, 'a'), join(ref, 'b')]);
  });

  it('rejects when readdir returns an error', async () => {
    const { listDirectory } = await import('./listDirectory.js');
    const error = new Error('ENOENT');
    readdirMock.mockImplementation((path, cb) => cb(error));

    await expect(listDirectory('/missing')).rejects.toBe(error);
  });
});
