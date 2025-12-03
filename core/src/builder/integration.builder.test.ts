import fs from 'fs/promises';
import path from 'path';
import { SimpleJsonBuilder } from './simple-json-builder';

const FIXTURES = ['simple.json', 'nested.json', 'array.json', 'tricky.json'];

describe('Builder integration (fixtures)', () => {
    const builder = new SimpleJsonBuilder();

    for (const f of FIXTURES) {
        test(`builds fixture ${f} and round-trips`, async () => {
            const content = await fs.readFile(path.resolve(__dirname, '../fixtures/json', f), 'utf8');
            const obj = JSON.parse(content);
            const built = builder.build(obj);
            // built should be valid JSON and parse back to an equivalent object
            const reparsed = JSON.parse(built);
            expect(reparsed).toEqual(obj);

            // also ensure indentation build is parseable
            const builtIndented = builder.build(obj, 2);
            const reparsed2 = JSON.parse(builtIndented);
            expect(reparsed2).toEqual(obj);
        });
    }
});
