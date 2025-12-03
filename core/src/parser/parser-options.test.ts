import { SimpleJsonParser } from './simple-json-parser';

test('parse allows single-line comments when enabled', async () => {
    const p = new SimpleJsonParser();
    const jsonStr = '{ // comment\n "x": 1 }';
    const res = await p.parse(jsonStr, { allowComments: true });
    expect(res).toEqual({ x: 1 });
});

test('parse allows multi-line comments when enabled', async () => {
    const p = new SimpleJsonParser();
    const jsonStr = '{ /* multi\n line */ "x": 2 }';
    const res = await p.parse(jsonStr, { allowComments: true });
    expect(res).toEqual({ x: 2 });
});

test('parse allows trailing commas when enabled (object)', async () => {
    const p = new SimpleJsonParser();
    const jsonStr = '{ "a":1, }';
    const res = await p.parse(jsonStr, { allowTrailingComma: true });
    expect(res).toEqual({ a: 1 });
});

test('parse allows trailing commas when enabled (array)', async () => {
    const p = new SimpleJsonParser();
    const jsonStr = '[1,2,]';
    const res = await p.parse(jsonStr, { allowTrailingComma: true });
    expect(res).toEqual([1, 2]);
});

test('parse allows single-quoted strings when enabled', async () => {
    const p = new SimpleJsonParser();
    const jsonStr = "{ 'a': 'hello', \"b\": 'world' }";
    const res = await p.parse(jsonStr, { allowSingleQuotedStrings: true, allowUnquotedKeys: false });
    expect(res).toEqual({ a: 'hello', b: 'world' });
});

test('parse allows unquoted keys when enabled', async () => {
    const p = new SimpleJsonParser();
    const jsonStr = '{ a: 1, b: 2 }';
    const res = await p.parse(jsonStr, { allowUnquotedKeys: true });
    expect(res).toEqual({ a: 1, b: 2 });
});

test('parse supports custom literal tokens via options', async () => {
    const p = new SimpleJsonParser();
    const jsonStr = '{ x: NaN, y: INF }';
    const res = await p.parse(jsonStr, { allowUnquotedKeys: true, customLiterals: { NaN: NaN, INF: Infinity } });
    expect(Number.isNaN(res.x)).toBeTruthy();
    expect(res.y).toBe(Infinity);
});
