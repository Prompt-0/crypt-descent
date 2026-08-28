import { describe, it, expect } from 'vitest';
import { LootManager } from '../items/LootManager';

describe('LootManager & ItemCatalog', () => {
  it('creates items correctly from catalog definitions', () => {
    const sword = LootManager.createItem('iron_broadsword');
    expect(sword.name).toBe('Iron Broadsword');
    expect(sword.attackPower).toBe(6);
    expect(sword.id).toContain('iron_broadsword');
  });

  it('rolls randomized loot drops across dungeon depths', () => {
    for (let depth = 1; depth <= 5; depth++) {
      const item = LootManager.rollLoot(depth);
      expect(item).toBeDefined();
      expect(item.name).toBeTruthy();
    }
  });

  it('rolls chest loot bundles', () => {
    const chestLoot = LootManager.rollChestLoot(3);
    expect(chestLoot.length).toBeGreaterThanOrEqual(1);
  });
});
