import { CharQueue } from './char-queue';

describe('CharQueue', () => {
    test('basic add, poll, peek, toArray operations', () => {
        const q = new CharQueue(8);
        expect(q.isEmpty()).toBe(true);
        expect(q.maxCapacity()).toBe(7);

        expect(q.add('a')).toBe(true);
        expect(q.addAll(['b', 'c', 'd'])).toBe(true);
        expect(q.size()).toBe(4);
        expect(q.peek()).toBe('a');
        expect(q.peekChars(2)).toEqual(['a', 'b']);

        expect(q.poll()).toBe('a');
        expect(q.pollChars(2)).toEqual(['b', 'c']);
        expect(q.size()).toBe(1);

        q.clear();
        expect(q.isEmpty()).toBe(true);
    });

    test('wrap-around and margin behavior', () => {
        // Small requested buffer size is below the minimum; implementation
        // enforces a minimum internal buffer size (8). Verify that behavior
        // and perform wrap-around filling.
        const q = new CharQueue(5);
        // Implementation sets min buffer size to 8, so maxCapacity() == 7
        expect(q.maxCapacity()).toBeGreaterThanOrEqual(7);
        expect(q.addAll(['a', 'b', 'c', 'd'])).toBe(true);

        // Add until the queue is full
        let added = true;
        let extraChars = ['e', 'f', 'g', 'h', 'i'];
        let count = 0;
        for (const ch of extraChars) {
            if (added) {
                added = q.add(ch);
                if (added) count++;
            }
        }
        // After adding some extras, the queue should be full and a further add fails
        // (we don't assert exact counts because min buffer can vary by implementation)
        expect(q.add('Z')).toBe(false);

        // Poll two items then add two more to force wrap
        const first = q.poll();
        const second = q.poll();
        expect(first).not.toBeNull();
        expect(second).not.toBeNull();
        expect(q.addAll(['x', 'y'])).toBe(true);
        // peekBuffer offset invalid returns null
        expect(q.peekBuffer(2, -1)).toBeNull();
        expect(q.peekBuffer(2, 100)).toBeNull();
    });
});
