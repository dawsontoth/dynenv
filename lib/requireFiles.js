import { resolve } from 'path';
import { safeRequire } from './safeRequire.js';

export async function requireFiles(state, initialEnv) {
  state.env = Object.assign({}, initialEnv);
  for (const fileToRequire of state.filesToRequire) {
    const exports = safeRequire(fileToRequire.startsWith('./')
      ? resolve(fileToRequire)
      : fileToRequire);
    const newEnv = typeof exports === 'function'
      ? await exports()
      : exports;
    if (newEnv) {
      Object.assign(state.env, newEnv);
    }
  }
  return state;
}
