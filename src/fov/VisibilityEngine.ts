import { Tile, Position, LightSource } from '../types';
import * as ROT from 'rot-js';

export class VisibilityEngine {
  private width: number;
  private height: number;
  private fov: any;

  constructor(width: number, height: number, isLightPassable: (x: number, y: number) => boolean) {
    this.width = width;
    this.height = height;
    this.fov = new ROT.FOV.PreciseShadowcasting(isLightPassable);
  }

  public updateVisibility(
    playerPos: Position,
    playerViewRadius: number,
    tiles: Tile[][],
    lights: LightSource[],
    timeSeconds: number = 0
  ): void {
    // 1. Reset visible state for all tiles
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        tiles[y][x].visible = false;
        // Explored tiles keep baseline ambient light (0.15) if explored, else 0
        tiles[y][x].lightLevel = tiles[y][x].explored ? 0.15 : 0;
        tiles[y][x].lightColor = [40, 45, 60];
      }
    }

    // 2. Compute Player Field of View
    this.fov.compute(playerPos.x, playerPos.y, playerViewRadius, (x: number, y: number, r: number, visibility: number) => {
      if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
        const tile = tiles[y][x];
        tile.visible = true;
        tile.explored = true;

        // Player lantern light
        const falloff = 1 - r / (playerViewRadius + 1);
        const lanternLight = Math.max(0, falloff * visibility * 0.95);
        tile.lightLevel = Math.max(tile.lightLevel, lanternLight);
        tile.lightColor = [255, 230, 180]; // Warm lantern light
      }
    });

    // 3. Compute dynamic point light sources (torches, shrines, fountains)
    lights.forEach((light) => {
      // Dynamic flicker
      const flicker = light.flickerRate
        ? Math.sin(timeSeconds * light.flickerRate + light.x * 13 + light.y * 7) * 0.08
        : 0;
      const effectiveIntensity = Math.max(0.2, light.intensity + flicker);

      this.fov.compute(light.x, light.y, light.radius, (x: number, y: number, r: number, visibility: number) => {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
          const tile = tiles[y][x];
          if (tile.visible || tile.explored) {
            const distRatio = r / light.radius;
            const lightContribution = Math.max(0, (1 - distRatio * distRatio) * visibility * effectiveIntensity);

            if (lightContribution > 0.05) {
              tile.lightLevel = Math.min(1.0, tile.lightLevel + lightContribution * 0.7);

              // Color blend
              if (tile.lightColor) {
                tile.lightColor = [
                  Math.min(255, Math.floor(tile.lightColor[0] * 0.5 + light.color[0] * 0.5)),
                  Math.min(255, Math.floor(tile.lightColor[1] * 0.5 + light.color[1] * 0.5)),
                  Math.min(255, Math.floor(tile.lightColor[2] * 0.5 + light.color[2] * 0.5))
                ];
              } else {
                tile.lightColor = [...light.color];
              }
            }
          }
        }
      });
    });
  }
}
