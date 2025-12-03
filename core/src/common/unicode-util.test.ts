import { UnicodeUtil } from './unicode-util';
import { CyclicCharArray } from './cyclic-char-array';

describe('UnicodeUtil', () => {
    test('isUnicodeHex and getIntEquivalent', () => {
        expect(UnicodeUtil.isUnicodeHex('A')).toBe(true);
        expect(UnicodeUtil.isUnicodeHex('f')).toBe(true);
        expect(UnicodeUtil.isUnicodeHex('g')).toBe(false);

        expect(UnicodeUtil.getIntEquivalent('0')).toBe(0);
        expect(UnicodeUtil.getIntEquivalent('9')).toBe(9);
        expect(UnicodeUtil.getIntEquivalent('A')).toBe(10);
        expect(UnicodeUtil.getIntEquivalent('F')).toBe(15);
        expect(UnicodeUtil.getIntEquivalent('a')).toBe(10);
        expect(UnicodeUtil.getIntEquivalent('z')).toBe(0);
    });

    test('getUnicodeChar behavior (valid and invalid)', () => {
        expect(UnicodeUtil.getUnicodeChar(['0', '0', '4', '1'])).toBe('A');
        expect(UnicodeUtil.getUnicodeChar(CyclicCharArray.wrap(['0', '0', '4', '2'], 0, 4))).toBe('B');
        // invalid lengths return empty string
        expect(UnicodeUtil.getUnicodeChar(['0', '0', '4'])).toBe('');
    });

    test('getUnicodeHexCodeFromChar returns six-char escape', () => {
        const esc = UnicodeUtil.getUnicodeHexCodeFromChar('A');
        expect(Array.isArray(esc)).toBe(true);
        expect(esc.join('')).toBe('\\u0041');
    });
});
