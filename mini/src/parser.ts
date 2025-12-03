// Minimal parser for the `mini` package.
// Provides a very small, forgiving parser wrapper around JSON.parse
// with a couple of optional preprocessing steps: strip comments, allow trailing commas, support single-quoted strings.

export interface MiniParseOptions {
    allowComments?: boolean;
    allowTrailingComma?: boolean;
    allowSingleQuotedStrings?: boolean;
    allowUnquotedKeys?: boolean;
    customLiterals?: Record<string, any> | null;
}

function stripComments(input: string): string {
    // Remove // ... and /* ... */ comments (simple heuristic)
    return input.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
}

function removeTrailingCommas(input: string): string {
    // Remove trailing commas before ] or }
    return input.replace(/,\s*(?=[\]}])/g, '');
}

function convertSingleQuotes(input: string): string {
    // Naive conversion: replace single-quoted strings with double-quoted strings
    // This is deliberately minimal and not a full parser.
    return input.replace(/'([^'\\]*(?:\\.[^'\\]*)*)'/g, '"$1"');
}

function escapeRegExp(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function replaceUnquotedKeys(input: string): string {
    // Replace unquoted object keys like { key: 1 } -> { "key": 1 }
    // Simple heuristic that avoids strings by scanning.
    let out = '';
    let i = 0;
    let inString = false;
    let stringChar = '';
    while (i < input.length) {
        const ch = input[i];
        if (!inString && (ch === '"' || ch === "'")) {
            inString = true;
            stringChar = ch;
            out += ch;
            i++;
            continue;
        }
        if (inString) {
            out += ch;
            if (ch === stringChar) {
                // check not escaped
                let back = i - 1;
                let esc = false;
                while (back >= 0 && input[back] === '\\') { esc = !esc; back--; }
                if (!esc) { inString = false; stringChar = ''; }
            }
            i++;
            continue;
        }

        // detect pattern: {  identifier  :
        if (ch === '{' || ch === ',') {
            out += ch;
            let j = i + 1;
            // consume whitespace
            while (j < input.length && /\s/.test(input[j])) { out += input[j]; j++; }
            // now if identifier begins
            const idMatch = /^[A-Za-z_][A-Za-z0-9_]*/.exec(input.slice(j));
            if (idMatch) {
                const id = idMatch[0];
                const after = j + id.length;
                // skip whitespace
                let k = after;
                while (k < input.length && /\s/.test(input[k])) k++;
                if (input[k] === ':') {
                    // replace identifier with quoted identifier
                    out += '"' + id + '"';
                    i = j + id.length;
                    continue;
                }
            }
            i = j;
            continue;
        }

        out += ch;
        i++;
    }
    return out;
}

function replaceLiterals(input: string, mapping: Record<string, any>): string {
    if (!mapping || Object.keys(mapping).length === 0) return input;
    let out = '';
    let i = 0;
    let inString = false;
    let stringChar = '';
    while (i < input.length) {
        const ch = input[i];
        if (!inString && (ch === '"' || ch === "'")) {
            inString = true; stringChar = ch; out += ch; i++; continue;
        }
        if (inString) {
            out += ch;
            if (ch === stringChar) {
                let back = i - 1; let esc = false; while (back >= 0 && input[back] === '\\') { esc = !esc; back--; }
                if (!esc) { inString = false; stringChar = ''; }
            }
            i++; continue;
        }

        // if start of an identifier-like token
        if (/[A-Za-z_\-]/.test(ch)) {
            let j = i;
            let token = '';
            while (j < input.length && /[A-Za-z0-9_\-+\.]/.test(input[j])) { token += input[j]; j++; }
            if (Object.prototype.hasOwnProperty.call(mapping, token)) {
                out += JSON.stringify(mapping[token]);
                i = j; continue;
            }
        }

        out += ch; i++;
    }
    return out;
}

export function parseMini(text: string, options?: MiniParseOptions): any {
    let t = text;
    const opts = options || {};
    if (opts.allowComments) {
        t = stripComments(t);
    }
    if (opts.allowSingleQuotedStrings) {
        t = convertSingleQuotes(t);
    }
    if (opts.allowUnquotedKeys) {
        t = replaceUnquotedKeys(t);
    }
    if (opts.customLiterals) {
        t = replaceLiterals(t, opts.customLiterals);
    }
    if (opts.allowTrailingComma) {
        t = removeTrailingCommas(t);
    }

    try {
        return JSON.parse(t);
    } catch (e) {
        throw new SyntaxError(`mini parser: failed to parse JSON - ${e instanceof Error ? e.message : String(e)}`);
    }
}
