// Minimal builder for the `mini` package.
export interface MiniBuildOptions {
    indent?: number;
}

export function buildMini(value: any, options?: MiniBuildOptions): string {
    const opts = options || {};
    const indent = typeof opts.indent === 'number' ? opts.indent : 2;
    try {
        return JSON.stringify(value, null, indent) + '\n';
    } catch (e) {
        throw new Error(`mini builder: failed to serialize value - ${e instanceof Error ? e.message : String(e)}`);
    }
}
