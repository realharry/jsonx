import fs from 'fs/promises';
import path from 'path';
import { SimpleJsonParser } from '../parser/simple-json-parser';
import { parseFileStrict, writeFileStrict } from './pure-json';

export interface JsonxOptions {
    allowComments?: boolean;
    allowTrailingComma?: boolean;
    allowSingleQuotedStrings?: boolean;
    allowUnquotedKeys?: boolean;
    // customLiterals maps token -> value. Values may be number, boolean, null, or special strings 'NaN','Infinity','-Infinity'
    customLiterals?: Record<string, any> | null;
}

function normalizeLiterals(raw: any): Record<string, any> | null {
    if (!raw) return null;
    const out: Record<string, any> = {};
    for (const k of Object.keys(raw)) {
        const v = raw[k];
        if (typeof v === 'string') {
            switch (v) {
                case 'NaN':
                    out[k] = NaN;
                    break;
                case 'Infinity':
                    out[k] = Infinity;
                    break;
                case '-Infinity':
                    out[k] = -Infinity;
                    break;
                default:
                    // try to parse numeric-like strings
                    const n = Number(v);
                    out[k] = Number.isNaN(n) ? v : n;
            }
        } else {
            out[k] = v;
        }
    }
    return out;
}

export async function parseWithOptions(filePath: string, opts?: JsonxOptions): Promise<any> {
    const content = await fs.readFile(filePath, 'utf8');
    // If no extended options provided, treat as strict
    const anyOpts = opts || {};
    const hasExtended = anyOpts.allowComments || anyOpts.allowTrailingComma || anyOpts.allowSingleQuotedStrings || anyOpts.allowUnquotedKeys || anyOpts.customLiterals;
    if (!hasExtended) {
        return parseFileStrict(filePath);
    }

    const p = new SimpleJsonParser();
    const parserOptions = {
        allowComments: !!anyOpts.allowComments,
        allowTrailingComma: !!anyOpts.allowTrailingComma,
        allowSingleQuotedStrings: !!anyOpts.allowSingleQuotedStrings,
        allowUnquotedKeys: !!anyOpts.allowUnquotedKeys,
        customLiterals: normalizeLiterals(anyOpts.customLiterals || null),
    } as any;

    return p.parse(content, parserOptions);
}

export { writeFileStrict };

export default { parseWithOptions, writeFileStrict };
