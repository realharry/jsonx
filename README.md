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


