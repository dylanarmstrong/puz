export type CellDirection = {
  cells: number[],
  clue: string,
  len: number,
};

export type Cell = {
  across: CellDirection,
  cell: number,
  clueIndex: number,
  down: CellDirection,
  isBlack: boolean,
  isStart: boolean,
  value: string,
};

export type Row = Cell[];
export type Grid = Row[];

export type Header = {
  bic: number[],
  checksum: number[],
  cibChecksum: number[],
  clues: number[],
  height: number[],
  magic: number[],
  maskedHighChecksum: number[],
  maskedLowChecksum: number[],
  reserved1c: number[],
  reserved20: number[],
  unknown: number[],
  unknown32: number[],
  unknownMask: number[],
  versionString: number[],
  width: number[],
};

export type Puz = {
  author: string,
  clues: string[],
  copyright: string,
  grid: Grid,
  header: Header,
  solution: number[],
  title: string,
  valid: boolean,
};

declare function parse(data: Uint8Array): Puz;
export default parse;
