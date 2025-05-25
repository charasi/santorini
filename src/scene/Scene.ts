import { Container } from "pixi.js";

export abstract class Scene extends Container {
  constructor() {
    super();
  }

  abstract init(): void;
  abstract update(delta: number): void;

  destroyScene(): void {
    this.removeChildren();
  }
}
