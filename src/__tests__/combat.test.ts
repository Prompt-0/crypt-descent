import { describe, it, expect } from 'vitest';
import { CombatEngine } from '../combat/CombatEngine';
import { Entity } from '../entities/Entity';
import { MonsterType } from '../types';

describe('CombatEngine & EHP Formulas', () => {
  it('calculates damage with armor mitigation and handles attacks', () => {
    const hero = new Entity('hero', 'Hero', '@', '#fbbf24', 0, 0, undefined, true, {
      strength: 20,
      agility: 50, // high agility guarantees high hit chance
      defense: 5
    });

    const rat = Entity.createMonster(MonsterType.CRYPT_RAT, 1, 0);

    // Execute multiple strikes to verify combat math on hits
    let hitCount = 0;
    for (let i = 0; i < 5; i++) {
      const result = CombatEngine.executeAttack(hero, rat);
      if (result.hit) {
        hitCount++;
        expect(result.rawDamage).toBeGreaterThan(0);
        expect(result.mitigatedDamage).toBeGreaterThan(0);
        expect(result.mitigatedDamage).toBeLessThanOrEqual(result.rawDamage);
      }
    }
    expect(hitCount).toBeGreaterThan(0);
  });

  it('correctly levels up entity and increases attributes', () => {
    const hero = new Entity('hero', 'Hero', '@', '#fbbf24', 0, 0, undefined, true, {
      level: 1,
      xp: 0,
      xpToNextLevel: 100,
      hp: 100,
      maxHp: 100
    });

    const didLevel = CombatEngine.addXp(hero, 150);
    expect(didLevel).toBe(true);
    expect(hero.stats.level).toBe(2);
    expect(hero.stats.maxHp).toBe(115);
    expect(hero.stats.xp).toBe(50);
  });
});
