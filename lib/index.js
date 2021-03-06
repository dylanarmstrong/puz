/**
 * Quick parser for .puz files
 * @author Dylan Armstrong
 * @license MIT
 *
 * Information taken from:
 * http://www.muppetlabs.com/~breadbox/txt/acre.html
 * and
 * https://archive.is/N547D
 */

const nMap = (n) => String.fromCharCode(n);
const stringify = (n) => n.map(nMap).join('');

const verify = (data) => {
  const magic = '41 43 52 4f 53 53 26 44 4f 57 4e 00'.split(' ');
  for (let i = 0, len = magic.length; i < len; i++) {
    if (data[i] !== Number.parseInt(magic[i], 16)) {
      return false;
    }
  }
  return true;
};

// Pass in Int8Array
const parse = (data) => {
  if (data.length < 52) {
    return { header: { valid: false } };
  }

  try {
    const maxLength = data.length;
    const get = (index, _length) => {
      const useNullDelimiter = typeof _length === 'undefined';
      const length = useNullDelimiter ? maxLength : _length;

      const s = [];
      for (let i = index, max = index + length; i < max; i++) {
        const n = data[i];
        if (useNullDelimiter && n === 0x00) {
          return { index: i, value: s };
        }
        s.push(n);
      }

      return { index: index + length, value: s };
    };

    /* eslint-disable sort-keys */
    const header = {
      checksum:           get(0x00, 0x2).value,
      magic:              get(0x02, 0xc).value,
      cibChecksum:        get(0x0e, 0x2).value,
      maskedLowChecksum:  get(0x10, 0x4).value,
      maskedHighChecksum: get(0x14, 0x4).value,
      versionString:      get(0x18, 0x4).value,
      reserved1c:         get(0x1c, 0x2).value,
      unknown:            get(0x1e, 0x2).value,
      reserved20:         get(0x20, 0xb).value,
      bic:                get(0x2c, 0x8).value,
      width:              get(0x2c, 0x1).value,
      height:             get(0x2d, 0x1).value,
      clues:              get(0x2e, 0x2).value,
      unknownMask:        get(0x30, 0x2).value,
      unknown32:          get(0x32, 0x2).value,
    };
    /* eslint-enable sort-keys */

    let { height, width } = header;
    const { clues: nClues, magic } = header;
    ([height] = height);
    ([width] = width);

    // The following all require the width & height and the indices
    // start at end of the previous values
    const solution = get(0x34, width * height).value;

    const titleDetails = get(0x34 + 2 * width * height);
    const title = stringify(titleDetails.value);

    const authorDetails = get(titleDetails.index + 1);
    const author = stringify(authorDetails.value);

    const copyrightDetails = get(authorDetails.index + 1);
    const copyright = stringify(copyrightDetails.value);

    let { index } = copyrightDetails;
    const clues = [];
    // Is adding the clues the right way to do this? Not sure
    for (let i = 0, max = nClues[0] + nClues[1]; i < max; i++) {
      const clue = get(index + 1);
      clues.push(stringify(clue.value));
      ({ index } = clue);
    }

    const grid = get(0x34 + width * height, width * height).value;

    // [y][x]
    const computedGrid = new Array(height);
    for (let i = 0; i < height; i++) {
      computedGrid[i] = new Array(width);
    }

    let clueIndex = 0;
    let visibleClueIndex = 0;
    let isStart = false;
    let x = 0;
    let y = 0;

    const isBlackSq = (n) => n === 46;

    const getDown = (start) => {
      const cells = [];
      let i = 0;
      for (const max = height - Math.floor(start / width); i < max; i++) {
        const idx = start + i * width;
        if (isBlackSq(grid[idx])) {
          return {
            cells,
            len: i,
          };
        }
        cells.push(idx);
      }
      return {
        cells,
        len: i,
      };
    };

    const getAcross = (start) => {
      const cells = [];
      let i = 0;
      for (const max = width - (start % width); i < max; i++) {
        const idx = start + i;
        if (isBlackSq(grid[idx])) {
          return {
            cells,
            len: i,
          };
        }
        cells.push(idx);
      }
      return {
        cells,
        len: i,
      };
    };

    for (let i = 0, max = grid.length; i < max; i++) {
      x = i % width;
      y = Math.floor(i / width);
      const n = grid[i];
      // Empty
      const isBlack = isBlackSq(n);

      const down = getDown(i);
      const across = getAcross(i);

      const isAcross = across.len > 1 && (x === 0 || (x > 0 && computedGrid[y][x - 1].isBlack));
      const isDown = down.len > 1 && (y === 0 || (y > 0 && computedGrid[y - 1][x].isBlack));

      let downClue = null;
      let acrossClue = null;
      isStart = true;
      if (isBlack) {
        isStart = false;
      } else if (isAcross && isDown) {
        acrossClue = clues[clueIndex++];
        downClue = clues[clueIndex++];
        visibleClueIndex++;
      } else if (isAcross) {
        acrossClue = clues[clueIndex++];
        visibleClueIndex++;
      } else if (isDown) {
        downClue = clues[clueIndex++];
        visibleClueIndex++;
      } else {
        isStart = false;
      }

      computedGrid[y][x] = {
        across: {
          cells: across.cells,
          clue: acrossClue,
          len: across.len,
        },
        cell: i,
        clueIndex: visibleClueIndex,
        down: {
          cells: down.cells,
          clue: downClue,
          len: down.len,
        },
        isBlack,
        isStart,
        value: n === 45 ? '' : String.fromCharCode(n),
      };
    }

    return {
      author,
      clues,
      copyright,
      grid: computedGrid,
      header,
      solution,
      title,
      valid: verify(magic),
    };
  } catch (e) {
    return {
      error: e.message,
      header: { valid: false },
    };
  }
};

module.exports = parse;
