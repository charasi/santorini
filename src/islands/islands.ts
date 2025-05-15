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

  const tileLayer = mapData.layers.find((l) => l.name === "islands");
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

  // 2. Add all objects from all object layers inside the group layer
  const groupLayer = mapData.layers.find((l) => l.type === "group");
  if (!groupLayer || !groupLayer.layers) {
    console.warn("No environment group layer found.");
    return;
  }

  objectLayerContainer.x = mapContainer.x;
  objectLayerContainer.y = mapContainer.y;

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
          const oak = oakTreeAnimation(drawX, drawY); // Pass position
          objectLayerContainer.addChild(oak); // Add to the tilemap
          return;
        }

        if (object.name === "Tiles") {
          const cell_no: number = object.properties[0].value;
          const row = Math.floor((cell_no - 1) / 5);
          const col = (cell_no - 1) % 5;

          const container = new Container();
          //container.x = drawX;
          //container.y = drawY;
          container.position.set(drawX, drawY);
          const cell = new Cell(container);
          gameBoard.setCell(row, col, cell);
          container.filters = [
            new GlowFilter({
              alpha: 1,
              innerStrength: 16,
              outerStrength: 16.5,
            }),
          ];
          console.log(container);
          objectLayerContainer.addChild(container);
          return;
        }

        const baseTexture = getMapTexture(object.gid);
        if (!baseTexture) {
          console.warn("Missing texture for gid:", object.gid);
          return;
        }

        const sprite = new Sprite(baseTexture);
        sprite.anchor.set(0.5, 1);
        sprite.position.set(drawX, drawY);
        tilemap.addChild(sprite);
      });
    }
  });

  /**
  // Loop through each object layer inside the group
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
          const oak = oakTreeAnimation(drawX, drawY); // Pass position
          tilemap.addChild(oak); // Add to the tilemap
          return;
        }

        if (object.name === "Tiles") {
          const cell_no: number = object.properties[0].value;
          const row = Math.floor((cell_no - 1) / 5);
          const col = (cell_no - 1) % 5;

          const container = new Container();
          //container.x = drawX;
          //container.y = drawY;
          container.position.set(drawX, drawY);
          const cell = new Cell(container);
          gameBoard.setCell(row, col, cell);
          container.filters = [
            new GlowFilter({
              alpha: 1,
              innerStrength: 16,
              outerStrength: 16.5,
            }),
          ];
          console.log(container);
          tilemap.addChild(container);
          return;
        }

        const baseTexture = getMapTexture(object.gid);
        if (!baseTexture) {
          console.warn("Missing texture for gid:", object.gid);
          return;
        }

        const sprite = new Sprite(baseTexture);
        sprite.anchor.set(0.5, 1);
        sprite.position.set(drawX, drawY);
        tilemap.addChild(sprite);
      });
    }
  });
      */

  mapContainer.addChild(tilemap);
  mapContainer.addChild(objectLayerContainer);
  // Update map container's position (centered)
  mapContainer.position.set(
    app.screen.width / 2 - 100,
    app.screen.height / 2 - 300,
  );
  // 3. Add map container to the stage after setting its position
  app.stage.addChild(mapContainer);
};
