import { CharacterUtil } from './character-util';

describe('CharacterUtil', () => {
    test('isWhitespace recognizes space, tab, newline, return', () => {
        expect(CharacterUtil.isWhitespace(' ')).toBe(true);
        expect(CharacterUtil.isWhitespace('\t')).toBe(true);
        expect(CharacterUtil.isWhitespace('\n')).toBe(true);
        expect(CharacterUtil.isWhitespace('\r')).toBe(true);
        expect(CharacterUtil.isWhitespace('x')).toBe(false);
    });

    test('isISOControl recognizes control ranges', () => {
        expect(CharacterUtil.isISOControl('\u0000')).toBe(true);
        expect(CharacterUtil.isISOControl(String.fromCharCode(0x1f))).toBe(true);
        expect(CharacterUtil.isISOControl(String.fromCharCode(0x20))).toBe(false);
        expect(CharacterUtil.isISOControl(String.fromCharCode(0x7f))).toBe(true);
        expect(CharacterUtil.isISOControl(String.fromCharCode(0x9f))).toBe(true);
        expect(CharacterUtil.isISOControl('A')).toBe(false);
    });
});
