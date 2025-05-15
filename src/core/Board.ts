import { Cell } from "./Cell.ts";

/**
 * Represents a 5x5 game board grid of cells.
 */
export class Board {
  private _grid: (Cell | undefined)[][];

  /**
   * Initializes a 5x5 grid with undefined cells.
   */
  constructor() {
    this._grid = Array.from({ length: 5 }, () =>
      Array.from({ length: 5 }, () => undefined),
    );
  }

  /**
   * Sets a cell at the specified row and column.
   * @param row - The row index (0–4).
   * @param col - The column index (0–4).
   * @param cell - The Cell to place.
   */
  public setCell(row: number, col: number, cell: Cell): void {
    this._grid[row][col] = cell;
  }

  /**
   * Returns the cell at the specified row and column.
   * Assumes the cell is already set.
   * @param row - The row index (0–4).
   * @param col - The column index (0–4).
   * @returns The Cell at the given position.
   */
  public getCell(row: number, col: number): Cell {
    return this._grid[row][col]!;
  }
}
