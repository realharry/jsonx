import { JsonToken, TokenType } from './token';

describe('JsonToken', () => {
    test('equals and toString', () => {
        const t1 = new JsonToken(TokenType.STRING, 'hello');
        const t2 = new JsonToken(TokenType.STRING, 'hello');
        const t3 = new JsonToken(TokenType.NUMBER, 123);
        expect(t1.equals(t2)).toBe(true);
        expect(t1.equals(t3)).toBe(false);
        expect(t1.equals(null)).toBe(false);
        expect(t1.toString()).toContain('JsonToken');
    });

    test('getHashCode stable for same values', () => {
        const h1 = JsonToken.getHashCode(TokenType.STRING, 'abc');
        const h2 = JsonToken.getHashCode(TokenType.STRING, 'abc');
        expect(h1).toBe(h2);
        const hNum = JsonToken.getHashCode(TokenType.NUMBER, 42);
        expect(typeof hNum).toBe('number');
    });
});
