# Typescript Node.js Starter Project
Copy the repo,
or you can set up a new repo by following these steps:


```
mkdir v1 ; cd $_
npm init -y
npm i -D typescript ts-node nodemon @types/node
tsc --init --rootDir src --outDir dist --lib es6,dom --module es2020 --target es2020 --declaration
npm i -D jest ts-jest @jest/globals @types/jest 
npx ts-jest config:init
```

## Mini package example

The `mini` package includes a small naming example that demonstrates parsing a `.jsonx` string, mapping JSON keys between naming conventions (e.g., `snake_case` ↔ `camelCase`), and serializing back to JSON.

Run the example from the repo root after building the packages:

```bash
npm run build
node mini/examples/run-naming.js
```

You can also install the `mini` package locally and use the `jsonx-naming` CLI (installed from `mini/bin/jsonx-naming.js`):

```bash
npm install -g ./mini
jsonx-naming mini/examples/example.jsonx
```
# Typescript Node.js Starter Project

Copy the repo,
or you can set up a new repo by following these steps:


```
mkdir v1 ; cd $_
npm init -y
npm i -D typescript ts-node nodemon @types/node
tsc --init --rootDir src --outDir dist --lib es6,dom --module es2020 --target es2020 --declaration
npm i -D jest ts-jest @jest/globals @types/jest 
npx ts-jest config:init
```


