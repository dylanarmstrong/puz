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

import type {
  CellDirection,
  Grid,
  Header,
  Puz,
} from './types';

const nMap = (n: number) => String.fromCharCode(n);
const stringify = (n: number[]) => n.map(nMap).join('');

const verify = (data: number[]) => {
  const magic = '41 43 52 4f 53 53 26 44 4f 57 4e 00'.split(' ');
  for (let i = 0, len = magic.length; i < len; i++) {
    if (data[i] !== Number.parseInt(magic[i], 16)) {
      return false;
    }
  }
  return true;
};

// Pass in UInt8Array
const parse = (data: Uint8Array): Puz => {
  if (data.length < 52) {
    return {
      error: 'data.length < 52',
      valid: false,
    };
  }

  try {
    const maxLength = data.length;
    const get = (index: number, length?: number) => {
      const s = [];
      const useNullDelimiter = !!length;
      const max = index + (length || maxLength);
      for (let i = index; i < max; i++) {
        const n = data[i];
        if (useNullDelimiter && n === 0x00) {
          return { index: i, value: s };
        }
        s.push(n);
      }

      return { index: max, value: s };
    };

    /* eslint-disable sort-keys */
    const header: Header = {
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

    const height = header.height[0];
    const width = header.width[0];

    const { clues: nClues, magic } = header;
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
    const computedGrid: Grid = new Array(height);
    for (let i = 0; i < height; i++) {
      computedGrid[i] = new Array(width);
    }

    const isBlackSq = (n: number) => n === 46;

    const getX = (n: number) => n % width;
    const getY = (n: number) => Math.floor(n / width);

    const getStartingCellForAcross = (posY: number, n: number): number => {
      const newY = getY(n);
      if (posY !== newY || n < 0 || isBlackSq(grid[n])) {
        return n + 1;
      }
      return getStartingCellForAcross(posY, n - 1);
    };

    const getStartingCellForDown = (posX: number, n: number): number => {
      const newX = getX(n);
      if (posX !== newX || n < 0 || isBlackSq(grid[n])) {
        return n + width;
      }
      return getStartingCellForDown(posX, n - width);
    };

    const getDown = (start: number, pos: number): CellDirection => {
      const posX = getX(pos);
      const getEndingCell = (n: number): number => {
        const posY = getY(n);
        const newX = getX(n);
        if (posX !== newX || posY > height - 1 || isBlackSq(grid[n])) {
          return n - width;
        }
        return getEndingCell(n + width);
      };
      const end = getEndingCell(pos);
      const cells = [];
      for (let i = 0; i < (end - start) / width + 1; i++) {
        cells.push(start + (i * width));
      }
      return {
        cells,
        len: cells.length,
      };
    };

    const getAcross = (start: number, pos: number): CellDirection => {
      // On across, this cannot change
      const posY = getY(pos);
      const getEndingCell = (n: number): number => {
        const posX = getX(n);
        const newY = getY(n);
        if (posY !== newY || posX > width || isBlackSq(grid[n])) {
          return n - 1;
        }
        return getEndingCell(n + 1);
      };
      const end = getEndingCell(pos);
      const cells = [];
      for (let i = 0; i < end - start + 1; i++) {
        cells.push(start + i);
      }
      return {
        cells,
        len: cells.length,
      };
    };

    let clueIndex = 0;
    let acrossClueIndex = 0;
    let downClueIndex = 0;
    let visibleClueIndex = 0;

    let isStart = false;
    let x = 0;
    let y = 0;

    for (let i = 0, max = grid.length; i < max; i++) {
      x = i % width;
      y = Math.floor(i / width);
      const n = grid[i];
      // Empty
      const isBlack = isBlackSq(n);

      const startAcross = getStartingCellForAcross(y, i);
      const startDown = getStartingCellForDown(x, i);
      const isAcross = startAcross === i;
      const isDown = startDown === i;

      const across = getAcross(startAcross, i);
      const down = getDown(startDown, i);

      isStart = true;
      if (isBlack) {
        isStart = false;
      } else if (isAcross && isDown) {
        acrossClueIndex = clueIndex;
        clueIndex += 1;

        downClueIndex = clueIndex;
        clueIndex += 1;

        visibleClueIndex += 1;
      } else if (isAcross) {
        acrossClueIndex = clueIndex;
        clueIndex += 1;

        visibleClueIndex += 1;
      } else if (isDown) {
        downClueIndex = clueIndex;
        clueIndex += 1;

        visibleClueIndex += 1;
      } else {
        isStart = false;
      }

      let acrossClue = null;
      let downClue = null;

      if (isAcross) {
        acrossClue = {
          clue: clues[acrossClueIndex],
          clueIndex: visibleClueIndex,
        };
      } else if (!isBlack) {
        const dir = computedGrid[y][getX(startAcross)].across;
        acrossClue = {
          clue: dir.clue,
          clueIndex: dir.clueIndex,
        };
      }

      if (isDown) {
        downClue = {
          clue: clues[downClueIndex],
          clueIndex: visibleClueIndex,
        };
      } else if (!isBlack) {
        const dir = computedGrid[getY(startDown)][x].down;
        downClue = {
          clue: dir.clue,
          clueIndex: dir.clueIndex,
        };
      }

      computedGrid[y][x] = {
        across: {
          cells: across.cells,
          len: across.len,
          ...(acrossClue || {}),
        },
        cell: i,
        clueIndex: visibleClueIndex,
        down: {
          cells: down.cells,
          len: down.len,
          ...(downClue || {}),
        },
        isAcross,
        isBlack,
        isDown,
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
      valid: false,
    };
  }
};

export default parse;
