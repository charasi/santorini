import { Application, Rectangle, Texture } from "pixi.js";
import { Assets } from "pixi.js";

import { CompositeTilemap } from "@tilemap/CompositeTilemap";

export async function isLands(app: Application) {
  // Load Tiled map JSON and tileset texture
  const [mapData, tilesetTexture] = await Promise.all([
    Assets.load("/src/json/test.json"),
    Assets.load("/src/assets/test.png"),
  ]);

  const tileWidth = mapData.tilewidth;
  const tileHeight = mapData.tileheight;
  const mapWidth = mapData.width;

  const tilemap = new CompositeTilemap();
  const layer = mapData.layers[0];

  // Columns in the tileset image
  // tilesetTexture.width: is the total width of the tileset image in pixels (e.g., 256 px)
  const tilesetCols = tilesetTexture.width / tileWidth;

  for (let i = 0; i < layer.data.length; i++) {
    const gid = layer.data[i];
    if (gid === 0) continue;

    const col = i % mapWidth;
    const row = Math.floor(i / mapWidth);
    const x = col * tileWidth;
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
}
