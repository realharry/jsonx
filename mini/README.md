# jsonx-mini

`jsonx-mini` is a tiny, minimal subset of the `jsonx-core` features. It provides a compact TypeScript implementation of a parser wrapper and a builder suitable for small projects or to serve as a lightweight dependency.

API


This package is intentionally minimal — it does not implement the full feature set of `jsonx-core`.

```markdown
# jsonx-mini

`jsonx-mini` is a tiny, minimal subset of the `jsonx-core` features. It provides a compact TypeScript implementation of a parser wrapper and a builder suitable for small projects or to serve as a lightweight dependency.

Features

- Lightweight parsing with small permissive options: comments, trailing commas, single-quoted strings, unquoted keys, and custom literal mapping.
- Simple builder that pretty-prints JSON.
- Small runtime and minimal dependencies (uses `jsonx-core` as a local file dependency during development).

API

- `parseMini(text, options?)` — parse a JSON string with permissive options.
- `buildMini(value, options?)` — serialize a value to pretty JSON with configurable indentation.
- `parseFile(path, options?)` / `writeFile(path, value, options?)` — file helpers.

Installation

```bash
# from this repo (development)
cd jsonx/mini
npm install

# to install from npm (once published)
npm install jsonx-mini
```

Testing

This package uses `jest` + `ts-jest` for its test suite.

```bash
npm install
npm test
```

Publishing

Before publishing, make sure `jsonx-core` is published or change the dependency in `package.json` so it doesn't use a `file:` reference. Then run:

```bash
npm run build
npm pack --dry-run
npm publish --access public
```

```

Examples

Example input with a few permissive features (comments, single quotes, unquoted keys):

```json
// example/mini-input.json
{ /* a comment */
	bare: 'hello',
	list: [1,2,],
	lit: NaN
}
```

Parse and write with the simple API:

```js
import { parseMini, buildMini } from 'jsonx-mini';
const txt = fs.readFileSync('example/mini-input.json', 'utf8');
const obj = parseMini(txt, { allowComments: true, allowSingleQuotedStrings: true, allowTrailingComma: true, allowUnquotedKeys: true, customLiterals: { NaN: null } });
console.log(buildMini(obj));
```

Or using the command-line after building the package (mini focuses on API; the CLI is provided by the `core` package):

```bash
# build mini
npm run build
# run a node script that uses parseMini/buildMini as above
node -e "console.log(require('./dist').buildMini(require('./dist').parseMini(require('fs').readFileSync('example/mini-input.json','utf8'), { allowComments: true })) )"
```
