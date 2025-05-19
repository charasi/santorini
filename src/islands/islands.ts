import { loadMapAssets, mapData, getMapTexture } from "../misc/misc.ts";
import { Application, Texture, Sprite, Container } from "pixi.js";
import { CompositeTilemap } from "@tilemap/CompositeTilemap";
import { oakTreeAnimation } from "../animations/oak-tree.ts";
import { Board } from "../core/Board.ts";
import { Cell } from "../core/Cell.ts";
import { GlowFilter } from "pixi-filters";

export const mapContainer = new Container();
export const tilemap = new CompositeTilemap();
export const gameBoard = new Board();
export const objectLayerContainer = new Container();

export const addIsland = async (app: Application) => {
  await loadMapAssets();

  if (!mapData) {
    console.error("Error: mapData is null or undefined.");
    return;
  }

  const tileWidth = mapData.tilewidth;
  const tileHeight = mapData.tileheight;
  const mapWidth = mapData.width;

  const tileLayer = mapData.layers.find(
    (l: { name: string }) => l.name === "islands",
  );
  if (!tileLayer || tileLayer.type !== "tilelayer") {
    console.error("No valid tile layer found");
    return;
  }

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

  // 2. Add all objects from all object layers inside the group layer, with depth sorting
  const groupLayer = mapData.layers.find(
    (l: { type: string }) => l.type === "group",
  );
  if (!groupLayer || !groupLayer.layers) {
    console.warn("No environment group layer found.");
    return;
  }

  objectLayerContainer.x = mapContainer.x;
  objectLayerContainer.y = mapContainer.y;

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

        if (object.name === "Tile") {
          const baseTexture = getMapTexture(4);
          if (!baseTexture) {
            console.warn("Missing texture for gid:", 4);
            return;
          }

          const tileSprite = new Sprite(baseTexture);
          tileSprite.anchor.set(0.5, 1);
          tileSprite.position.set(drawX, drawY);
          tileSprite.filters = [
            new GlowFilter({
              alpha: 1,
              distance: 5,
              outerStrength: 20,
              innerStrength: 1,
              color: 0x00ffff,
            }),
          ];

          renderQueue.push({ sprite: tileSprite, drawY });

          return;
        }

        // Default: render gid-based object
        const baseTexture = getMapTexture(object.gid);
        if (!baseTexture) {
          console.warn("Missing texture for gid:", object.gid);
          return;
        }

        const sprite = new Sprite(baseTexture);
        sprite.anchor.set(0.5, 1);
        sprite.position.set(drawX, drawY);
        renderQueue.push({ sprite, drawY });
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

  //const mapHeightPx =
  //(mapData.width + mapData.height) * (mapData.tileheight / 2);
  //const mapWidthPx = (mapData.width + mapData.height) * (mapData.tilewidth / 2);

  //const scaleX = app.screen.width / mapWidthPx;
  //const scaleY = app.screen.height / mapHeightPx;
  //const scale = Math.min(scaleX, scaleY); // Keep aspect ratio
  //mapContainer.scale.set(scale);
  mapContainer.scale.set(0.75);

  // Final: add everything to the stage
  app.stage.addChild(mapContainer);
};
