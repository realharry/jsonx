import { readFileSync } from 'fs';
import { createFilter } from '@rollup/pluginutils';
import path from 'path';
// Avoid requiring `vite` types at build-time in consumer repo; use a lightweight local Plugin type.
type Plugin = any;

export interface JsonxPluginOptions {
    include?: string | string[];
    exclude?: string | string[];
    /**
     * Emit static assets during build. Each entry should point to a source .jsonx file
     * (relative to process.cwd() or absolute). `fileName` is the output path inside the bundle/dist.
     */
    emit?: Array<{ src: string; fileName?: string; indent?: number | string; mapping?: (obj: any) => any }>;
    /**
     * Options to forward to the underlying parser (e.g., allowUnquotedKeys, allowSingleQuotedStrings)
     */
    parserOptions?: Record<string, any>;
}

export default function jsonxPlugin(opts: JsonxPluginOptions = {}): Plugin {
    const filter = createFilter(opts.include ?? ['**/*.jsonx'], opts.exclude);
    return {
        name: 'vite-plugin-jsonx',
        enforce: 'pre',
        async buildStart() {
            if (!opts.emit || !opts.emit.length) return;
            // dynamic import to avoid ESM/CJS interop at plugin load-time
            const core = await import('@aimuse/jsonx-core');
            const ParserCtor: any = core.SimpleJsonParser || core.default || core;
            for (const e of opts.emit) {
                const srcPath = path.isAbsolute(e.src) ? e.src : path.resolve(process.cwd(), e.src);
                try {
                    const content = readFileSync(srcPath, 'utf8');
                    const pOpts = Object.assign({}, opts.parserOptions || {});
                    if (pOpts.allowUnquotedKeys && !pOpts.customLiterals) {
                        // Ensure tokenizer treats identifiers as identifiers (not null/true/false)
                        pOpts.customLiterals = pOpts.customLiterals || {};
                    }
                    const parser = new ParserCtor(pOpts);
                    const obj = parser.parse ? parser.parse(content, pOpts) : (ParserCtor as any)(content);
                    const mapped = e.mapping ? e.mapping(obj) : obj;
                    const outName = e.fileName || path.basename(srcPath).replace(/\.jsonx$/i, '.json');
                    const indent = typeof e.indent !== 'undefined' ? e.indent : 2;
                    // emit as asset (rollup/vite will include it in the bundle output)
                    // @ts-ignore - `this.emitFile` exists in Rollup plugin context
                    this.emitFile({ type: 'asset', fileName: outName, source: JSON.stringify(mapped, null, indent) });
                } catch (err) {
                    const msg = (err && (err as any).message) ? (err as any).message : String(err);
                    this.error(`jsonx-plugin: failed to emit ${e.src}: ${msg}`);
                }
            }
        },
        async transform(code: any, id: string) {
            if (!filter(id)) return null;
            const content = readFileSync(id, 'utf8');
            // dynamic import to avoid requiring ESM at plugin load-time
            const core = await import('@aimuse/jsonx-core');
            const ParserCtor: any = core.SimpleJsonParser || core.default || core;
            const pOpts = Object.assign({}, opts.parserOptions || {});
            if (pOpts.allowUnquotedKeys && !pOpts.customLiterals) {
                pOpts.customLiterals = pOpts.customLiterals || {};
            }
            const parser = new ParserCtor(pOpts);
            const obj = parser.parse ? parser.parse(content, pOpts) : (ParserCtor as any)(content);
            const out = `export default ${JSON.stringify(obj)};`;
            return { code: out, map: { mappings: '' } };
        }
    };
}
