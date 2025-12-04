# @aimuse/jsonx-vite

Vite plugin to import and transform `.jsonx` files into JavaScript modules.

Install locally (in your Vite project):

```bash
npm i @aimuse/jsonx-vite
npm i @aimuse/jsonx-core
```

Usage (in `vite.config.ts`):

```ts
import { defineConfig } from 'vite'
import jsonxPlugin from '@aimuse/jsonx-vite'

export default defineConfig({
  plugins: [jsonxPlugin()]
})
```

Then you can import `.jsonx` directly:

```ts
import data from './data/example.jsonx'
```

Example: emitting a Chrome manifest
----------------------------------

If you have a `manifest-chrome.jsonx` which you want to convert to `manifest.json` during the Vite build, you can use the plugin's `emit` option to write the JSON asset into the bundle output.

In your `vite.config.ts`:

```ts
import { defineConfig } from 'vite';
import jsonxPlugin from '@aimuse/jsonx-vite';

export default defineConfig({
  plugins: [
    jsonxPlugin({ emit: [{ src: 'src/manifest-chrome.jsonx', fileName: 'manifest.json' }] })
  ]
});
```

When you run `vite build`, the plugin will parse `src/manifest-chrome.jsonx` and emit `manifest.json` into the build output (e.g. `dist/manifest.json`). This is suitable for web extension manifests or any other static asset that must be produced as JSON for consumers outside the module graph.

Options and examples
--------------------

The plugin accepts additional options to control parsing and emission:

- `parserOptions`: forwarded to the underlying parser (for example, `allowUnquotedKeys: true`).
- `emit`: array of `{ src, fileName, indent?, mapping? }` entries. `indent` controls the JSON formatting in the emitted file. `mapping` is a function `(obj) => modifiedObj` that you can use to post-process the parsed object before it's emitted.

Example — emit a manifest from relaxed jsonx:

```ts
jsonxPlugin({
  parserOptions: { allowUnquotedKeys: true },
  emit: [
    { src: 'src/manifest-chrome.jsonx', fileName: 'manifest.json', indent: 2 }
  ]
});
```

Example — mapping and renaming keys on emit:

```ts
jsonxPlugin({
  parserOptions: { allowUnquotedKeys: true },
  emit: [
    {
      src: 'src/manifest-chrome.jsonx',
      fileName: 'manifest.json',
      mapping: (obj) => {
        // example mapping: ensure a `name` field exists and uppercase it
        obj.name = (obj.name || 'Unnamed').toUpperCase();
        return obj;
      }
    }
  ]
});
```


