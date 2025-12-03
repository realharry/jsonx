import { JsonObject } from '../JsonObject';
import { JsonArray } from '../JsonArray';
import { JsonMapper } from './JsonMapper';
import { Constructor } from './Converter';

export class ObjectConverter {
    static toJsonObject(instance: Record<string, any>): JsonObject {
        return new JsonObject(JsonMapper.toJson(instance) as Record<string, any>);
    }

    static toJsonArray(arr: any[]): JsonArray {
        return new JsonArray(JsonMapper.toJson(arr) as any[]);
    }

    static fromJsonObject<T = any>(obj: any, ctor?: Constructor<T>): T {
        if (!ctor) return JsonMapper.fromJson(obj) as T;
        return JsonMapper.fromJson(obj, ctor) as T;
    }
}

