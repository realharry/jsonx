import { Symbols } from './symbols';

describe('Symbols', () => {
    test('basic constants and escapable detection', () => {
        expect(Symbols.COMMA).toBe(',');
        expect(Symbols.COLON).toBe(':');
        expect(Symbols.DQUOTE).toBe('"');
        expect(Symbols.isEscapableChar('"')).toBe(true);
        expect(Symbols.isEscapableChar('/')).toBe(true);
        expect(Symbols.isEscapableChar('x')).toBe(false);
    });

    test('getEscapedChar returns expected escape sequences', () => {
        expect(Symbols.getEscapedChar('"')).toBe('\\"');
        expect(Symbols.getEscapedChar('\\')).toBe('\\\\');
        expect(Symbols.getEscapedChar('\n')).toBe('\\n');
        expect(Symbols.getEscapedChar('z')).toBeNull();
    });

    test('number start and exponent recognition', () => {
        expect(Symbols.isStartingNumber('-')).toBe(true);
        expect(Symbols.isStartingNumber('+')).toBe(true);
        expect(Symbols.isStartingNumber('.')).toBe(true);
        expect(Symbols.isStartingNumber('3')).toBe(true);
        expect(Symbols.isStartingNumber('a')).toBe(false);

        expect(Symbols.isExponentChar('e')).toBe(true);
        expect(Symbols.isExponentChar('E')).toBe(true);
        expect(Symbols.isExponentChar('x')).toBe(false);
    });
});
