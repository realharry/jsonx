import { SimpleJsonParser } from './simple-json-parser';

describe('AbstractBareJsonParser via SimpleJsonParser', () => {
    test('parses simple primitives and structures', async () => {
        const p = new SimpleJsonParser();
        expect(await p.parse('"hi"')).toBe('hi');
        expect(await p.parse('123')).toBe(123);
        expect(await p.parse('true')).toBe(true);
        expect(await p.parse('null')).toBeNull();
        expect(await p.parse('[1,2,3]')).toEqual([1, 2, 3]);
        expect(await p.parse('{"x":1,"y":"z"}')).toEqual({ x: 1, y: 'z' });
    });

    test('throws on invalid starting token', async () => {
        const p = new SimpleJsonParser();
        await expect(p.parse('x')).rejects.toThrow(/Invalid (JSON input|symbol encountered)/);
    });

    test('throws when object key is not string', async () => {
        const p = new SimpleJsonParser();
        // malformed JSON where key is a number token rather than string
        await expect(p.parse('{1:2}')).rejects.toThrow(/Expected string key/);
    });
});
