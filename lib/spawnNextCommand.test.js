import { describe, it, expect, beforeEach, vi } from 'vitest';

const syncMock = vi.fn();
vi.mock('cross-spawn', () => ({
  sync: (...args) => syncMock(...args),
}));

describe('spawnNextCommand', () => {
  beforeEach(() => {
    syncMock.mockReset();
    vi.resetModules();
  });

  it('calls cross-spawn sync with correct args and returns its result', async () => {
    const fakeResult = { status: 123 };
    syncMock.mockImplementation(() => fakeResult);
    const { spawnNextCommand } = await import('./spawnNextCommand.js');

    const env = { TEST: '1' };
    const res = spawnNextCommand({ nextCommand: 'echo', nextCommandArgs: ['hi'], env });

    expect(res).toBe(fakeResult);
    expect(syncMock).toHaveBeenCalledTimes(1);
    const [cmd, args, options] = syncMock.mock.calls[0];
    expect(cmd).toBe('echo');
    expect(args).toEqual(['hi']);
    expect(options).toMatchObject({ stdio: 'inherit', env });
  });
});
