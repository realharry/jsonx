import fs from 'fs/promises';
import path from 'path';
import { SimpleJsonParser } from '../parser/simple-json-parser';

export interface ParseOptions {
    // If provided, validate that the top-level object contains only these keys.
    allowedKeys?: string[];
}

export async function parseFileStrict(filePath: string, options?: ParseOptions): Promise<any> {
    const content = await fs.readFile(filePath, 'utf8');
    // Use the strict parser (no permissive options)
    const p = new SimpleJsonParser();
    const parsed = await p.parse(content, {});

    if (options?.allowedKeys && parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        const keys = Object.keys(parsed);
        for (const k of keys) {
            if (!options.allowedKeys.includes(k)) {
                throw new Error(`Unexpected key in configuration: ${k}`);
            }
        }
    }

    return parsed;
}

export async function writeFileStrict(filePath: string, data: any, indent = 2): Promise<void> {
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    const text = JSON.stringify(data, null, indent) + '\n';
    await fs.writeFile(filePath, text, 'utf8');
}

export default { parseFileStrict, writeFileStrict };
