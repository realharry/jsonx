import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { parseWithOptions, writeFileStrict } from './jsonx';

describe('jsonx tools', () => {
    test('parse with extended options (single-quoted & comments)', async () => {
        const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'jx-'));
        const file = path.join(tmp, 'in.json');
        const text = "{ // comment\n 'a': 1, }";
        await fs.writeFile(file, text, 'utf8');
        const res = await parseWithOptions(file, { allowComments: true, allowSingleQuotedStrings: true, allowTrailingComma: true });
        expect(res).toEqual({ a: 1 });
        await fs.rm(tmp, { recursive: true, force: true });
    });

    test('writeFileStrict writes JSON file', async () => {
        const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'jx-'));
        const file = path.join(tmp, 'out.json');
        const obj = { x: 1 };
        await writeFileStrict(file, obj, 2);
        const txt = await fs.readFile(file, 'utf8');
        expect(JSON.parse(txt)).toEqual(obj);
        await fs.rm(tmp, { recursive: true, force: true });
    });
});
