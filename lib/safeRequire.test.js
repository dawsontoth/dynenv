import { describe, expect, it } from 'vitest';
import { safeRequire } from './safeRequire.js';

describe('safeRequire', () => {
  it('returns null for modules that do not exist', () => {
    const result = safeRequire('this-module-does-not-exist');
    expect(result).toBe(null);
  });

  it('returns the module for modules that exist', () => {
    const result = safeRequire('../package.json');
    expect(result).toHaveProperty('name', 'dynenv');
  });
});
