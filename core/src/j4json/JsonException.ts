export class JsonException extends Error {
    constructor(message?: string, cause?: Error) {
        super(message);
        this.name = 'JsonException';
        if (cause) {
            // attach cause if available
            (this as any).cause = cause;
        }
        Object.setPrototypeOf(this, JsonException.prototype);
    }
}
