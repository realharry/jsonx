import { readFileSync } from 'fs';
import { createFilter } from '@rollup/pluginutils';
import type { Plugin } from 'vite';
// Adapt this import to your published package name
import { SimpleJsonParser } from '@aimuse/jsonx-core';

/**
 * Vite plugin to transform `.jsonx` files into JS modules exporting the parsed value.
 * Usage: add this plugin to `vite.config.ts` plugins array.
 */
export default function jsonxPlugin(): Plugin {
    const filter = createFilter(['**/*.jsonx']);
    return {
        name: 'vite-plugin-jsonx',
        enforce: 'pre',
        transform(code, id) {
            if (!filter(id)) return null;
            const content = readFileSync(id, 'utf8');
            // Use your parser directly (avoid shelling out to the CLI)
            const parser = new SimpleJsonParser();
            const obj = parser.parse ? parser.parse(content) : (SimpleJsonParser as any)(content);
            const out = `export default ${JSON.stringify(obj)};`;
            return { code: out, map: { mappings: '' } };
        }
    };
}
