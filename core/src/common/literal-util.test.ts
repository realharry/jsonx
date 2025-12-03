import { LiteralUtil } from './literal-util';
import { CyclicCharArray } from './cyclic-char-array';

describe('LiteralUtil', () => {
    test('isNull/isTrue/isFalse for arrays and cyclic arrays', () => {
        expect(LiteralUtil.isNull(['n', 'u', 'l', 'l'])).toBe(true);
        expect(LiteralUtil.isNullIgnoreCase(['N', 'U', 'L', 'L'])).toBe(true);
        expect(LiteralUtil.isTrue(['t', 'r', 'u', 'e'])).toBe(true);
        expect(LiteralUtil.isTrueIgnoreCase(['T', 'R', 'U', 'E'])).toBe(true);
        expect(LiteralUtil.isFalse(['f', 'a', 'l', 's', 'e'])).toBe(true);
        expect(LiteralUtil.isFalseIgnoreCase(['F', 'A', 'L', 'S', 'E'])).toBe(true);

        const backing = ['x', 'n', 'u', 'l', 'l', 'y'];
        const c = CyclicCharArray.wrap(backing, 1, 4);
        expect(LiteralUtil.isNull(c)).toBe(true);
    });

    test('false for wrong lengths or null input', () => {
        expect(LiteralUtil.isNull(['n', 'u', 'l'])).toBe(false);
        expect(LiteralUtil.isTrue(['t', 'r', 'u'])).toBe(false);
        expect(LiteralUtil.isFalse(null as any)).toBe(false);
    });
});
