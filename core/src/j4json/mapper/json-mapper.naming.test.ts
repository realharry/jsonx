import { JsonMapper } from './JsonMapper';

describe('JsonMapper naming conversions', () => {
    test('camel -> snake when serializing', () => {
        const obj = { myProp: 1, anotherField: 'x' };
        const json = JsonMapper.toJson(obj, { naming: { objectCase: 'camel', jsonCase: 'snake' } });
        expect(json).toHaveProperty('my_prop', 1);
        expect(json).toHaveProperty('another_field', 'x');
    });

    test('snake -> camel when parsing', () => {
        const json = { my_prop: 2, another_field: 'y' };
        const obj = JsonMapper.fromJson(json, undefined, { naming: { jsonCase: 'snake', objectCase: 'camel' } });
        expect(obj.myProp).toBe(2);
        expect(obj.anotherField).toBe('y');
    });

    test('pascal -> snake roundtrip', () => {
        const obj = { MyProp: 3, AnotherField: 'z' } as any;
        const json = JsonMapper.toJson(obj, { naming: { objectCase: 'pascal', jsonCase: 'snake' } });
        expect(json.my_prop).toBe(3);
        const back = JsonMapper.fromJson(json, undefined, { naming: { jsonCase: 'snake', objectCase: 'pascal' } });
        expect(back.MyProp).toBe(3);
    });

    test('custom converter used', () => {
        const obj = { apiURL: 'http://example' } as any;
        const custom = (key: string) => key.replace(/URL$/, '_url');
        const json = JsonMapper.toJson(obj, { naming: { objectCase: 'camel', jsonCase: 'snake', converter: (k) => custom(k) } });
        expect(json.api_url).toBe('http://example');
    });
});
