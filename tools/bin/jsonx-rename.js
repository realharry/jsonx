#!/usr/bin/env node
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '..', 'dist', 'convert-names.cjs');
try {
    require(distPath);
} catch (e) {
    console.error('Failed to load compiled CLI at', distPath, e && e.message ? e.message : e);
    process.exit(2);
}
