import { Application } from "pixi.js";
import {
  addBackground,
  addDisplacementEffect,
  setup,
  waterWaves,
} from "./misc/misc.ts";
import { addIsland } from "./islands/islands.ts";

// create new application
const app = new Application();

// Immediately Invoked Async Function Expression (IIAFE)
// This is an anonymous async function defined using an arrow function:
// wrapped in parentheses to turn it into an expression:
// immediately invoked with ()

/**
 * main function to start pixijs application
 */
(async () => {
  // Await the asynchronous setup of the PixiJS application.
  // This ensures the application is fully initialized and its canvas is added to the DOM
  // before any rendering logic or asset loading begins.
  await setup(app);
  addBackground(app);
  addDisplacementEffect(app);
  await addIsland(app);

  // Add the animation callbacks to the application's ticker.
  app.ticker.add((time) => {
    //time.count;
    waterWaves();
  });
})();
