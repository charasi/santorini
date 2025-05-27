import { loadMapAssets, mapData, getMapTexture } from "../misc/misc.ts";
import { Application, Texture, Sprite, Container } from "pixi.js";
import { CompositeTilemap } from "@tilemap/CompositeTilemap";
import { oakTreeAnimation } from "../animations/oak-tree.ts";
import { Board } from "../core/Board.ts";
import { GlowFilter } from "pixi-filters";
import { GridContainer } from "../ifc/ifc.ts";
import {
  bottomBlockTexture,
  middleBlockTexture,
  blueFemaleWorkerTexture,
} from "../misc/misc.ts";

export const mapContainer = new Container();
export const tilemap = new CompositeTilemap();
export const gameBoard = new Board();
export const objectLayerContainer = new Container();
export const cellContainer: GridContainer[] = Array.from({ length: 25 }, () => {
  const container = new Container() as GridContainer;
  container.metadata = {
    x: 0,
    y: 0,
    cell: 0,
    height: 96,
    width: 96,
  };
  return container;
});

export const addIsland = async (app: Application) => {
  await loadMapAssets();

  if (!mapData) {
    console.error("Error: mapData is null or undefined.");
    return;
  }

  // tilewidth x tileheight = 64x32

  const tileWidth = mapData.tilewidth;
  const tileHeight = mapData.tileheight;

  // map width 22, height is 16 = (22x16 is 352 tiles)
  const mapWidth = mapData.width;

  // screen width = (mapWidth + mapHeight) * TILE_WIDTH_HALF
  // screen height = (mapWidth + mapHeight) * TILE_HEIGHT_HALF

  // Width: (22 + 16) * 32 = 38 * 32 = 1216 px
  // Height: (22 + 16) * 16 = 38 * 16 = 608 px

  // get json island object
  const tileLayer = mapData.layers.find(
    (l: { name: string }) => l.name === "islands",
  );
  // return if no valid tile layer found
  if (!tileLayer || tileLayer.type !== "tilelayer") {
    console.error("No valid tile layer found");
    return;
  }

  // 1. Add base tiles in isometric projection
  for (let i = 0; i < tileLayer.data.length; i++) {
    const gid = tileLayer.data[i];
    if (gid === 0) continue;

    // Calculate the column and row in the tilemap grid from the 1D tile index `i`
    // NOTE: In TILED MAP EDITOR X = column index and Y = row index
    // mapWidth is the number of columns

    // Calculate the column (x position) of the tile within the map grid
    // i % mapWidth gives you the current x (column) index in the grid
    // This gives the horizontal position across the map.
    const col = i % mapWidth;

    // Calculate the row (y position) of the tile within the map grid
    // This gives the vertical position (how many full rows fit before index `i`)
    const row = Math.floor(i / mapWidth);

    // Convert grid coordinates to isometric screen coordinates
    const isoX = (col - row) * (tileWidth / 2); // Horizontal screen position
    const isoY = (col + row) * (tileHeight / 2); // Vertical screen position

    // Get the base texture for the current tile GID (graphic ID)
    const baseTexture = getMapTexture(gid);
    if (!baseTexture) continue; // Skip if no texture found for this GID

    // Create a texture instance from the base texture
    const texture = new Texture(baseTexture);

    // Adjust Y to align the bottom of the tile (diamond) to the isometric grid
    // This is important if the texture is taller than a single tile (e.g., a tall object/building)
    // i.e keep height texture in the isometric grid
    const drawY = isoY - (texture.height - tileHeight);

    // Draw the tile at the calculated screen position
    tilemap.tile(texture, isoX, drawY);
  }

  // 2. Add all objects from all object layers inside the group layer, with depth sorting
  const groupLayer = mapData.layers.find(
    (l: { type: string }) => l.type === "group",
  );
  if (!groupLayer || !groupLayer.layers) {
    console.warn("No environment group layer found.");
    return;
  }

  // Collect all sprites for sorting
  const renderQueue: { spriteContainer: any; drawY: number }[] = [];

  groupLayer.layers.forEach((layer: any) => {
    if (layer.type === "objectgroup" && layer.objects) {
      layer.objects.forEach((object: any) => {
        // get pixel coordinates
        const x = object.x;
        const y = object.y;

        // convert to isometric
        // we use this formula since the pixel coordinates are already determined
        const isoX = x - y + tileWidth / 2;
        const isoY = (x + y) / 2;
        // round to integer since pixel are integers
        const drawX = Math.round(isoX);
        const drawY = Math.round(isoY);

        // add oak-tree animations
        if (object.name === "oak") {
          const oak = oakTreeAnimation(drawX, drawY);
          renderQueue.push({ spriteContainer: oak, drawY });
          return;
        }

        // base texture
        const baseTexture = getMapTexture(object.gid);
        if (!baseTexture) {
          console.warn("Missing texture for gid:", object.gid);
          return;
        }

        // if object layer is tile then create sprite and add to containers
        if (object.name === "Tile") {
          // containers to hold the tile sprites
          const tileContainer = new Container() as GridContainer;
          tileContainer.position.set(drawX, drawY);

          // create tiles
          const tileSprite = new Sprite(baseTexture);
          // 0.5 on the X-axis: the horizontal center of the sprite
          // 1 on the Y-axis: the bottom of the sprite is the origin
          // sprite is drawn upward from its bottom-center point
          tileSprite.anchor.set(0.5, 1);
          // set to bottom
          tileSprite.position.set(0, 0);

          tileSprite.filters = [
            new GlowFilter({
              alpha: 1,
              distance: 5,
              outerStrength: 20,
              innerStrength: 1,
              color: 0xffffff,
            }),
          ];

          // add tile to container
          tileContainer.addChild(tileSprite);
          cellContainer[object.properties[0].value - 1] = tileContainer;

          renderQueue.push({ spriteContainer: tileContainer, drawY });

          return;
        }

        const sprite = new Sprite(baseTexture);
        sprite.anchor.set(0.5, 1);
        sprite.position.set(drawX, drawY);
        renderQueue.push({ spriteContainer: sprite, drawY });
      });
    }
  });

  // Sort by Y (iso depth)
  renderQueue.sort((a, b) => a.drawY - b.drawY);
  renderQueue.forEach(({ spriteContainer }) =>
    objectLayerContainer.addChild(spriteContainer),
  );

  /**
  // Example: Add a block to cell 5
  const cell = cellContainer[5];
  const block = new Sprite(bottomBlockTexture);
  block.anchor.set(0.5, 1);
  block.position.set(0, -tileHeight); // stack on top of base sprite

  cell.sortableChildren = true;
  cell.addChild(block);
  cell.sortChildren();

  const block1 = new Sprite(middleBlockTexture);
  block1.anchor.set(0.5, 1);
  block1.position.set(0, -tileHeight * 3.2); // stack on top of base sprite

  cell.sortableChildren = true;
  cell.addChild(block1);
  cell.sortChildren();

  const stackHeight =
    bottomBlockTexture.height + middleBlockTexture.height - 130;

  const worker = new Sprite(blueFemaleWorkerTexture);
  worker.anchor.set(0.5, 1);
  worker.position.set(0, -stackHeight); // stack exactly on top
  //worker.zIndex = 2;
  worker.scale.set(0.5);

  cell.addChild(worker);
  cell.sortableChildren = true;
  cell.sortChildren();*/

  // Add to main map container
  mapContainer.addChild(tilemap);
  mapContainer.addChild(objectLayerContainer);

  // Position map in center of screen
  mapContainer.position.set(
    app.screen.width / 2 - 100,
    app.screen.height / 2 - 220,
  );

  mapContainer.scale.set(0.75);

  // Final: add everything to the stage
  app.stage.addChild(mapContainer);
};
