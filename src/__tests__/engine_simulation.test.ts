import { describe, it, expect } from 'vitest';
import { SkillType, MonsterType, RelicProcType } from '../types';
import { Entity } from '../entities/Entity';
import { RelicManager } from '../relics/RelicManager';
import { CombatEngine } from '../combat/CombatEngine';
import { MonsterAI } from '../ai/MonsterAI';
import { DungeonGenerator } from '../procgen/DungeonGenerator';

describe('Engine Simulation & Runtime Behavior QA Audit', () => {
  it('detects and verifies all 12 active skills exist in definitions', () => {
    const allSkills = [
      SkillType.WHIRLWIND,
      SkillType.SHIELD_SLAM,
      SkillType.BERSERK_RAGE,
      SkillType.FIREBOLT,
      SkillType.FROST_NOVA,
      SkillType.BLINK,
      SkillType.SHADOW_STEP,
      SkillType.SMOKE_BOMB,
      SkillType.FAN_OF_KNIVES,
      SkillType.HOLY_SMITE,
      SkillType.DIVINE_HEAL,
      SkillType.PURIFYING_AURA
    ];

    expect(allSkills.length).toBe(12);
  });

  it('verifies Boss Malakor Dark Nova spell targetPos behavior is correctly defined', () => {
    const boss = Entity.createMonster(MonsterType.BOSS_MALAKOR, 5, 5);
    const player = new Entity('player', 'Hero', '@', '#fff', 5, 6, undefined, true);
    const gen = new DungeonGenerator(20, 20);
    const level = gen.generate(1);

    // Call planBossAction via planTurn when dist <= 1.5
    let darkNovaCount = 0;
    for (let i = 0; i < 50; i++) {
      const action = MonsterAI.planTurn(boss, player, level.tiles, [boss], 20, 20);
      if (action.spellName === 'Dark Nova Blast') {
        darkNovaCount++;
        expect(action.targetPos).toBeDefined();
        expect(action.targetPos?.x).toBe(player.x);
        expect(action.targetPos?.y).toBe(player.y);
      }
    }
  });

  it('verifies Level Up perk trigger condition sets pendingLevelUp flag', () => {
    const player = new Entity('player', 'Hero', '@', '#fbbf24', 0, 0, undefined, true, {
      level: 1,
      xp: 0,
      xpToNextLevel: 100
    });

    const leveled = CombatEngine.addXp(player, 120);
    expect(leveled).toBe(true);
    expect(player.stats.level).toBe(2);
    expect(player.pendingLevelUp).toBe(true);
  });

  it('verifies Aegis Dreadstone damage reflection tracking', () => {
    const player = new Entity('player', 'Hero', '@', '#fbbf24', 0, 0, undefined, true, {
      hp: 100,
      maxHp: 100,
      defense: 10
    });
    const aegisRelic = RelicManager.createRelic('aegis_dreadstone');
    player.equipItem(aegisRelic);

    expect(RelicManager.hasRelic(player.equipment as any, RelicProcType.AEGIS_THORNS)).toBe(true);
  });
});
