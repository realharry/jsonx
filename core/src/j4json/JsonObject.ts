import { JsonSerializable } from './JsonSerializable';
import { JsonException } from './JsonException';

export class JsonObject implements JsonSerializable {
    private data: Record<string, any>;

    constructor(initial?: Record<string, any>) {
        this.data = initial ? { ...initial } : {};
    }

    get(key: string): any {
        return this.data[key];
    }

    set(key: string, value: any): this {
        this.data[key] = value;
        return this;
    }

    has(key: string): boolean {
        return Object.prototype.hasOwnProperty.call(this.data, key);
    }

    keys(): string[] {
        return Object.keys(this.data);
    }

    remove(key: string): boolean {
        if (this.has(key)) {
            delete this.data[key];
            return true;
        }
        return false;
    }

    toJson(): Record<string, any> {
        return { ...this.data };
    }

    toString(): string {
        try {
            return JSON.stringify(this.data);
        } catch (e) {
            throw new JsonException('Error serializing JsonObject', e as Error);
        }
    }
}
