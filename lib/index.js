/**
 * Quick parser for .puz files
 * @author Dylan Armstrong
 * @license MIT
 *
 * Information taken from:
 * http://www.muppetlabs.com/~breadbox/txt/acre.html
 */

const magic = '41 43 52 4f 53 53 26 44 4f 57 4e 00'.split(' ');

const verify = (data) => {
  for (let i = 0, len = magic.length; i < len; i++) {
    if (data[i] !== Number.parseInt(magic[i], 16)) {
      return false;
    }
  }
  return true;
};

const get = (data, index, n) => {
  const s = [];
  for (let i = index, max = index + n; i < max; i++) {
    s.push(data[i]);
  }
  return s;
};

// Pass in Int8Array
const parse = (data) => {
  if (data.length < 52) {
    return { valid: false };
  }

  return {
    baseChecksum: get(data, 14, 2),
    clues: get(data, 46, 2),
    fileChecksum: get(data, 0, 2),
    height: get(data, 45, 1),
    magic: get(data, 2, 12),
    mask1: get(data, 48, 2),
    mask2: get(data, 50, 2),
    maskedChecksums: get(data, 16, 8),
    reserved: get(data, 32, 12),
    unknown: get(data, 30, 2),
    unused: get(data, 28, 2),
    valid: verify(get(data, 2, 12)),
    version: get(data, 24, 4),
    width: get(data, 44, 1),
  };
};

module.exports = parse;
