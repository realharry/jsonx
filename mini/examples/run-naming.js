#!/usr/bin/env node
// Example runner for mini naming example. Run from repository root:
// node mini/examples/run-naming.js
const path = require('path');
const fs = require('fs');

const mini = require(path.resolve(__dirname, '..', 'dist', 'index.js'));

const examplePath = path.resolve(__dirname, 'example.jsonx');
let input;
if (fs.existsSync(examplePath)) {
    input = fs.readFileSync(examplePath, 'utf8');
} else {
    input = `// example
{
  my_prop: 1,
  another_field: 'x'
}`;
}

const out = mini.convertJsonxNaming(input, { jsonCase: 'snake', objectCase: 'camel' });
console.log(out);
