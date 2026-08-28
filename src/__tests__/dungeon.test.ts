import { describe, it, expect } from 'vitest';
import { DungeonGenerator } from '../procgen/DungeonGenerator';
import { TileType } from '../types';

describe('DungeonGenerator', () => {
  it('generates a valid floor 1 dungeon with rooms, player spawn, and stairs down', () => {
    const gen = new DungeonGenerator(50, 35);
    const level = gen.generate(1);

    expect(level.width).toBe(50);
    expect(level.height).toBe(35);
    expect(level.rooms.length).toBeGreaterThan(0);
    expect(level.tiles[level.playerSpawn.y][level.playerSpawn.x].walkable).toBe(true);
    expect(level.tiles[level.stairsDownPos.y][level.stairsDownPos.x].type).toBe(TileType.STAIRS_DOWN);
    expect(level.monsterSpawns.length).toBeGreaterThan(0);
  });

  it('generates floor 5 with Malakor the Boss and arena structure', () => {
    const gen = new DungeonGenerator(50, 35);
    const level = gen.generate(5);

    expect(level.depth).toBe(5);
    const hasBoss = level.monsterSpawns.some((m) => m.difficultyTier === 99);
    expect(hasBoss).toBe(true);
  });
});
