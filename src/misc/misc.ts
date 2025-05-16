import { Application, Assets, Renderer, Texture } from "pixi.js";

export let mapData: any = null;
export let waterTexture: Texture;
export let blockTileTexture: Texture;
export let palmTileTexture: Texture;
export let rockTileTexture: Texture;
export let tileTexture: Texture;

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
await Assets.load([
  {
    alias: "mapData",
    src: "/src/json/santorini-map.json",
  },
  {
    alias: "waterTexture",
    src: "/assets/water.png",
  },
  {
    alias: "blockTileTexture",
    src: "/assets/block-tile.png",
  },
  {
    alias: "rockTileTexture",
    src: "/assets/rock.png",
  },
  {
    alias: "oakTreeSkeleton",
    src: "/src/json/oak-tree.json",
  },
  {
    alias: "oakTreeAtlas",
    src: "/src/atlas/oak-tree.atlas",
  },
  {
    alias: "tileTexture",
    src: "/assets/tile.png",
  },
]);

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
  // Assign the loaded assets to the exported variables
  mapData = Assets.get("mapData"); // JSON map data
  waterTexture = Texture.from("waterTexture"); // Water texture
  blockTileTexture = Texture.from("blockTileTexture"); // Block tile texture
  rockTileTexture = Texture.from("rockTileTexture");
  tileTexture = Texture.from("tileTexture");
};

export const getMapTexture = (gid: number) => {
  switch (gid) {
    case 1:
      return waterTexture;
    case 2:
      return blockTileTexture;
    case 3:
      return rockTileTexture;
    case 4:
      return tileTexture;
    default:
      console.warn(`No texture for GID: ${gid}`); // Handle unassigned GIDs gracefully
      return null;
  }
};
