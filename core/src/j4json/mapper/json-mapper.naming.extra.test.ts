import { JsonMapper } from './JsonMapper';

describe('JsonMapper naming edge cases', () => {
    test('handles acronyms like apiURL -> api_url with custom converter', () => {
        const obj = { apiURL: 'http' } as any;
        // default splitting won't handle URL well; provide custom converter
        const conv = (k: string) => k.replace(/URL$/, '_url').replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();
        const json = JsonMapper.toJson(obj, { naming: { objectCase: 'camel', jsonCase: 'snake', converter: conv } });
        expect(json.api_url).toBe('http');
    });

    test('handles numbers in keys', () => {
        const obj = { field1Name: 7 } as any;
        const json = JsonMapper.toJson(obj, { naming: { objectCase: 'camel', jsonCase: 'snake' } });
        expect(json.field1_name).toBe(7);
        const back = JsonMapper.fromJson(json, undefined, { naming: { jsonCase: 'snake', objectCase: 'camel' } });
        expect(back.field1Name).toBe(7);
    });

    test('handles empty and single-char keys', () => {
        const obj: any = { '': 'empty', x: 'single' };
        const json = JsonMapper.toJson(obj, { naming: { objectCase: 'identity', jsonCase: 'snake' } });
        expect(json['']).toBe('empty');
        expect(json.x).toBe('single');
        const back = JsonMapper.fromJson(json, undefined, { naming: { jsonCase: 'snake', objectCase: 'identity' } });
        expect(back['']).toBe('empty');
        expect(back.x).toBe('single');
    });

    test('global default converter is used when set', () => {
        const obj = { apiURL: 'a' } as any;
        JsonMapper.setDefaultNamingConverter((k) => k.replace(/URL$/, '_url').toLowerCase());
        const json = JsonMapper.toJson(obj, { naming: { objectCase: 'camel', jsonCase: 'snake' } });
        expect(json.api_url).toBe('a');
        // clear global
        JsonMapper.setDefaultNamingConverter(undefined);
    });
});
