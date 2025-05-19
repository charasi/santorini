import {
  Application,
  Assets,
  DisplacementFilter,
  Renderer,
  Sprite,
  Texture,
  TilingSprite,
} from "pixi.js";

export let mapData: any = null;
export let waterTexture: Texture;
export let blockTileTexture: Texture;
export let palmTileTexture: Texture;
export let rockTileTexture: Texture;
export let tileTexture: Texture;
export let background: TilingSprite;
export let displacementSprite: Sprite;

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
  { alias: "background", src: "/assets/ocean.png" },
  { alias: "displacement", src: "/assets/displacement_map.png" },
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

/**
 * Add and scale the background sprite to fit the screen.
 * @param app - PixiJS application instance
 */
export const addBackground = (app: Application<Renderer>) => {
  const texture = Texture.from("background");

  // Create a tiling sprite with the water texture and specify the dimensions.
  background = new TilingSprite({
    texture,
    width: app.screen.width,
    height: app.screen.height,
  });

  //const background = Sprite.from("background");
  background.anchor.set(0.5);

  if (app.screen.width > app.screen.height) {
    // Landscape: fill width, scale height proportionally
    background.width = app.screen.width * 1.2;
    background.scale.y = background.scale.x;
  } else {
    // Portrait/Square: fill height, scale width proportionally
    background.height = app.screen.height * 1.2;
    background.scale.x = background.scale.y;
  }

  // Center the background
  background.x = app.screen.width / 2;
  background.y = app.screen.height / 2;

  app.stage.addChild(background);
};

export const addDisplacementEffect = (app: Application<Renderer>) => {
  const texture = Texture.from("displacement");
  // Set the base texture wrap mode to repeat to allow the texture UVs to be tiled and repeated.
  texture.source.addressMode = "repeat";
  // Create a sprite from the preloaded displacement asset.
  displacementSprite = Sprite.from(texture);

  // Create a displacement filter
  const displacementFilter = new DisplacementFilter({
    sprite: displacementSprite,
    scale: { x: 60, y: 120 },
  });

  app.stage.addChild(displacementSprite);

  background.filters = [displacementFilter];
  // Add the filter to the stage.
  //app.stage.filters = [displacementFilter];
};

export const waterWaves = () => {
  // Offset the sprite position to make vFilterCoord update to larger value.
  // Repeat wrapping makes sure there's still pixels on the coordinates.
  displacementSprite.x++;
  // Reset x to 0 when it's over width to keep values from going to very huge numbers.
  if (displacementSprite.x > displacementSprite.width) {
    displacementSprite.x = 0;
  }
};
