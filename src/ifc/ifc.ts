import { Container } from "pixi.js";

export interface GridContainer extends Container {
  metadata: {
    x: number;
    y: number;
    cell: number;
    height: number;
    width: number;
  };
}
