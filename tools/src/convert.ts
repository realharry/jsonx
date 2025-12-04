#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { Command } from 'commander';
import { SimpleJsonParser } from '@aimuse/jsonx-core';

const program = new Command();

program
    .name('jsonx-to-json')
    .description('Convert a .jsonx file (enhanced JSON) to pure JSON')
    .argument('<input>', 'Input .jsonx file')
    .argument('[output]', 'Output JSON file (defaults to stdout)')
    .option('-i, --indent <n>', 'Indentation spaces for output JSON', (v) => parseInt(v, 10), 2)
    .option('--allow-comments', 'Allow comments during parse', false)
    .option('--allow-single-quoted-strings', 'Allow single quoted strings', false)
    .option('--allow-unquoted-keys', 'Allow unquoted keys', false)
    .option('--allow-trailing-comma', 'Allow trailing commas', false)
    .action(async (input: string, output: string | undefined, opts: any) => {
        try {
            const inPath = path.resolve(process.cwd(), input);
            const content = fs.readFileSync(inPath, 'utf8');

            const parser = new SimpleJsonParser();
            const parsed = await parser.parse(content, {
                allowComments: !!opts.allowComments,
                allowSingleQuotedStrings: !!opts.allowSingleQuotedStrings,
                allowUnquotedKeys: !!opts.allowUnquotedKeys,
                allowTrailingComma: !!opts.allowTrailingComma
            });

            const jsonOut = JSON.stringify(parsed, null, opts.indent);

            if (output) {
                const outPath = path.resolve(process.cwd(), output);
                fs.writeFileSync(outPath, jsonOut, 'utf8');
                // ensure newline
                fs.appendFileSync(outPath, '\n');
            } else {
                process.stdout.write(jsonOut + '\n');
            }
        } catch (err: any) {
            console.error('Error converting file:', err?.message ?? err);
            process.exit(2);
        }
    });

program.parseAsync();
