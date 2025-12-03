import { CharacterUtil } from './character-util';
import { CharQueue } from './char-queue';
import { CyclicCharArray } from './cyclic-char-array';
import { LiteralUtil } from './literal-util';
import { Literals } from './literals';
import { Symbols } from './symbols';
import { UnicodeUtil } from './unicode-util';

describe('common utilities', () => {
    test('CharacterUtil whitespace and ISO control', () => {
        expect(CharacterUtil.isWhitespace(' ')).toBe(true);
        expect(CharacterUtil.isWhitespace('\n')).toBe(true);
        expect(CharacterUtil.isWhitespace('a')).toBe(false);

        expect(CharacterUtil.isISOControl('\u0000')).toBe(true);
        expect(CharacterUtil.isISOControl('\u007f')).toBe(true);
        expect(CharacterUtil.isISOControl('A')).toBe(false);
    });

    test('Symbols helpers and escaped chars', () => {
        expect(Symbols.COMMA).toBe(',');
        expect(Symbols.isEscapableChar('"')).toBe(true);
        expect(Symbols.isEscapableChar('x')).toBe(false);
        expect(Symbols.getEscapedChar('"')).toBe('\\"');
        expect(Symbols.getEscapedChar('\n')).toBe('\\n');
        expect(Symbols.isStartingNumber('-')).toBe(true);
        expect(Symbols.isStartingNumber('+')).toBe(true);
        expect(Symbols.isStartingNumber('.')).toBe(true);
        expect(Symbols.isStartingNumber('5')).toBe(true);
        expect(Symbols.isExponentChar('e')).toBe(true);
        expect(Symbols.isExponentChar('E')).toBe(true);
        expect(Symbols.isExponentChar('x')).toBe(false);
    });

    test('UnicodeUtil hex and code conversions', () => {
        expect(UnicodeUtil.isUnicodeHex('A')).toBe(true);
        expect(UnicodeUtil.isUnicodeHex('f')).toBe(true);
        expect(UnicodeUtil.isUnicodeHex('g')).toBe(false);

        expect(UnicodeUtil.getIntEquivalent('0')).toBe(0);
        expect(UnicodeUtil.getIntEquivalent('9')).toBe(9);
        expect(UnicodeUtil.getIntEquivalent('A')).toBe(10);
        expect(UnicodeUtil.getIntEquivalent('F')).toBe(15);
        expect(UnicodeUtil.getIntEquivalent('a')).toBe(10);

        const hexArr = ['0', '0', '4', '1']; // 'A'
        expect(UnicodeUtil.getUnicodeChar(hexArr)).toBe('A');
        expect(UnicodeUtil.getUnicodeCharNoCheck(hexArr)).toBe('A');

        const code = UnicodeUtil.getUnicodeHexCodeFromChar('A');
        expect(code.join('')).toBe('\\u0041');
    });

    test('CyclicCharArray wrap, getChar(s), getArray, toString', () => {
        const backing = ['a', 'b', 'c', 'd', 'e'];
        const wrapped = CyclicCharArray.wrap(backing, 1, 3); // b,c,d
        expect(wrapped.getOffset()).toBe(1);
        expect(wrapped.getLength()).toBe(3);
        expect(wrapped.getChar(0)).toBe('b');
        expect(wrapped.getChars(0, 3)).toEqual(['b', 'c', 'd']);
        expect(wrapped.getArray()).toEqual(['b', 'c', 'd']);
        expect(wrapped.toString()).toBe('bcd');
    });

    test('LiteralUtil null/true/false checks with arrays and cyclic arrays', () => {
        const nullArr = ['n', 'u', 'l', 'l'];
        const trueArr = ['t', 'r', 'u', 'e'];
        const falseArr = ['f', 'a', 'l', 's', 'e'];

        expect(LiteralUtil.isNull(nullArr)).toBe(true);
        expect(LiteralUtil.isNullIgnoreCase(['N', 'U', 'L', 'L'])).toBe(true);
        expect(LiteralUtil.isTrue(trueArr)).toBe(true);
        expect(LiteralUtil.isTrueIgnoreCase(['T', 'R', 'U', 'E'])).toBe(true);
        expect(LiteralUtil.isFalse(falseArr)).toBe(true);
        expect(LiteralUtil.isFalseIgnoreCase(['F', 'A', 'L', 'S', 'E'])).toBe(true);

        // Use CyclicCharArray wrapper
        const backing = ['x', 'n', 'u', 'l', 'l', 'y'];
        const cyclic = CyclicCharArray.wrap(backing, 1, 4); // n,u,l,l
        expect(LiteralUtil.isNull(cyclic)).toBe(true);
        expect(LiteralUtil.isTrue(CyclicCharArray.wrap(['t', 'r', 'u', 'e'], 0, 4))).toBe(true);
    });

    test('CharQueue basic operations', () => {
        const q = new CharQueue(8);
        expect(q.isEmpty()).toBe(true);
        expect(q.size()).toBe(0);
        expect(q.maxCapacity()).toBe(7);

        expect(q.add('a')).toBe(true);
        expect(q.addAll(['b', 'c', 'd'])).toBe(true);
        expect(q.size()).toBe(4);
        expect(q.peek()).toBe('a');
        expect(q.peekChars(2)).toEqual(['a', 'b']);

        expect(q.poll()).toBe('a');
        expect(q.pollChars(2)).toEqual(['b', 'c']);
        expect(q.size()).toBe(1);

        q.addAll(['1', '2', '3', '4']);
        expect(q.size()).toBe(5);
        expect(q.toArray().length).toBe(5);

        const buf = q.pollBuffer(2);
        expect(buf).not.toBeNull();
        expect(buf!.getArray().length).toBe(2);

        q.clear();
        expect(q.isEmpty()).toBe(true);
    });
});
