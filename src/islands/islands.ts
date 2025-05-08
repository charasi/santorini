import { loadMapAssets } from "../misc/misc.ts";
import { CompositeTilemap } from "@tilemap/CompositeTilemap";
import { Application, Rectangle, Texture } from "pixi.js";

export const addIsland = async (app: Application) => {
  // await map assets
  const { mapData, tilesetTexture } = await loadMapAssets();

  // get tile size (width/height) in the map
  const tileWidth = mapData.tilewidth;
  const tileHeight = mapData.tileheight;
  // get map width
  const mapWidth = mapData.width;
  // create composite tile map
  const tilemap = new CompositeTilemap();

  // island layer this is the first map layer
  const island_layer = mapData.layers[0];

  // tilesetTexture.width: is the total width of the tileset image in pixels (e.g., 256 px)
  // tileWidth: This is the width of a single tile in pixels (e.g., 32 px).
  // tilesetCols = 256 / 32 = 8;
  // tileset image contains 8 tiles per row
  const tilesetCols = tilesetTexture.width / tileWidth;

  //
  for (let i = 0; i < island_layer.data.length; i++) {
    // Global Tile ID. number that uniquely identifies a tile across all tilesets used in map
    const gid = island_layer.data[i];
    if (gid === 0) continue;

    // Calculate the column index (x-coordinate) of a tile in a 2D tilemap grid,
    // based on its position i in a 1D tile array
    // i (number) – Index of the tile in the flat array (e.g., layer.data[i])
    // mapWidth (number) – Width of the tilemap in tiles (number of columns)
    // col (number) – The column index (0-based) within the map row
    const col = i % mapWidth;
    // Calculate the row index (y-coordinate) of a tile in a 2D tilemap grid,
    // based on its position i in a 1D tile array
    // i (number) – Index of the tile in the flat array (e.g., layer.data[i])
    // mapWidth (number) – Width of the tilemap in tiles (number of columns)
    // row (number) – The row index (0-based) in the tilemap grid
    const row = Math.floor(i / mapWidth);

    // Calculates the x-coordinate in pixels for rendering a tile by
    // multiplying its column index by the width of a single tile
    const x = col * tileWidth;

    // Calculates the y-coordinate in pixels for rendering a tile by multiplying its row index by the
    // height of a single tile. This determines the tile's vertical position on the screen
    const y = row * tileHeight;

    const tileIndex = gid - 1;
    const tileX = (tileIndex % tilesetCols) * tileWidth;
    const tileY = Math.floor(tileIndex / tilesetCols) * tileHeight;

    const frame = new Rectangle(tileX, tileY, tileWidth, tileHeight);
    const tileTexture = new Texture({
      source: tilesetTexture.source,
      frame: frame,
    });

    tilemap.tile(tileTexture, x, y);
  }

  app.stage.addChild(tilemap);
};
