#!/usr/bin/env node
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const path = require('path');
const fs = require('fs');

// attempt to load compiled dist (may be CommonJS or ESM); use createRequire to support either
const distPath = path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'dist', 'convert.js');
try {
    require(distPath);
} catch (e) {
    console.error('Failed to load compiled CLI at', distPath, e && e.message ? e.message : e);
    process.exit(2);
}
