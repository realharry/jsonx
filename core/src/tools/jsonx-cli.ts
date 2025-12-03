#!/usr/bin/env node
/* eslint-disable no-console */
import fs from 'fs';
import { Command } from 'commander';
import { parseWithOptions, writeFileStrict } from './jsonx';

const program = new Command();

program
    .name('jsonx-cli')
    .description('Convert JSON / extended JSON to canonical pure JSON. Supports comments, trailing commas, single quotes, unquoted keys, and custom literals.')
    .requiredOption('-i, --in <input>', 'Input file path')
    .requiredOption('-o, --out <output>', 'Output file path')
    .option('-m, --mode <mode>', 'Mode: pure|extended', 'pure')
    .option('--allowComments', 'Allow C++/C-style comments when parsing')
    .option('--allowTrailingComma', 'Allow trailing commas in arrays/objects')
    .option('--allowSingleQuotedStrings', 'Allow single-quoted strings')
    .option('--allowUnquotedKeys', 'Allow unquoted keys (identifiers)')
    .option('--literals <json>', 'JSON mapping for custom literals (or path to JSON file)')
    .option('--preserve-format', 'Preserve original file format and comments by copying input to output')
    .option('--extended-output', 'Write extended JSON output (preserve comments/format)')
    .helpOption('-h, --help', 'Display help');

program.parse(process.argv);
const opts = program.opts();

async function loadLiterals(maybe: string | undefined): Promise<Record<string, any> | null> {
    if (!maybe) return null;
    try {
        return JSON.parse(maybe);
    } catch (_) {
        // try file
        try {
            const content = fs.readFileSync(maybe, 'utf8');
            return JSON.parse(content);
        } catch (e) {
            throw new Error(`Failed to parse literals JSON: ${e}`);
        }
    }
}

async function main(): Promise<void> {
    const input = opts.in;
    const output = opts.out;
    if (opts.preserveFormat || opts.extendedOutput) {
        // Simply copy the input file to output to preserve formatting/comments
        fs.copyFileSync(input, output);
        console.log(`Copied (preserved) ${input} -> ${output}`);
        return;
    }

    const mode = String(opts.mode || 'pure');
    let literals: Record<string, any> | null = null;
    if (opts.literals) {
        literals = await loadLiterals(opts.literals);
    }

    const options: any = {};
    if (mode === 'extended') {
        options.allowComments = !!opts.allowComments;
        options.allowTrailingComma = !!opts.allowTrailingComma;
        options.allowSingleQuotedStrings = !!opts.allowSingleQuotedStrings;
        options.allowUnquotedKeys = !!opts.allowUnquotedKeys;
        options.customLiterals = literals || null;
    }

    try {
        const parsed = await parseWithOptions(input, options);
        await writeFileStrict(output, parsed, 2);
        console.log(`Wrote ${output}`);
    } catch (e: any) {
        console.error('Error:', e && e.message ? e.message : e);
        process.exit(3);
    }
}

if (require.main === module) {
    main().catch((e) => {
        console.error('Fatal error:', e);
        process.exit(4);
    });
}
