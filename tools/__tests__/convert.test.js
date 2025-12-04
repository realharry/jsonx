const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');

test('convert.jsonx -> pure json stdout', (done) => {
    const bin = path.resolve(__dirname, '..', 'dist', 'convert.js');
    const input = path.resolve(__dirname, '..', 'test', 'input.jsonx');
    const args = [input, /* no output -> stdout */ '--allow-comments', '--allow-single-quoted-strings', '--allow-unquoted-keys', '--allow-trailing-comma', '-i', '2'];

    execFile(process.execPath, [bin, ...args], { timeout: 5000 }, (err, stdout, stderr) => {
        if (err) return done(err);
        try {
            const obj = JSON.parse(stdout);
            expect(obj.unquotedKey).toBe('value');
            expect(Array.isArray(obj.arr)).toBe(true);
            expect(obj.arr.length).toBe(2);
            done();
        } catch (e) {
            done(e);
        }
    });
});
