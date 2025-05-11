import {
  loadMapAssets,
  mapData,
  getMapTexture,
  palmTileTexture,
} from "../misc/misc.ts";
import { Application, Texture, Sprite, Container } from "pixi.js";
import { CompositeTilemap } from "@tilemap/CompositeTilemap";

export const addIsland = async (app: Application) => {
  await loadMapAssets();

  if (!mapData) {
    console.error("Error: mapData is null or undefined.");
    return;
  }

  const tileWidth = mapData.tilewidth;
  const tileHeight = mapData.tileheight;
  const mapWidth = mapData.width;

  const tileLayer = mapData.layers.find((l) => l.name === "islands");
  if (!tileLayer || tileLayer.type !== "tilelayer") {
    console.error("No valid tile layer found");
    return;
  }

  const mapContainer = new Container();
  const tilemap = new CompositeTilemap();

  // 1. Add base tiles
  for (let i = 0; i < tileLayer.data.length; i++) {
    const gid = tileLayer.data[i];
    if (gid === 0) continue;

    const col = i % mapWidth;
    const row = Math.floor(i / mapWidth);

    const isoX = (col - row) * (tileWidth / 2);
    const isoY = (col + row) * (tileHeight / 2);

    const baseTexture = getMapTexture(gid);
    if (!baseTexture) continue;

    const texture = new Texture(baseTexture);
    const drawY = isoY - (texture.height - tileHeight); // Align tile base

    tilemap.tile(texture, isoX, drawY);
  }

  mapContainer.addChild(tilemap);

  // 2. Add palm trees from object layer
  const groupLayer = mapData.layers.find(
    (l) => l.type === "group" && l.name === "Environments",
  );
  if (groupLayer && groupLayer.layers) {
    const palmLayer = groupLayer.layers.find(
      (l) => l.name === "palm-tree" && l.type === "objectgroup",
    );

    console.log("Palm objects:", palmLayer.objects);
    let x;
    x = 0;
    let y;
    y = 0;
    if (palmLayer && palmLayer.objects) {
      for (const obj of palmLayer.objects) {
        if (obj.gid === 3 && palmTileTexture) {
          // Convert object pixel (world) position to isometric screen position
          const isoX = (obj.x - obj.y) * (tileWidth / 2);
          const isoY = (obj.x + obj.y) * (tileHeight / 2);

          console.log("Adding palm at", obj.x, obj.y);

          const palm = new Sprite(palmTileTexture);
          //palm.anchor.set(0.5, 1); // Align base
          palm.position.set(x, y);
          x = x + 10;
          y = y + 15;

          mapContainer.addChild(palm);
          console.log(mapContainer);
        }
      }
    }
  }

  /**
   // 3. Center map on screen
   const mapHeight = mapData.height;

   const screenWidth = 1280;
   const screenHeight = 720;
   //const mapPixelWidth = (mapWidth + mapHeight) * (tileWidth / 2);
   const mapPixelHeight = (mapWidth + mapHeight) * (tileHeight / 2);
  mapContainer.position.set(
    screenWidth / 2,
    screenHeight / 2 - mapPixelHeight / 2,
  );
      */

  mapContainer.x = app.screen.width / 2 - 100;
  mapContainer.y = app.screen.height / 2 - 300;

  app.stage.addChild(mapContainer);
};
