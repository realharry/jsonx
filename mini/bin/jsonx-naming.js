#!/usr/bin/env node
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const path = require('path');
const fs = require('fs');
const { Command } = require('commander');

const pkgRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const dist = path.join(pkgRoot, 'dist');
const lib = require(path.join(dist, 'index.js'));

const program = new Command();
program
    .name('jsonx-naming')
    .description('Convert a .jsonx file and apply naming conventions using the mini example')
    .argument('<input>', 'input .jsonx file')
    .argument('[output]', 'output file (defaults to stdout)')
    .option('-j, --json-case <case>', 'json key case: snake|camel|pascal', 'snake')
    .option('-o, --object-case <case>', 'object property case: camel|pascal|identity', 'camel')
    .action((input, output, opts) => {
        try {
            const inPath = path.resolve(process.cwd(), input);
            const content = fs.readFileSync(inPath, 'utf8');
            const out = lib.convertJsonxNaming(content, { jsonCase: opts.jsonCase, objectCase: opts.objectCase });
            if (output) {
                fs.writeFileSync(path.resolve(process.cwd(), output), out, 'utf8');
            } else {
                process.stdout.write(out + '\n');
            }
        } catch (err) {
            console.error('Error:', err && err.message ? err.message : err);
            process.exit(2);
        }
    });

program.parse(process.argv);
