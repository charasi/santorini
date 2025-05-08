import { Application } from "pixi.js";
import {
  addBackground,
  addDisplacementEffect,
  preloadAssets,
  setup,
  waterWaves,
} from "./misc/misc.ts";
import { isLands } from "./islands/islands.ts";

const app = new Application();

(async () => {
  await setup(app);
  await preloadAssets();
  addBackground(app);
  addDisplacementEffect(app);
  await isLands(app);

  // Add the animation callbacks to the application's ticker.
  app.ticker.add((time) => {
    //time.count;
    waterWaves();
  });
})();
