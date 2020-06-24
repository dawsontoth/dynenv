#!/usr/bin/env node
const { spawn } = require('child_process');
const { resolve } = require('path');

const args = process.argv.slice(2);
const barrier = args.indexOf('--');
const filesToRequire = args.slice(0, barrier);
const nextCommand = args[barrier + 1];
const nextCommandArgs = args.slice(barrier + 2);
const env = process.env;

for (const fileToRequire of filesToRequire) {
	const file = require(fileToRequire.startsWith('./')
		? resolve(fileToRequire)
		: fileToRequire);
	const newEnv = typeof file === 'function' ? file() : file;
	Object.assign(env, newEnv);
}

spawn(nextCommand, nextCommandArgs, {
	stdio: 'inherit',
	env,
});
