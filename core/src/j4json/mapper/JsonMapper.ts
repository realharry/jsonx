import { JsonSerializable } from '../JsonSerializable';
import { Converter, Constructor } from './Converter';

export type NamingCase = 'identity' | 'snake' | 'camel' | 'pascal';

export interface NamingOptions {
    /** The case used in JSON keys (when reading/writing JSON) */
    jsonCase?: NamingCase;
    /** The case used in object property names (when mapping to/from JS objects) */
    objectCase?: NamingCase;
    /** Optional custom converter function: (key, fromCase, toCase) => string */
    converter?: (key: string, fromCase: NamingCase, toCase: NamingCase) => string;
}

export interface JsonMapperOptions {
    naming?: NamingOptions;
}

export class JsonMapper {
    private static converters: Converter[] = [];
    private static defaultNamingConverter?: (key: string, fromCase: NamingCase, toCase: NamingCase) => string;

    static registerConverter(conv: Converter) {
        JsonMapper.converters.unshift(conv);
    }

    static clearConverters() {
        JsonMapper.converters = [];
    }

    static toJson(value: any, options?: JsonMapperOptions): any {
        if (value == null) return null;

        // Custom converters first
        for (const c of JsonMapper.converters) {
            if (c.supports && c.supports(value)) {
                if (c.toJson) return c.toJson(value, JsonMapper);
            }
        }

        if (typeof value === 'object') {
            if ((value as JsonSerializable).toJson instanceof Function) {
                return (value as JsonSerializable).toJson();
            }
            if (Array.isArray(value)) {
                return value.map((v) => JsonMapper.toJson(v, options));
            }
            // plain object - deep map
            const out: Record<string, any> = {};
            const jsonCase = options?.naming?.jsonCase ?? 'identity';
            const objectCase = options?.naming?.objectCase ?? 'identity';
            for (const k of Object.keys(value)) {
                const outKey = JsonMapper.convertKey(k, objectCase, jsonCase, options?.naming?.converter);
                out[outKey] = JsonMapper.toJson(value[k], options);
            }
            return out;
        }
        return value;
    }

    static toString(value: any, options?: JsonMapperOptions): string {
        const json = JsonMapper.toJson(value, options);
        return JSON.stringify(json);
    }

    private static splitWords(key: string, fromCase: NamingCase): string[] {
        if (fromCase === 'identity') return [key];
        if (fromCase === 'snake') return key.split('_').map((s) => s.toLowerCase());
        // camel or pascal: split at transitions from lower->upper or number->upper
        return key.replace(/([a-z0-9])([A-Z])/g, '$1_$2').split('_').map((s) => s.toLowerCase());
    }

    private static convertKey(key: string, fromCase: NamingCase, toCase: NamingCase, converter?: (key: string, fromCase: NamingCase, toCase: NamingCase) => string): string {
        const conv = converter ?? JsonMapper.defaultNamingConverter;
        if (conv) return conv(key, fromCase, toCase);
        if (fromCase === toCase) return key;
        const words = JsonMapper.splitWords(key, fromCase).filter(Boolean);
        if (toCase === 'identity') return key;
        if (toCase === 'snake') return words.join('_');
        if (toCase === 'camel') return words.map((w, i) => i === 0 ? w : (w.charAt(0).toUpperCase() + w.slice(1))).join('');
        if (toCase === 'pascal') return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('');
        return key;
    }

    static fromJson<T = any>(json: any, target?: Constructor<T> | null, options?: JsonMapperOptions): T {
        // If a converter matches the target or json itself, use it
        for (const c of JsonMapper.converters) {
            if (c.supports && c.supports(json, target)) {
                if (c.fromJson) return c.fromJson(json, target, JsonMapper) as T;
            }
        }

        if (target == null) {
            // no target provided: return plain JS value with deep conversion
            if (json == null) return json as T;
            if (Array.isArray(json)) {
                return json.map((v) => JsonMapper.fromJson(v, undefined, options)) as unknown as T;
            }
            if (typeof json === 'object') {
                const out: any = {};
                const jsonCase = options?.naming?.jsonCase ?? 'identity';
                const objectCase = options?.naming?.objectCase ?? 'identity';
                for (const k of Object.keys(json)) {
                    const outKey = JsonMapper.convertKey(k, jsonCase, objectCase, options?.naming?.converter);
                    out[outKey] = JsonMapper.fromJson(json[k], undefined, options);
                }
                return out as T;
            }
            return json as T;
        }

        // target is a constructor: instantiate and assign fields
        const instance: any = new (target as Constructor)();
        if (json == null) return instance as T;
        if (Array.isArray(json)) {
            // try to populate array-like container if instance supports push
            if (typeof instance.push === 'function') {
                (json as any[]).forEach((v) => instance.push(JsonMapper.fromJson(v)));
                return instance as T;
            }
        }
        if (typeof json === 'object') {
            const jsonCase = options?.naming?.jsonCase ?? 'identity';
            const objectCase = options?.naming?.objectCase ?? 'identity';
            for (const k of Object.keys(json)) {
                const val = json[k];
                // map json key to instance property name according to naming options
                const prop = JsonMapper.convertKey(k, jsonCase, objectCase, options?.naming?.converter);
                // naive mapping: if instance has a constructor for the property, user can register converters
                instance[prop] = JsonMapper.fromJson(val, undefined, options);
            }
        }
        return instance as T;
    }

    /**
     * Convenience: convert value to JSON using explicit naming options.
     */
    static toJsonWithNaming(value: any, jsonCase: NamingCase, objectCase: NamingCase = 'identity', converter?: (key: string, fromCase: NamingCase, toCase: NamingCase) => string): any {
        return JsonMapper.toJson(value, { naming: { jsonCase, objectCase, converter } });
    }

    /**
     * Convenience: parse JSON using explicit naming options.
     */
    static fromJsonWithNaming<T = any>(json: any, jsonCase: NamingCase, objectCase: NamingCase = 'identity', target?: Constructor<T> | null, converter?: (key: string, fromCase: NamingCase, toCase: NamingCase) => string): T {
        return JsonMapper.fromJson(json, target, { naming: { jsonCase, objectCase, converter } });
    }

    /**
     * Set a global default naming converter to be used when no per-call converter provided.
     */
    static setDefaultNamingConverter(conv?: (key: string, fromCase: NamingCase, toCase: NamingCase) => string) {
        JsonMapper.defaultNamingConverter = conv;
    }
}

