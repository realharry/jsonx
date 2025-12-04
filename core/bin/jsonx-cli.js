#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

function run() {
    const args = process.argv.slice(2);
    const built = path.resolve(new URL('.', import.meta.url).pathname, '../dist/tools/jsonx-cli.js');
    const companion = path.resolve(new URL('.', import.meta.url).pathname, '../dist/tools/jsonx.js');
    if (fs.existsSync(built) && fs.existsSync(companion)) {
        try {
            require.resolve('commander', { paths: [process.cwd()] });
            const r = spawnSync(process.execPath, [built, ...args], { stdio: 'inherit' });
            process.exit(r.status === null ? 0 : r.status);
        } catch (ee) {
            // fall through to ts-node fallback
        }
    }

    try {
        const tsNodeRegister = require.resolve('ts-node/register/transpile-only', { paths: [process.cwd()] });
        const tsSource = path.resolve(new URL('.', import.meta.url).pathname, '../src/tools/jsonx-cli.ts');
        const r = spawnSync(process.execPath, ['-r', tsNodeRegister, tsSource, ...args], { stdio: 'inherit' });
        process.exit(r.status === null ? 0 : r.status);
    } catch (e) {
        console.error('jsonx-cli: neither a runnable built CLI nor ts-node were available.');
        console.error('Run `npm install` to install dependencies and `npm run jsonx:build` to compile the CLI.');
        process.exit(2);
    }
}

run();
