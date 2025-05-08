import { Application, Assets, Renderer } from "pixi.js";

/**
 * Sets up the PixiJS application with initial configuration.
 *
 * - Initializes the app with a background color and resizes it to match the window.
 * - Appends the PixiJS canvas to the DOM element with the ID "pixi-container".
 *
 * @param app - A PixiJS Application instance, typed with a Renderer.
 * @returns A Promise that resolves once the app is initialized and appended to the DOM.
 */
export const setup = async (app: Application<Renderer>): Promise<void> => {
  await app.init({ background: "#1099bb", resizeTo: window });
  document.getElementById("pixi-container")!.appendChild(app.canvas);
};

/**
 * Loads map-related assets asynchronously using PixiJS Assets loader.
 *
 * - Loads a JSON map definition (e.g., Tiled map data).
 * - Loads the corresponding tileset image used for rendering the map.
 * @returns A Promise that resolves to an object containing:
 *    - mapData: the parsed JSON map file.
 *    - tilesetTexture: the loaded tileset image as a PixiJS texture.
 */
export const loadMapAssets = async () => {
  const [mapData, tilesetTexture] = await Promise.all([
    Assets.load("/src/json/santorini-map.json"),
    Assets.load("/assets/santorini-map.png"),
  ]);
  return { mapData, tilesetTexture };
};
