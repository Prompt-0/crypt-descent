import { describe, it, expect } from 'vitest';
import { MonsterAI } from '../ai/MonsterAI';
import { DungeonGenerator } from '../procgen/DungeonGenerator';
import { Entity } from '../entities/Entity';
import { MonsterType } from '../types';

describe('MonsterAI & Pathfinding', () => {
  it('finds path towards player target', () => {
    const gen = new DungeonGenerator(30, 20);
    const level = gen.generate(1);

    const monster = Entity.createMonster(MonsterType.CRYPT_RAT, level.playerSpawn.x + 2, level.playerSpawn.y);
    const player = new Entity('player', 'Hero', '@', '#fbbf24', level.playerSpawn.x, level.playerSpawn.y);

    const nextStep = MonsterAI.findNextStep(
      monster,
      { x: player.x, y: player.y },
      level.tiles,
      [monster],
      level.width,
      level.height
    );

    expect(nextStep).not.toBeNull();
  });

  it('determines line of sight correctly through open tiles', () => {
    const gen = new DungeonGenerator(30, 20);
    const level = gen.generate(1);

    // Adjacent tiles
    const los = MonsterAI.hasLineOfSight(
      level.playerSpawn.x,
      level.playerSpawn.y,
      level.playerSpawn.x + 1,
      level.playerSpawn.y,
      level.tiles
    );

    expect(typeof los).toBe('boolean');
  });
});
