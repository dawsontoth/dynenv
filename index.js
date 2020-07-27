#!/usr/bin/env node
const spawn = require('cross-spawn');
const { readdir } = require('fs');
const { join, resolve } = require('path');

parseArgs()
	.then(state => requireFiles(state))
	.then(state => spawnNextCommand(state))
;

async function parseArgs() {
	const args = process.argv.slice(2);
	const barrier = args.indexOf('--');
	if (-1 === barrier) {
		const modules = await listDirectory('./node_modules/');
		for (const parentDirectory of modules.filter(m => m.indexOf('/@') >= 0)) {
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

function listDirectory(ref) {
	return new Promise((resolve, reject) => {
		readdir(ref, (err, results) => err
			? reject(err)
			: resolve(results.map(result => join(ref, result))),
		);
	});
}

async function requireFiles(state) {
	state.env = Object.assign({}, process.env);
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

function safeRequire(ref) {
	try {
		return require(ref);
	}
	catch (err) {
		return null;
	}
}

function spawnNextCommand({ nextCommand, nextCommandArgs, env }) {
	spawn(nextCommand, nextCommandArgs, {
		stdio: 'inherit',
		env,
	});
}
