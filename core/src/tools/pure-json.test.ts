import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { parseFileStrict, writeFileStrict } from './pure-json';

describe('pure-json tools', () => {
    test('parse and write strict JSON file', async () => {
        const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'pj-'));
        const file = path.join(tmp, 'cfg.json');
        const obj = { a: 1, b: 'x', nested: { c: true } };
        await writeFileStrict(file, obj, 2);
        const parsed = await parseFileStrict(file);
        expect(parsed).toEqual(obj);
        await fs.rm(tmp, { recursive: true, force: true });
    });

    test('allowedKeys validation', async () => {
        const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'pj-'));
        const file = path.join(tmp, 'cfg2.json');
        const obj = { foo: 'bar', keep: 1 };
        await writeFileStrict(file, obj);
        // should throw because 'foo' not allowed
        await expect(parseFileStrict(file, { allowedKeys: ['keep'] })).rejects.toThrow(/Unexpected key/);
        await fs.rm(tmp, { recursive: true, force: true });
    });
});
