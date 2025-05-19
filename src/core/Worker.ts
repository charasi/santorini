import { Player } from "./Player.ts";
import { Position } from "./Position.ts";

export class Worker {
  // @ts-expect-error err
  private _owner: Player;
  // @ts-expect-error err
  private _position: Position;
}
