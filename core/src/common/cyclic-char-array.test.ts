import { CyclicCharArray } from './cyclic-char-array';

describe('CyclicCharArray', () => {
    test('wrap and basic access', () => {
        const backing = ['a', 'b', 'c', 'd'];
        const c = CyclicCharArray.wrap(backing, 2, 2); // c,d
        expect(c.getOffset()).toBe(2);
        expect(c.getLength()).toBe(2);
        expect(c.getChar(0)).toBe('c');
        expect(c.getChars(0, 2)).toEqual(['c', 'd']);
        expect(c.getArray()).toEqual(['c', 'd']);
    });

    test('wrap with offset beyond end wraps mod array length', () => {
        const backing = ['x', 'y', 'z'];
        const c = CyclicCharArray.wrap(backing, 4, 2); // offset 4 -> index 1 (y), then z
        expect(c.getChar(0)).toBe('y');
        expect(c.getChar(1)).toBe('z');
        expect(c.getArray().length).toBe(2);
    });
});
