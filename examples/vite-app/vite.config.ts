import { defineConfig } from 'vite';
// Import the built ESM plugin directly from the monorepo package build to avoid
// ESM/CJS interop issues when Vite bundles the config.
import jsonxPlugin from '../../vite/dist/index.js';

export default defineConfig({
    plugins: [
        // Emit `manifest.json` from `src/manifest-chrome.jsonx` during build
        jsonxPlugin({ parserOptions: { allowUnquotedKeys: true }, emit: [{ src: 'src/manifest-chrome.jsonx', fileName: 'manifest.json', indent: 2 }] })
    ]
});
