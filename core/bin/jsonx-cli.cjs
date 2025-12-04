#!/usr/bin/env node
/* Compatibility shim: delegate to the ESM wrapper if present. */
try {
    require('./jsonx-cli.js');
} catch (e) {
    console.error('Please use the ESM wrapper `jsonx-cli.js`.');
    console.error(e && e.message ? e.message : e);
    process.exit(2);
}
