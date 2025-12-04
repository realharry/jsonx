"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
jest.setTimeout(60000);
test('pack tools and install in temp project, verify bin', () => {
    const toolsDir = path_1.default.resolve(__dirname, '..');
    // Run npm pack in tools directory
    const pack = (0, child_process_1.spawnSync)('npm', ['pack'], { cwd: toolsDir, encoding: 'utf8' });
    if (pack.status !== 0) {
        throw new Error('npm pack failed: ' + pack.stderr);
    }
    const tgzName = pack.stdout.trim().split('\n').pop();
    const tgzPath = path_1.default.resolve(toolsDir, tgzName);
    // Create temp project
    const tmp = fs_1.default.mkdtempSync(path_1.default.join(os_1.default.tmpdir(), 'jsonx-tools-test-'));
    fs_1.default.writeFileSync(path_1.default.join(tmp, 'package.json'), JSON.stringify({ name: 'tmp-test', version: '1.0.0' }));
    // copy input fixture
    const input = path_1.default.resolve(toolsDir, 'test', 'input.jsonx');
    const destInput = path_1.default.join(tmp, 'input.jsonx');
    fs_1.default.copyFileSync(input, destInput);
    // Install packed tgz
    const install = (0, child_process_1.spawnSync)('npm', ['install', tgzPath], { cwd: tmp, encoding: 'utf8' });
    if (install.status !== 0) {
        throw new Error('npm install failed: ' + install.stderr);
    }
    // Also install local core package (workspace local dependency) so the packed package can resolve it
    const corePath = path_1.default.resolve(toolsDir, '..', 'core');
    const installCore = (0, child_process_1.spawnSync)('npm', ['install', corePath], { cwd: tmp, encoding: 'utf8' });
    if (installCore.status !== 0) {
        throw new Error('npm install core failed: ' + installCore.stderr);
    }
    // Run the bin from node_modules/.bin (pass parser flags)
    const bin = path_1.default.join(tmp, 'node_modules', '.bin', 'jsonx-to-json');
    const run = (0, child_process_1.spawnSync)(bin, [destInput, '--allow-comments', '--allow-single-quoted-strings', '--allow-unquoted-keys', '--allow-trailing-comma', '-i', '2'], { cwd: tmp, encoding: 'utf8' });
    if (run.status !== 0) {
        throw new Error('running bin failed: ' + run.stderr);
    }
    const obj = JSON.parse(run.stdout);
    expect(obj.unquotedKey).toBe('value');
    // cleanup pack file in tools
    try {
        fs_1.default.unlinkSync(tgzPath);
    }
    catch (e) { }
});
