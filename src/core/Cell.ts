import { Container } from "pixi.js";

export class Cell {
  // @ts-expect-error err
  private _level: number;
  // @ts-expect-error err
  private _occupied: boolean;
  // @ts-expect-error err
  private _container: Container | undefined;
  // @ts-expect-error err
  private _worker: Worker | undefined;

  constructor(container: Container) {
    this._occupied = false;
    this._container = container;
    this._level = 0;
  }
}
