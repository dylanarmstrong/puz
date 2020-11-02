## Puz Parser

Just a simple .puz parser.

Can be seen in action with [code](https://github.com/dylanarmstrong/crossword) / [demo](https://dylan.is/crossword).

## Install

```sh
npm install @dylanarmstrong/puz --save
```

## Usage

```js
const parse = require('@dylanarmstrong/puz');
// Or
import parse from '@dylanarmstrong/puz';

// Load a .puz file
const data = new Uint8Array(buffer);

// Parse the Uint8Array data
const puz = parse(data);

console.log(puz);
/**
  TODO
**/
```
