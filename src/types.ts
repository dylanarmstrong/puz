type RequiredCellDirection = {
  cells: number[],
  len: number,
};

export type CellDirection = RequiredCellDirection & Partial<{
  clue: string,
}>;

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

type RequiredPuz = {
  valid: boolean,
};

export type Puz = RequiredPuz & Partial<{
  author: string,
  clues: string[],
  copyright: string,
  error: string,
  grid: Grid,
  header: Header,
  solution: number[],
  title: string,
}>;
