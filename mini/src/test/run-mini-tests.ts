import { parseMini } from '../parser';
import { buildMini } from '../builder';

function assertEqual(a: any, b: any, message?: string) {
    const sa = JSON.stringify(a);
    const sb = JSON.stringify(b);
    if (sa !== sb) throw new Error(message || `Assertion failed: ${sa} !== ${sb}`);
}

function run() {
    console.log('mini: running basic tests');

    // Basic JSON
    assertEqual(parseMini('{"a":1}'), { a: 1 });

    // Comments
    const withComments = '{ /* hello */ "x": 2 // tail\n}';
    assertEqual(parseMini(withComments, { allowComments: true }), { x: 2 });

    // Trailing commas
    const trailing = '{"a":1,}';
    assertEqual(parseMini(trailing, { allowTrailingComma: true }), { a: 1 });

    // Single quotes
    const sQuote = "{'s': 'hello'}";
    assertEqual(parseMini(sQuote, { allowSingleQuotedStrings: true }), { s: 'hello' });

    // Unquoted keys
    const unq = '{ bareKey: 5 }';
    assertEqual(parseMini(unq, { allowUnquotedKeys: true }), { bareKey: 5 });

    // Custom literals
    const lit = '{ a: NaN, b: Infinity, c: -Infinity }';
    const parsed = parseMini(lit, { allowUnquotedKeys: true, customLiterals: { NaN: null, Infinity: 1e308, '-Infinity': -1e308 } });
    assertEqual(parsed, { a: null, b: 1e308, c: -1e308 });

    // Builder
    const out = buildMini({ a: 1 }, { indent: 2 });
    if (!out.includes('"a": 1')) throw new Error('Builder output unexpected');

    console.log('mini: all tests passed');
}

run();
