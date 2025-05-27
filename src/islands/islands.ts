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
    const drawY = isoY - (texture.height - tileHeight);

    tilemap.tile(texture, isoX, drawY);
  }

  const groupLayer = mapData.layers.find(
    (l: { type: string }) => l.type === "group",
  );
  if (!groupLayer || !groupLayer.layers) {
    console.warn("No environment group layer found.");
    return;
  }

  const renderQueue: { container: GridContainer; drawY: number }[] = [];

  groupLayer.layers.forEach((layer: any) => {
    if (layer.type === "objectgroup" && layer.objects) {
      layer.objects.forEach((object: any) => {
        const x = object.x;
        const y = object.y;

        const isoX = x - y + tileWidth / 2;
        const isoY = (x + y) / 2;

        const drawX = Math.round(isoX);
        const drawY = Math.round(isoY);

        const container = new Container() as GridContainer;
        container.position.set(drawX, drawY);

        if (
          object.properties !== undefined &&
          object.properties[0].name !== "tile"
        ) {
          console.warn("No properties found");
          return;
        }

        if (object.gid !== undefined) {
          const baseTexture = getMapTexture(object.gid);
          if (!baseTexture) {
            console.log(object.id);
            console.warn("Missing texture for gid:", object.gid);
            return;
          }

          const sprite = new Sprite(baseTexture);
          sprite.anchor.set(0.5, 1);
          sprite.position.set(0, 0); // relative to container

          container.addChild(sprite);

          if (object.gid === 4) {
            container.metadata = {
              x: object.x,
              y: object.y,
              cell: object.properties[0].value,
              height: object.height,
              width: object.width,
            };

            cellContainer[object.properties[0].value - 1] = container;

            sprite.filters = [
              new GlowFilter({
                alpha: 1,
                distance: 5,
                outerStrength: 20,
                innerStrength: 1,
                color: 0xffffff,
              }),
            ];
          }

          renderQueue.push({ container, drawY });
        }
      });
    }
  });

  renderQueue.sort((a, b) => a.drawY - b.drawY);
  renderQueue.forEach(({ container }) =>
    objectLayerContainer.addChild(container),
  );

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
  worker.zIndex = 2;

  cell.addChild(worker);
  cell.sortableChildren = true;
  cell.sortChildren();

  cell.removeChild(worker);

  // Add to main map container
  mapContainer.addChild(tilemap);
  mapContainer.addChild(objectLayerContainer);

  // Position map in center of screen
  mapContainer.position.set(
    app.screen.width / 2 - 100,
    app.screen.height / 2 - 220,
  );

  mapContainer.scale.set(0.75);

  app.stage.addChild(mapContainer);
};
