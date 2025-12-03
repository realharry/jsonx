import type { JsonObject } from './JsonObject';
import type { JsonArray } from './JsonArray';

export interface JsonSerializable {
    toJson(): any;
    toString(): string;
}

export type JsonCompatible = string | number | boolean | null | JsonObject | JsonArray | Record<string, any> | any[];
