import path from 'path';
import fs from 'fs';
import jsonxPlugin from '../dist/index.js';

async function run() {
    const samplePath = path.resolve('./test/sample.jsonx');
    if (!fs.existsSync(samplePath)) {
        fs.writeFileSync(samplePath, '{\n  "name": "example-app",\n  "version": "1.0.0"\n}\n', 'utf8');
    }

    const plugin = jsonxPlugin();
    const res = plugin.transform(null, samplePath);
    if (!res || !res.code || !res.code.includes('export default')) {
        console.error('Plugin transform did not return expected module output');
        process.exit(2);
    }

    console.log('Plugin smoke test passed');
}

run().catch((err) => {
    console.error(err);
    process.exit(2);
});
