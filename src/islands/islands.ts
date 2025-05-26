import { loadMapAssets, mapData, getMapTexture } from "../misc/misc.ts";
import { Application, Texture, Sprite, Container } from "pixi.js";
import { CompositeTilemap } from "@tilemap/CompositeTilemap";
import { oakTreeAnimation } from "../animations/oak-tree.ts";
import { Board } from "../core/Board.ts";
import { GlowFilter } from "pixi-filters";

export const mapContainer = new Container();
export const tilemap = new CompositeTilemap();
export const gameBoard = new Board();
export const objectLayerContainer = new Container();

let sprite: Sprite;

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
  const renderQueue: { sprite: Sprite; drawY: number }[] = [];

  groupLayer.layers.forEach((layer: any) => {
    if (layer.type === "objectgroup" && layer.objects) {
      layer.objects.forEach((object: any) => {
        const x = object.x;
        const y = object.y;

        const isoX = x - y + tileWidth / 2;
        const isoY = (x + y) / 2;

        const drawX = Math.round(isoX);
        const drawY = Math.round(isoY);

        if (object.name === "oak") {
          const oak = oakTreeAnimation(drawX, drawY);
          renderQueue.push({ sprite: oak, drawY });
          return;
        }

        if (object.gid !== 3 && object.gid !== 4) {
          return;
        }

        const baseTexture = getMapTexture(object.gid);
        if (!baseTexture) {
          console.warn("Missing texture for gid:", object.gid);
          return;
        }
        sprite = new Sprite(baseTexture);
        sprite.anchor.set(0.5, 1);

        console.log("sam");

        if (object.gid === 4) {
          //const baseTexture = getMapTexture(4);
          //if (!baseTexture) {
          //console.warn("Missing texture for gid:", 4);
          //return;
          //}

          //const tileSprite = new Sprite(baseTexture);
          //tileSprite.anchor.set(0.5, 1);
          //tileSprite.position.set(drawX, drawY);
          sprite.filters = [
            new GlowFilter({
              alpha: 1,
              distance: 5,
              outerStrength: 20,
              innerStrength: 1,
              color: 0xffffff,
            }),
          ];

          //renderQueue.push({ sprite: sprite, drawY });

          //return;
        }

        // Default: render gid-based object
        //const baseTexture = getMapTexture(object.gid);
        //const baseTexture = getMapTexture(object.gid);
        //if (!baseTexture) {
        //console.warn("Missing texture for gid:", object.gid);
        //return;
        //}

        //const sprite = new Sprite(baseTexture);
        //sprite.anchor.set(0.5, 1);

        // Use converted isometric draw position
        sprite.position.set(drawX, drawY);

        renderQueue.push({ sprite, drawY }); // This drawY is used for depth sorting
      });
    }
  });

  // Sort by Y (iso depth)
  renderQueue.sort((a, b) => a.drawY - b.drawY);
  renderQueue.forEach(({ sprite }) => objectLayerContainer.addChild(sprite));

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
