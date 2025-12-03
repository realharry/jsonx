import { SimpleJsonBuilder } from './simple-json-builder';

describe('SimpleJsonBuilder', () => {
    const b = new SimpleJsonBuilder();

    test('builds primitives and collections', () => {
        expect(b.build({ a: 1, b: 'hi' })).toBe('{"a":1,"b":"hi"}');
        expect(b.build([1, 'x', null])).toBe('[1,"x",null]');
        expect(b.build(null)).toBe('null');
        expect(b.build(undefined)).toBe('null');
        expect(b.build(true)).toBe('true');
    });

    test('escapes quotes and backslashes and control characters', () => {
        const obj = { s: 'He said "hi" \\ and control ' + String.fromCharCode(1) };
        const out = b.build(obj);
        expect(out).toContain('He said');
        expect(out).toContain('\\"'); // escaped quote
        expect(out).toContain('\\\\'); // escaped backslash
        expect(out).toMatch(/\\u00../); // control char emits unicode escape like \u00xx
    });

    test('build with indentation produces newlines and spaces', () => {
        const obj = { a: [1, 2], b: { c: true } };
        const out = b.build(obj, 2);
        expect(out).toContain('\n');
        expect(out).toContain('  "a": [');
    });
});
