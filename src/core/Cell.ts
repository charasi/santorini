import { Container, Sprite } from "pixi.js";

export class Cell {
  private _level: number;
  private _occupied: boolean;
  private _container: Container | undefined;
  private _worker: Worker | undefined;

  constructor(container: Container) {
    this._occupied = false;
    this._container = container;
    this._level = 0;
  }
}
