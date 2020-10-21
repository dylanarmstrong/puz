## Puz Parser

Just a simple .puz parser

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
const data = new Int8Array(buffer);

// Parse the Int8Array data
const puz = parse(data);

console.log(puz);
/**
  baseChecksum,
  clues,
  fileChecksum,
  height,
  magic,
  mask1,
  mask2,
  maskedChecksums,
  reserved,
  unknown,
  unused,
  valid,
  version,
  width,
**/
```
