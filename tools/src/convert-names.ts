#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { Command } from 'commander';
import { SimpleJsonParser } from '@aimuse/jsonx-core';
import { JsonMapper, NamingCase } from '@aimuse/jsonx-core/dist/j4json/mapper/JsonMapper';

function detectNamingCaseForKey(key: string): NamingCase {
    if (key.indexOf('_') >= 0) return 'snake';
    // contains uppercase letter -> camel or pascal
    if (/[A-Z]/.test(key)) {
        // starts with uppercase -> pascal, else camel
        if (/^[A-Z]/.test(key)) return 'pascal';
        return 'camel';
    }
    // default: identity
    return 'identity';
}

function detectNamingCase(obj: any): NamingCase {
    // walk shallowly to find representative keys
    const counts: Record<NamingCase, number> = { identity: 0, snake: 0, camel: 0, pascal: 0 };
    function sample(o: any, depth = 0) {
        if (depth > 2) return;
        if (o && typeof o === 'object') {
            if (Array.isArray(o)) {
                if (o.length > 0) sample(o[0], depth + 1);
            } else {
                for (const k of Object.keys(o).slice(0, 10)) {
                    const c = detectNamingCaseForKey(k);
                    counts[c] = (counts[c] || 0) + 1;
                    const v = o[k];
                    if (v && typeof v === 'object') sample(v, depth + 1);
                }
            }
        }
    }
    sample(obj, 0);
    // choose highest count
    let best: NamingCase = 'identity';
    let bestCount = -1;
    (['identity', 'snake', 'camel', 'pascal'] as NamingCase[]).forEach((k) => {
        if ((counts[k] || 0) > bestCount) {
            bestCount = counts[k] || 0;
            best = k;
        }
    });
    return best;
}

const program = new Command();

program
    .name('jsonx-rename')
    .description('Convert field names between naming conventions inside a JSON/JSONX file')
    .argument('<target>', 'Target naming convention: snake|camel|pascal|identity')
    .argument('<input>', 'Input file (.jsonx or .json)')
    .argument('[output]', 'Output file (defaults to stdout)')
    .option('-i, --indent <n>', 'Indentation spaces for output JSON', (v) => parseInt(v, 10), 2)
    .option('--from <case>', 'Force input naming (snake|camel|pascal|identity)')
    .option('--allow-comments', 'Allow comments during parse', false)
    .option('--allow-single-quoted-strings', 'Allow single quoted strings', false)
    .option('--allow-unquoted-keys', 'Allow unquoted keys', false)
    .option('--allow-trailing-comma', 'Allow trailing commas', false)
    .action(async (target: string, input: string, output: string | undefined, opts: any) => {
        try {
            const inPath = path.resolve(process.cwd(), input);
            const content = fs.readFileSync(inPath, 'utf8');

            // parse using core parser (supports JSONX); fall back to JSON.parse if needed
            let parsed: any;
            const parser = new SimpleJsonParser();
            try {
                parsed = await parser.parse(content, {
                    allowComments: !!opts.allowComments,
                    allowSingleQuotedStrings: !!opts.allowSingleQuotedStrings,
                    allowUnquotedKeys: !!opts.allowUnquotedKeys,
                    allowTrailingComma: !!opts.allowTrailingComma
                });
            } catch (e) {
                // fallback to strict JSON
                parsed = JSON.parse(content);
            }

            const targetCase = (['snake', 'camel', 'pascal', 'identity'].includes(target) ? (target as NamingCase) : null) as NamingCase | null;
            if (!targetCase) {
                console.error('Invalid target naming. Use snake|camel|pascal|identity');
                process.exit(2);
                return;
            }

            let fromCase: NamingCase;
            if (opts.from && ['snake', 'camel', 'pascal', 'identity'].includes(opts.from)) {
                fromCase = opts.from as NamingCase;
            } else {
                fromCase = detectNamingCase(parsed);
            }

            // convert: from JSON keys to identity object keys, then to target json keys
            const intermediate = JsonMapper.fromJson(parsed, undefined, { naming: { jsonCase: fromCase, objectCase: 'identity' } });
            const result = JsonMapper.toJson(intermediate, { naming: { objectCase: 'identity', jsonCase: targetCase } });

            const outStr = JSON.stringify(result, null, opts.indent) + '\n';
            if (output) {
                const outPath = path.resolve(process.cwd(), output);
                fs.writeFileSync(outPath, outStr, 'utf8');
            } else {
                process.stdout.write(outStr);
            }
        } catch (err: any) {
            console.error('Error converting field names:', err?.message ?? err);
            process.exit(2);
        }
    });

program.parseAsync();
