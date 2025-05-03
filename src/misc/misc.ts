/**
 * Misc function for santorini game
 */
import {
  Application,
  Assets,
  DisplacementFilter,
  Renderer,
  Sprite,
  Texture,
  TilingSprite,
} from "pixi.js";

let background: TilingSprite;
let displacementSprite: Sprite;

/**
 * Setup PixiJS application.
 * @param app - PixiJS application instance
 */
export const setup = async (app: Application<Renderer>): Promise<void> => {
  await app.init({ background: "#1099bb", resizeTo: window });
  document.getElementById("pixi-container")!.appendChild(app.canvas);
};

/**
 * Preload required assets for the application.
 */
export const preloadAssets = async (): Promise<void> => {
  const assets = [
    { alias: "background", src: "/src/assets/water.png" },
    { alias: "displacement", src: "/src/assets/displacement_map.png" },
  ];

  await Assets.load(assets);
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

  // Add the filter to the stage.
  app.stage.filters = [displacementFilter];
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
