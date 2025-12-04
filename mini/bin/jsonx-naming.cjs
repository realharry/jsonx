#!/usr/bin/env node
/* Compatibility shim: delegate to the ESM wrapper if present. */
try {
  require('./jsonx-naming.js');
} catch (e) {
  console.error('Please use the ESM wrapper `jsonx-naming.js`.');
  console.error(e && e.message ? e.message : e);
  process.exit(2);
}
