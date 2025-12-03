declare module 'fs' {
    export function readFileSync(path: string, encoding?: string): string;
    export function writeFileSync(path: string | number, data: string | Uint8Array, encoding?: string): void;
}
