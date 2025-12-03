# jsonx/core
```markdown
# jsonx/core

A TypeScript implementation of the j4json core features: an extended, configurable JSON tokenizer/parser, mapper utilities, and a small CLI to normalize JSON/jsonx files.

Installation

```bash
# from this repo (development)
cd jsonx/core
npm install

# to install from npm (once published)
npm install jsonx-core
```

Quick start (API)

```ts
import { SimpleJsonParser } from 'jsonx-core';
const parser = new SimpleJsonParser();
const obj = await parser.parse('{"a":1}');
```

CLI

The package exposes a CLI wrapper `jsonx-cli` that normalizes JSON and extended JSON formats. Examples:

```bash
# run wrapper (uses compiled CLI when available, otherwise ts-node fallback)
npm run jsonx -- --in input.json --out output.json --mode extended --allowComments

# build and run compiled CLI

npm run build
node dist/tools/jsonx-cli.js --in input.json --out output.json --mode pure
```

Testing

This package uses `jest` + `ts-jest` for unit testing.

```bash
npm install
npm test
```

Publishing

Before publishing, ensure `dist/` is built and `package.json` fields are correct. Use `npm pack --dry-run` to inspect the tarball contents. Publishing requires your npm credentials:

```bash
npm run build
npm pack --dry-run
npm publish --access public
```

Notes

- Use `--preserve-format` or `--extended-output` in the CLI to copy the input file verbatim when you need to preserve comments/whitespace.
- If you want a single-file standalone CLI (no ts-node and no ESM issues), ask and I can add an esbuild bundling step.

```

Examples

Create a sample file `example/input.jsonx` with extended JSON features:

```json
// example/input.jsonx
{
	// comment
	unquotedKey: 'single-quoted string',
	list: [1, 2, 3,],
	value: NaN
}
```

Normalize to pure JSON (using the wrapper which will run the compiled CLI if available):

```bash
npm run jsonx -- --in example/input.jsonx --out example/output.json --mode extended \
	--allowComments --allowTrailingComma --allowSingleQuotedStrings --allowUnquotedKeys --literals '{"NaN": null}'
```

The produced `example/output.json` will be canonical JSON (comments removed, keys quoted, single quotes converted, trailing commas removed):

```json
{
	"unquotedKey": "single-quoted string",
	"list": [
		1,
		2,
		3
	],
	"value": null
}
```
