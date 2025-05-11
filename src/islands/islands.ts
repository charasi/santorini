import {
  loadMapAssets,
  mapData,
  getMapTexture,
  palmTileTexture,
  rockTileTexture,
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

  // 1. Add base tiles in isometric projection
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
    const drawY = isoY - (texture.height - tileHeight); // Align base tile vertically

    tilemap.tile(texture, isoX, drawY);
  }

  //mapContainer.addChild(tilemap);

  // 2. Add palm trees from object layer inside group layer
  const groupLayer = mapData.layers.find((l) => l.type === "group");
  if (!groupLayer || !groupLayer.layers) {
    console.warn("No environment group layer found.");
    return;
  }

  const objectLayer = groupLayer.layers.find(
    (l: any) => l.type === "objectgroup" && l.name === "palm-tree",
  );

  if (!objectLayer || !objectLayer.objects) {
    console.warn("No palm tree objects found.");
    return;
  }

  objectLayer.objects.forEach((object: any) => {
    //if (object.gid === 3) {
    const x = object.x;
    const y = object.y;

    const isoX = x - y + tileWidth / 2;
    const isoY = (x + y) / 2;

    const drawX = Math.round(isoX);
    const drawY = Math.round(isoY);

    const baseTexture = getMapTexture(object.gid);

    const palm = new Sprite(baseTexture!);
    palm.anchor.set(0.5, 1); // Center horizontally, bottom vertically
    palm.position.set(drawX, drawY);
    tilemap.addChild(palm);
    //}
  });

  mapContainer.addChild(tilemap);
  // Update map container's position (centered)
  mapContainer.position.set(
    app.screen.width / 2 - 100,
    app.screen.height / 2 - 300,
  );
  // 3. Add map container to the stage after setting its position
  app.stage.addChild(mapContainer);
};
