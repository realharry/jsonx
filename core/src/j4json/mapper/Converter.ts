export interface Converter {
    /**
     * Return true if this converter can convert the provided value or target
     * (used for both serialization and deserialization decisions).
     */
    supports(value: any, target?: any): boolean;

    toJson?(value: any, mapper?: any): any;
    fromJson?(value: any, target?: any, mapper?: any): any;
}

export type Constructor<T = any> = { new(...args: any[]): T };
