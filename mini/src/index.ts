import { parseMini } from './parser';
import type { MiniParseOptions } from './parser';
import { buildMini } from './builder';
import type { MiniBuildOptions } from './builder';

export { parseMini, MiniParseOptions, buildMini, MiniBuildOptions };

// Convenience functions for working with files
import fs from 'fs';

export function parseFile(path: string, options?: MiniParseOptions): any {
    const content = fs.readFileSync(path, 'utf8');
    return parseMini(content, options);
}

export function writeFile(path: string, value: any, options?: MiniBuildOptions): void {
    const out = buildMini(value, options);
    fs.writeFileSync(path, out, 'utf8');
}
