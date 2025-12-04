const { execFileSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

jest.setTimeout(60000);

test('pack tools and install in temp project, verify bin', () => {
    const toolsDir = path.resolve(__dirname, '..');
    const cwd = process.cwd();

    // Run npm pack in tools directory
    const pack = spawnSync('npm', ['pack'], { cwd: toolsDir, encoding: 'utf8' });
    if (pack.status !== 0) {
        throw new Error('npm pack failed: ' + pack.stderr);
    }
    const tgzName = pack.stdout.trim().split('\n').pop();
    const tgzPath = path.resolve(toolsDir, tgzName);

    // Create temp project
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'jsonx-tools-test-'));
    fs.writeFileSync(path.join(tmp, 'package.json'), JSON.stringify({ name: 'tmp-test', version: '1.0.0' }));

    // copy input fixture
    const input = path.resolve(toolsDir, 'test', 'input.jsonx');
    const destInput = path.join(tmp, 'input.jsonx');
    fs.copyFileSync(input, destInput);

    // Install packed tgz
    const install = spawnSync('npm', ['install', tgzPath], { cwd: tmp, encoding: 'utf8' });
    if (install.status !== 0) {
        throw new Error('npm install failed: ' + install.stderr);
    }

    // Also install local core package (workspace local dependency) so the packed package can resolve it
    const corePath = path.resolve(toolsDir, '..', 'core');
    const installCore = spawnSync('npm', ['install', corePath], { cwd: tmp, encoding: 'utf8' });
    if (installCore.status !== 0) {
        throw new Error('npm install core failed: ' + installCore.stderr);
    }

    // Run the bin from node_modules/.bin (pass parser flags)
    const bin = path.join(tmp, 'node_modules', '.bin', 'jsonx-to-json');
    const run = spawnSync(bin, [destInput, '--allow-comments', '--allow-single-quoted-strings', '--allow-unquoted-keys', '--allow-trailing-comma', '-i', '2'], { cwd: tmp, encoding: 'utf8' });
    if (run.status !== 0) {
        throw new Error('running bin failed: ' + run.stderr);
    }
    const obj = JSON.parse(run.stdout);
    expect(obj.unquotedKey).toBe('value');

    // cleanup pack file in tools
    try { fs.unlinkSync(tgzPath); } catch (e) { }
});
