import { describe, it, expect } from 'vitest';
import { CLASS_CATALOG } from '../classes/ClassCatalog';
import { PlayerClassType, SkillType } from '../types';
import { SkillManager } from '../skills/SkillManager';
import { RelicManager } from '../relics/RelicManager';
import { ShopManager } from '../shop/ShopManager';
import { AffixGenerator } from '../items/AffixGenerator';
import { LootManager } from '../items/LootManager';

describe('New Feature Suites: Classes, Skills, Relics, Shop & Affixes', () => {
  it('defines valid starting attributes for all 4 hero classes', () => {
    const warrior = CLASS_CATALOG[PlayerClassType.WARRIOR];
    const mage = CLASS_CATALOG[PlayerClassType.MAGE];
    const assassin = CLASS_CATALOG[PlayerClassType.ASSASSIN];
    const cleric = CLASS_CATALOG[PlayerClassType.CLERIC];

    expect(warrior.baseHp).toBeGreaterThan(mage.baseHp);
    expect(mage.baseMana).toBeGreaterThan(warrior.baseMana);
    expect(assassin.agility).toBeGreaterThan(warrior.agility);
    expect(cleric.skills.length).toBe(3);
  });

  it('manages active skill cooldowns correctly', () => {
    const whirlwind = SkillManager.createSkill(SkillType.WHIRLWIND);
    expect(whirlwind.cooldownCurrent).toBe(0);
    whirlwind.cooldownCurrent = 3;

    SkillManager.tickCooldowns([whirlwind]);
    expect(whirlwind.cooldownCurrent).toBe(2);
  });

  it('generates relics and tracks proc synergies', () => {
    const relic = RelicManager.createRelic('thunderstone_charm');
    expect(relic.relicProc).toBe('THUNDER_STRIKE');

    const equipment = { RING: relic };
    expect(RelicManager.hasRelic(equipment as any, 'THUNDER_STRIKE' as any)).toBe(true);
  });

  it('populates merchant shop with items, relics, and allows purchases', () => {
    const shop = new ShopManager(2);
    const stock = shop.getStock();
    expect(stock.length).toBeGreaterThanOrEqual(4);

    const firstItem = stock[0];
    const buyResult = shop.buyItem(firstItem.id, 999);
    expect(buyResult.success).toBe(true);
    expect(buyResult.item).toBeDefined();
  });

  it('applies procedural magic weapon/armor affixes', () => {
    const sword = LootManager.createItem('iron_broadsword');
    const enchanted = AffixGenerator.applyRandomAffix(sword, 3);
    expect(enchanted.name).toBeTruthy();
    expect(enchanted.value).toBeGreaterThanOrEqual(sword.value);
  });
});
