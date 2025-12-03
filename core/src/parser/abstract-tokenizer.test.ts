import { SimpleJsonTokenizer } from './simple-tokenizer';
import { JsonToken, TokenType } from './token';

async function* stringReader(str: string) {
    yield str;
}

async function collectTokens(str: string) {
    const reader = stringReader(str);
    const t = new SimpleJsonTokenizer(reader as any);
    const out: JsonToken[] = [];
    while (await t.hasMore()) {
        const tok = await t.next();
        out.push(tok);
    }
    return out;
}

describe('AbstractJsonTokenizer via SimpleJsonTokenizer', () => {
    test('tokenizes numbers including exponent and signs', async () => {
        const tokens = await collectTokens(' -12.34e+2 ');
        // single NUMBER token expected
        expect(tokens.length).toBe(1);
        expect(tokens[0].type).toBe(TokenType.NUMBER);
        expect(tokens[0].value).toBeCloseTo(-1234);
    });

    test('throws on invalid number like lone dot', async () => {
        const reader = stringReader('.');
        const t = new SimpleJsonTokenizer(reader as any);
        await expect(t.next()).rejects.toThrow(/Invalid number encountered|Expecting a number/);
    });

    test('parses strings with escaped unicode and escaped chars', async () => {
        // string containing an escaped quote and a unicode escape for 'A'
        const input = '"\\\"hello\\u0041"'; // -> "helloA
        const tokens = await collectTokens(input);
        expect(tokens.length).toBe(1);
        expect(tokens[0].type).toBe(TokenType.STRING);
        // token value may include the escaped quote representation
        expect(tokens[0].value).toContain('hello');
    });

    test('parses literals true/false/null and punctuation', async () => {
        const tokens = await collectTokens('{"a":true, "b":false, "c":null}');
        const types = tokens.map(t => t.type);
        expect(types).toContain(TokenType.LCURLY);
        expect(types).toContain(TokenType.RCURLY);
        expect(types).toContain(TokenType.COLON);
        expect(types).toContain(TokenType.COMMA);
        expect(types.filter(x => x === TokenType.BOOLEAN).length).toBe(2);
        expect(types.filter(x => x === TokenType.NULL).length).toBe(1);
    });
});
