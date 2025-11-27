#!/usr/bin/env node
import { parseArgs } from './lib/parseArgs.js';
import { requireFiles } from './lib/requireFiles.js';
import { spawnNextCommand } from './lib/spawnNextCommand.js';

parseArgs(process.argv.slice(2))
  .then(state => requireFiles(state, process.env))
  .then(state => process.exitCode = spawnNextCommand(state).status)
;
