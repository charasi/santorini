import { Worker } from "./Worker.ts";

export class Player {
  // @ts-expect-error err
  private _name: string;
  // @ts-expect-error err
  private _worker: [Worker, Worker];
}
