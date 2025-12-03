#!/usr/bin/env node
'use strict';
/* CLI wrapper: prefer running built CLI at dist/tools/jsonx-cli.js; fall back to ts-node if available. */
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function run() {
    const args = process.argv.slice(2);
    const built = path.resolve(__dirname, '../dist/tools/jsonx-cli.js');
    // Prefer running the compiled ESM CLI if present (reliable runtime behavior).
    const companion = path.resolve(__dirname, '../dist/tools/jsonx.js');
    if (fs.existsSync(built) && fs.existsSync(companion)) {
        try {
            require.resolve('commander', { paths: [process.cwd()] });
            const r = spawnSync(process.execPath, [built, ...args], { stdio: 'inherit' });
            process.exit(r.status === null ? 0 : r.status);
        } catch (ee) {
            // If runtime deps missing, fall back to ts-node if available below
        }
    }

    // Fallback to running the TypeScript source via ts-node if available (developer mode).
    try {
        const tsNodeRegister = require.resolve('ts-node/register/transpile-only', { paths: [process.cwd()] });
        const tsSource = path.resolve(__dirname, '../src/tools/jsonx-cli.ts');
        const r = spawnSync(process.execPath, ['-r', tsNodeRegister, tsSource, ...args], { stdio: 'inherit' });
        process.exit(r.status === null ? 0 : r.status);
    } catch (e) {
        console.error('jsonx-cli: neither a runnable built CLI nor ts-node were available.');
        console.error('Run `npm install` to install dependencies and `npm run jsonx:build` to compile the CLI.');
        process.exit(2);
    }
}

run();
