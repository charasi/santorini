import { Application, Assets, Renderer, Texture } from "pixi.js";

export let mapData: any = null;
export let waterTexture: Texture | null = null;
export let blockTileTexture: Texture | null = null;
export let palmTileTexture: Texture | null = null;
export let rockTileTexture: Texture | null = null;

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

// add bundle of asssets
Assets.addBundle("mapAssets", {
  mapData: "/src/json/santorini-map.json",
  waterTexture: "/assets/water.png",
  blockTileTexture: "/assets/block-tile.png",
  palmTileTexture: "/assets/palm.png",
  rockTileTexture: "/assets/rock.png",
});

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
  // Load the assets from the "mapAssets" bundle
  const assets = await Assets.loadBundle("mapAssets");
  // Assign the loaded assets to the exported variables
  mapData = assets.mapData; // JSON map data
  waterTexture = assets.waterTexture as Texture; // Water texture
  blockTileTexture = assets.blockTileTexture as Texture; // Block tile texture
  palmTileTexture = assets.palmTileTexture as Texture; // Palm tree texture
  rockTileTexture = assets.rockTileTexture as Texture;
};

export const getMapTexture = (gid: number) => {
  switch (gid) {
    case 1:
      return waterTexture;
    case 2:
      return blockTileTexture;
    case 3:
      return palmTileTexture; // Add palm tree texture
    case 4:
      return rockTileTexture;
    default:
      console.warn(`No texture for GID: ${gid}`); // Handle unassigned GIDs gracefully
      return null;
  }
};
