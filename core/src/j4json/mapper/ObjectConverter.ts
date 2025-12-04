import { JsonObject } from '../JsonObject';
import { JsonArray } from '../JsonArray';
import { JsonMapper } from './JsonMapper';
import { Constructor } from './Converter';

export class ObjectConverter {
    static toJsonObject(instance: Record<string, any>, options?: import('./JsonMapper').JsonMapperOptions): JsonObject {
        return new JsonObject(JsonMapper.toJson(instance, options) as Record<string, any>);
    }

    static toJsonArray(arr: any[], options?: import('./JsonMapper').JsonMapperOptions): JsonArray {
        return new JsonArray(JsonMapper.toJson(arr, options) as any[]);
    }

    static fromJsonObject<T = any>(obj: any, ctor?: Constructor<T>, options?: import('./JsonMapper').JsonMapperOptions): T {
        if (!ctor) return JsonMapper.fromJson(obj, undefined, options) as T;
        return JsonMapper.fromJson(obj, ctor, options) as T;
    }
}

