import { SimpleJsonBuilder } from './builder/simple-json-builder.js';
import { SimpleJsonParser } from './parser/simple-json-parser.js';

export function runJsonxTests(describe: (description: string, fn: () => void) => void,
  it: (description: string, fn: () => Promise<void> | void) => Promise<void> | void,
  expect: (received: any) => { toEqual: (expected: any) => void }) {
  describe('Jsonx', () => {
    describe('Parser', () => {
      const parser = new SimpleJsonParser();

      it('should parse a simple JSON object', async () => {
        const jsonStr = '{"a": 1, "b": "hello"}';
        const expected = { a: 1, b: 'hello' };
        const result = await parser.parse(jsonStr);
        expect(result).toEqual(expected);
      });

      it('should parse a JSON object with nested objects and arrays', async () => {
        const jsonStr =
          '{"a": [3, 5, 7], "b": {"c": true, "d": null}, "e": "world"}';
        const expected = {
          a: [3, 5, 7],
          b: { c: true, d: null },
          e: 'world',
        };
        const result = await parser.parse(jsonStr);
        expect(result).toEqual(expected);
      });

      it('should parse a JSON array', async () => {
        const jsonStr = '[31, {"a":[3, false, true], "b":null}, "ft", null]';
        const expected = [31, { "a": [3, false, true], "b": null }, "ft", null];
        const result = await parser.parse(jsonStr);
        expect(result).toEqual(expected);
      });
    });

    describe('Builder', () => {
      const builder = new SimpleJsonBuilder();

      it('should build a simple JSON object', () => {
        const obj = { a: 1, b: 'hello' };
        const expected = '{"a":1,"b":"hello"}';
        const result = builder.build(obj);
        expect(result).toEqual(expected);
      });

      it('should build a JSON object with nested objects and arrays', () => {
        const obj = {
          a: [3, 5, 7],
          b: { c: true, d: null },
          e: 'world',
        };
        const expected = '{"a":[3,5,7],"b":{"c":true,"d":null},"e":"world"}';
        const result = builder.build(obj);
        expect(result).toEqual(expected);
      });

      it('should build a JSON array', () => {
        const obj = [31, { "a": [3, false, true], "b": null }, "ft", null];
        const expected = '[31,{"a":[3,false,true],"b":null},"ft",null]';
        const result = builder.build(obj);
        expect(result).toEqual(expected);
      });

      it('should build a JSON object with indentation', () => {
        const obj = {
          a: [3, 5, 7],
          b: { c: true, d: null },
          e: 'world',
        };
        const expected = `{
    "a": [
        3,
        5,
        7
    ],
    "b": {
        "c": true,
        "d": null
    },
    "e": "world"
}`;
        const result = builder.build(obj, 4);
        expect(result).toEqual(expected);
      });
    });
  });
}

// If running under Jest, automatically register the tests using Jest's globals.
// This keeps the file usable by the custom `test-runner.ts` which imports
// and invokes `runJsonxTests`, while allowing Jest to discover and run tests.
declare const describe: any;
declare const it: any;
declare const expect: any;

if (typeof describe === 'function') {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  runJsonxTests(describe, it, expect);
}
