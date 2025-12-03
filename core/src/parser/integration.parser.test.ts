import fs from 'fs/promises';
import path from 'path';
import { SimpleJsonParser } from './simple-json-parser';

const FIXTURES = ['simple.json', 'nested.json', 'array.json', 'tricky.json'];

describe('Parser integration (fixtures)', () => {
    const parser = new SimpleJsonParser();

    for (const f of FIXTURES) {
        test(`parses fixture ${f}`, async () => {
            const content = await fs.readFile(path.resolve(__dirname, '../fixtures/json', f), 'utf8');
            const expected = JSON.parse(content);
            const actual = await parser.parse(content);
            expect(actual).toEqual(expected);
        });
    }
});
