import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const cliEntry = resolve(projectRoot, 'index.js');

function makeTempDir(prefix = 'dynenv-it-') {
  return mkdtempSync(join(tmpdir(), prefix));
}

function ensureDir(path) {
  mkdirSync(path, { recursive: true });
}

function write(path, content) {
  ensureDir(dirname(path));
  writeFileSync(path, content);
}

function runDynenv(args, options = {}) {
  // Use the current Node executable to run the CLI entry
  const res = spawnSync(process.execPath, [cliEntry, ...args], {
    cwd: options.cwd,
    env: options.env || process.env,
    stdio: 'ignore',
    encoding: 'utf-8',
  });
  return res;
}

describe('README integration examples', () => {
  let cwd;

  beforeEach(() => {
    cwd = makeTempDir();
  });

  afterEach(() => {
    if (cwd) {
      try {
        rmSync(cwd, { recursive: true, force: true });
      }
      catch {
        // No directory to clean up (test may have failed before it could get to this point)
      }
    }
  });

  it('runs with barrier example: dynenv ./snippet.js -- <command>', () => {
    // snippet.js from README exporting a function that returns env vars
    write(join(cwd, 'snippet.js'), `module.exports = function() { return { REACT_APP_SAY_WHAAAAAT: 'WORLD!' }; };`);
    // child script that asserts env is set
    write(join(cwd, 'child.js'), `process.exit(process.env.REACT_APP_SAY_WHAAAAAT==='WORLD!' ? 0 : 1);`);

    const res = runDynenv(['./snippet.js', '--', 'node', 'child.js'], { cwd });

    expect(res.status).toBe(0);
  });

  it('auto-discovers dynenv entries from node_modules packages (including scoped)', () => {
    // Unscoped package pkg1
    const pkg1Root = join(cwd, 'node_modules', 'pkg1');
    write(join(pkg1Root, 'package.json'), JSON.stringify({ name: 'pkg1', version: '1.0.0', dynenv: 'env/a.js' }, null, 2));
    write(join(pkg1Root, 'env', 'a.js'), `module.exports = () => ({ AUTO_DISCOVERED: 'YES' });`);

    // Scoped package @scope/pkg2
    const pkg2Root = join(cwd, 'node_modules', '@scope', 'pkg2');
    write(join(pkg2Root, 'package.json'), JSON.stringify({ name: '@scope/pkg2', version: '1.0.0', dynenv: 'env/b.js' }, null, 2));
    write(join(pkg2Root, 'env', 'b.js'), `module.exports = () => ({ SCOPED: 'OK' });`);

    // child script checks both env vars injected
    write(join(cwd, 'verify.js'), `const ok = process.env.AUTO_DISCOVERED==='YES' && process.env.SCOPED==='OK'; process.exit(ok?0:1);`);

    const res = runDynenv(['node', 'verify.js'], { cwd });

    expect(res.status).toBe(0);
  });
});
