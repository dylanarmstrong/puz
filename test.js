#! /usr/bin/env node
/* eslint-disable array-element-newline */

const assert = require('assert');
const parse = require('./dist/cjs').default;

const goodPuz = Int8Array.from(
  [
    106, 76, 65, 67, 82, 79, 83, 83, 38, 68, 79, 87, 78, 0, 2, -38, 75, 85,
    -37, -89, -101, -5, 53, -98, 49, 46, 51, 0, 0, 0, 0, 0, 65, 108, 101, 120,
    87, 97, 115, 72, 101, 114, 101, 32, 15, 15, 76, 0, 1, 0, 0, 0, 72,
  ],
);

// Just a bad magic value
const badPuz = Int8Array.from(
  [
    106, 76, 64, 67, 82, 79, 83, 83, 38, 68, 79, 87, 78, 0, 2, -38, 75, 85,
    -37, -89, -101, -5, 53, -98, 49, 46, 51, 0, 0, 0, 0, 0, 65, 108, 101, 120,
    87, 97, 115, 72, 101, 114, 101, 32, 15, 15, 76, 0, 1, 0, 0, 0, 72,
  ],
);

const good = parse(goodPuz);
assert(good.valid === true);
assert(good.header.height[0] === good.header.width[0]);
assert(good.header.height[0] === 15);

const bad = parse(badPuz);
assert(bad.valid === false);
