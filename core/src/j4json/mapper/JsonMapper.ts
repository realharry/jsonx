import { JsonSerializable } from '../JsonSerializable';
import { Converter, Constructor } from './Converter';

export interface JsonMapperOptions {
    // reserved for future options like date format, naming strategy, etc.
}

export class JsonMapper {
    private static converters: Converter[] = [];

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
            for (const k of Object.keys(value)) {
                out[k] = JsonMapper.toJson(value[k], options);
            }
            return out;
        }
        return value;
    }

    static toString(value: any, options?: JsonMapperOptions): string {
        const json = JsonMapper.toJson(value, options);
        return JSON.stringify(json);
    }

    static fromJson<T = any>(json: any, target?: Constructor<T> | null): T {
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
                return json.map((v) => JsonMapper.fromJson(v)) as unknown as T;
            }
            if (typeof json === 'object') {
                const out: any = {};
                for (const k of Object.keys(json)) {
                    out[k] = JsonMapper.fromJson(json[k]);
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
            for (const k of Object.keys(json)) {
                const val = json[k];
                // naive mapping: if instance has a constructor for the property, user can register converters
                instance[k] = JsonMapper.fromJson(val);
            }
        }
        return instance as T;
    }
}

