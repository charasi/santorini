import {
  loadMapAssets,
  mapData,
  getMapTexture,
  palmTileTexture,
} from "../misc/misc.ts";
import { CompositeTilemap } from "@tilemap/CompositeTilemap";
import { Application, Sprite, Texture } from "pixi.js";

export const addIsland = async (app: Application) => {
  await loadMapAssets();

  if (!mapData) {
    console.error("Error: mapData is null or undefined.");
    return;
  }

  const tileWidth = mapData.tilewidth;
  const tileHeight = mapData.tileheight;
  const mapWidth = mapData.width;
  const mapHeight = mapData.height;

  const screenWidth = 1280;
  const screenHeight = 720;

  const layer = mapData.layers[0];
  const tilemap = new CompositeTilemap();

  // Estimate max tile draw height for overflow adjustment
  const estimatedMaxTileHeight = 74;

  // Compute bounding box of isometric map
  const minIsoX = (0 - (mapHeight - 1)) * (tileWidth / 2);
  const maxIsoX = (mapWidth - 1) * (tileWidth / 2);

  const minIsoY = tileHeight / 2;
  const maxIsoY = (mapWidth - 1 + (mapHeight - 1)) * (tileHeight / 2);

  const mapPixelWidth = maxIsoX - minIsoX + tileWidth;
  const mapPixelHeight = maxIsoY - minIsoY + estimatedMaxTileHeight;

  const offsetX = (screenWidth - mapPixelWidth) / 2 - minIsoX;
  const offsetY = (screenHeight - mapPixelHeight) / 2 - minIsoY;

  for (let i = 0; i < layer.data.length; i++) {
    const gid = layer.data[i];
    if (gid === 0) continue;

    const col = i % mapWidth;
    const row = Math.floor(i / mapWidth);

    const isoX = (col - row) * (tileWidth / 2);
    const isoY = (col + row) * (tileHeight / 2);

    const baseTexture = getMapTexture(gid);
    if (!baseTexture) continue;

    const tileTexture = new Texture(baseTexture);

    const drawX = Math.round(isoX + offsetX);
    const drawY = Math.round(
      isoY + offsetY - (tileTexture.height - tileHeight),
    );

    tilemap.tile(tileTexture, drawX, drawY);
  }

  app.stage.addChild(tilemap);

  // Handle palm trees from object layer inside group layer
  const groupLayer = mapData.layers.find((l) => l.type === "group");
  if (!groupLayer || !groupLayer.layers) return;

  const objectLayer = groupLayer.layers.find(
    (l: any) => l.type === "objectgroup" && l.name === "palm-tree",
  );

  if (!objectLayer || !objectLayer.objects) return;

  objectLayer.objects.forEach((object: any) => {
    if (object.gid === 3) {
      const x = object.x;
      const y = object.y;

      const isoX = x - y + tileWidth / 2;
      const isoY = (x + y) / 2;

      const drawX = Math.round(isoX + offsetX);
      const drawY = Math.round(isoY + offsetY);

      const palm = new Sprite(palmTileTexture!);
      palm.anchor.set(0.5, 1); // Center horizontally, bottom vertically
      palm.position.set(drawX, drawY);
      tilemap.addChild(palm);
    }
  });
};
