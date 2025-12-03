import { parseMini } from '../parser';
import { buildMini } from '../builder';

describe('mini parser and builder', () => {
    test('basic JSON', () => {
        expect(parseMini('{"a":1}')).toEqual({ a: 1 });
    });

    test('comments support', () => {
        const withComments = '{ /* hello */ "x": 2 // tail\n}';
        expect(parseMini(withComments, { allowComments: true })).toEqual({ x: 2 });
    });

    test('trailing commas', () => {
        expect(parseMini('{"a":1,}', { allowTrailingComma: true })).toEqual({ a: 1 });
    });

    test('single quotes', () => {
        expect(parseMini("{'s': 'hello'}", { allowSingleQuotedStrings: true })).toEqual({ s: 'hello' });
    });

    test('unquoted keys', () => {
        expect(parseMini('{ bareKey: 5 }', { allowUnquotedKeys: true })).toEqual({ bareKey: 5 });
    });

    test('custom literals', () => {
        const lit = '{ a: NaN, b: Infinity, c: -Infinity }';
        const parsed = parseMini(lit, { allowUnquotedKeys: true, customLiterals: { NaN: null, Infinity: 1e308, '-Infinity': -1e308 } });
        expect(parsed).toEqual({ a: null, b: 1e308, c: -1e308 });
    });

    test('builder output', () => {
        const out = buildMini({ a: 1 }, { indent: 2 });
        expect(out).toMatch(/"a": 1/);
    });
});
