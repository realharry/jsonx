# jsonx-tools

Small utilities for working with jsonx files. Includes a CLI `jsonx-to-json` that converts an enhanced JSON (`.jsonx`) into pure JSON.

Usage:

Build:
```
cd tools
npm install
npm run build
```

Local run:
```
npx ts-node src/convert.ts <input.jsonx> [output.json]
```

After building, the installed CLI `jsonx-to-json` will be available when the package is installed globally or added to another project.
