import { resolve, sep } from 'path';
import { listDirectory } from './listDirectory.js';
import { safeRequire } from './safeRequire.js';

export async function parseArgs(args) {
  const barrier = args.indexOf('--');
  if (-1 === barrier) {
    const modules = await listDirectory('./node_modules/');
    for (const parentDirectory of modules.filter(m => m.indexOf(`${sep}@`) >= 0)) {
      modules.push(...await listDirectory(parentDirectory));
    }
    const filesToRequire = [];
    for (const module of modules) {
      const packageJSON = safeRequire(resolve(module, 'package.json'));
      if (packageJSON && packageJSON.dynenv) {
        filesToRequire.push(resolve(module, packageJSON.dynenv));
      }
    }
    return {
      filesToRequire,
      nextCommand: args[0],
      nextCommandArgs: args.slice(1),
    };
  }
  else {
    return {
      filesToRequire: args.slice(0, barrier),
      nextCommand: args[barrier + 1],
      nextCommandArgs: args.slice(barrier + 2),
    };
  }
}
