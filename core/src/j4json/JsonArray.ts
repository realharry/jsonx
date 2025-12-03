import { JsonSerializable } from './JsonSerializable';
import { JsonException } from './JsonException';

export class JsonArray implements JsonSerializable {
    private data: any[];

    constructor(initial?: any[]) {
        this.data = initial ? [...initial] : [];
    }

    get(index: number): any {
        return this.data[index];
    }

    add(value: any): this {
        this.data.push(value);
        return this;
    }

    size(): number {
        return this.data.length;
    }

    toJson(): any[] {
        return [...this.data];
    }

    toString(): string {
        try {
            return JSON.stringify(this.data);
        } catch (e) {
            throw new JsonException('Error serializing JsonArray', e as Error);
        }
    }
}
