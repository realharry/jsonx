"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
test('convert.jsonx -> pure json stdout (TS test)', (done) => {
    const bin = path_1.default.resolve(__dirname, '..', 'dist', 'convert.js');
    const input = path_1.default.resolve(__dirname, '..', 'test', 'input.jsonx');
    const args = [input, '--allow-comments', '--allow-single-quoted-strings', '--allow-unquoted-keys', '--allow-trailing-comma', '-i', '2'];
    (0, child_process_1.execFile)(process.execPath, [bin, ...args], { timeout: 5000 }, (err, stdout, stderr) => {
        if (err)
            return done(err);
        try {
            const obj = JSON.parse(stdout);
            expect(obj.unquotedKey).toBe('value');
            expect(Array.isArray(obj.arr)).toBe(true);
            expect(obj.arr.length).toBe(2);
            done();
        }
        catch (e) {
            done(e);
        }
    });
});
