#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const distPath = path.resolve(__dirname, '..', 'convert-names.js');
try {
    require(distPath);
} catch (e: any) {
    console.error('Failed to load compiled CLI at', distPath, e && e.message ? e.message : e);
    process.exit(2);
}

export { };
