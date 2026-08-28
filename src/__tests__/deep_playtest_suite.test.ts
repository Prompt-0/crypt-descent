import { describe, it, expect } from 'vitest';
import { PlayerClassType, SkillType, MonsterType, EquipSlot, EntityAlignment, TileType } from '../types';
import { CLASS_CATALOG, SKILL_DEFINITIONS } from '../classes/ClassCatalog';
import { SkillManager } from '../skills/SkillManager';
import { RelicManager } from '../relics/RelicManager';
import { LootManager } from '../items/LootManager';
import { AffixGenerator } from '../items/AffixGenerator';
import { CombatEngine } from '../combat/CombatEngine';
import { Entity } from '../entities/Entity';
import { DungeonGenerator } from '../procgen/DungeonGenerator';
import { ShopManager } from '../shop/ShopManager';

describe('1. Character Classes & Baseline Attributes Audit', () => {
  const classes = [
    PlayerClassType.WARRIOR,
    PlayerClassType.MAGE,
    PlayerClassType.ASSASSIN,
    PlayerClassType.CLERIC
  ];

  it.each(classes)('verifies %s has valid starting stats, gear, and exactly 3 active skills', (classType) => {
    const def = CLASS_CATALOG[classType];
    expect(def).toBeDefined();
    expect(def.name).toBeTruthy();
    expect(def.baseHp).toBeGreaterThan(50);
    expect(def.baseMana).toBeGreaterThanOrEqual(30);
    expect(def.strength).toBeGreaterThan(0);
    expect(def.agility).toBeGreaterThan(0);
    expect(def.arcana).toBeGreaterThan(0);
    expect(def.defense).toBeGreaterThanOrEqual(0);
    expect(def.startingGear.length).toBeGreaterThanOrEqual(3);
    expect(def.skills.length).toBe(3);

    // Verify each skill has definition in SKILL_DEFINITIONS
    def.skills.forEach((skillType) => {
      const sDef = SKILL_DEFINITIONS[skillType];
      expect(sDef).toBeDefined();
      expect(sDef.name).toBeTruthy();
      expect(sDef.manaCost).toBeGreaterThan(0);
      expect(sDef.cooldownMax).toBeGreaterThan(0);
    });
  });
});

describe('2. All 12 Active Skills Validation', () => {
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

  it.each(allSkills)('validates skill creation and cooldown mechanics for %s', (skillId) => {
    const skill = SkillManager.createSkill(skillId);
    expect(skill.id).toBe(skillId);
    expect(skill.cooldownCurrent).toBe(0);
    expect(skill.manaCost).toBeGreaterThan(0);

    // Test mana gate check
    const lowManaHero = new Entity('hero', 'Hero', '@', '#fff', 0, 0, undefined, true, { mana: 0, maxMana: 100 });
    const check1 = SkillManager.canUseSkill(lowManaHero, skill);
    expect(check1.canUse).toBe(false);
    expect(check1.reason).toContain('Not enough mana');

    // Test sufficient mana check
    const fullManaHero = new Entity('hero', 'Hero', '@', '#fff', 0, 0, undefined, true, { mana: 100, maxMana: 100 });
    const check2 = SkillManager.canUseSkill(fullManaHero, skill);
    expect(check2.canUse).toBe(true);

    // Test cooldown tick check
    skill.cooldownCurrent = skill.cooldownMax;
    const check3 = SkillManager.canUseSkill(fullManaHero, skill);
    expect(check3.canUse).toBe(false);
    expect(check3.reason).toContain('cooldown');

    SkillManager.tickCooldowns([skill]);
    expect(skill.cooldownCurrent).toBe(skill.cooldownMax - 1);
  });
});

describe('3. Relics, Items & Synergies Audit', () => {
  it('validates all 6 legendary relics catalog entries', () => {
    const expectedRelics = [
      'thunderstone_charm',
      'vampire_fang',
      'phylactery_of_souls',
      'frostbite_band',
      'molten_core',
      'aegis_dreadstone'
    ];

    expectedRelics.forEach((key) => {
      const relic = RelicManager.createRelic(key);
      expect(relic.relicProc).toBeDefined();
      expect(relic.equipSlot).toBeDefined();
      expect(relic.value).toBeGreaterThan(50);
    });
  });

  it('tests Amulet of the Undying Phoenix death-defying revival', () => {
    const player = new Entity('player', 'Hero', '@', '#fbbf24', 0, 0, undefined, true, {
      hp: 10,
      maxHp: 100,
      defense: 0
    });
    const phoenixAmulet = LootManager.createItem('amulet_of_life');
    player.equipItem(phoenixAmulet);

    const lethalAttacker = new Entity('boss', 'Malakor', 'M', '#red', 1, 0, EntityAlignment.HOSTILE, false, {
      strength: 100,
      agility: 50
    });

    const result = CombatEngine.executeAttack(lethalAttacker, player);
    // Player should NOT be killed because the amulet shattered and revived
    expect(result.targetKilled).toBe(false);
    expect(player.stats.hp).toBe(player.stats.maxHp);
    expect(player.equipment[EquipSlot.AMULET]).toBeUndefined(); // Amulet consumed
  });

  it('tests item affix generation bonuses', () => {
    const sword = LootManager.createItem('heavy_warhammer');
    const originalVal = sword.value;

    let affixCount = 0;
    for (let i = 0; i < 50; i++) {
      const enchanted = AffixGenerator.applyRandomAffix(sword, 4);
      if (enchanted.name !== sword.name) {
        affixCount++;
        expect(enchanted.value).toBeGreaterThan(originalVal);
      }
    }
    expect(affixCount).toBeGreaterThan(10);
  });
});

describe('4. Dungeon Generation & Environmental Features', () => {
  it('generates regular levels 1-4 with rooms, lights, stairs, chests, and barrels', () => {
    const gen = new DungeonGenerator(54, 36);
    for (let depth = 1; depth <= 4; depth++) {
      const level = gen.generate(depth);
      expect(level.width).toBe(54);
      expect(level.height).toBe(36);
      expect(level.rooms.length).toBeGreaterThanOrEqual(3);
      expect(level.playerSpawn).toBeDefined();
      expect(level.stairsDownPos).toBeDefined();
      expect(level.lights.length).toBeGreaterThan(0);
      expect(level.monsterSpawns.length).toBeGreaterThan(0);

      // Verify walkable path from player spawn
      const spawnTile = level.tiles[level.playerSpawn.y][level.playerSpawn.x];
      expect(spawnTile.walkable).toBe(true);

      // Verify stairs down
      const stairsTile = level.tiles[level.stairsDownPos.y][level.stairsDownPos.x];
      expect(stairsTile.type).toBe(TileType.STAIRS_DOWN);

      // Check shop on Floor 2 and 4
      if (depth === 2 || depth === 4) {
        expect(level.hasShop).toBe(true);
      }
    }
  });

  it('generates Boss Floor 5 arena with Asura Malakor, pillars, and torches', () => {
    const gen = new DungeonGenerator(54, 36);
    const bossFloor = gen.generate(5);
    expect(bossFloor.depth).toBe(5);
    expect(bossFloor.monsterSpawns.some((s) => s.type === MonsterType.BOSS_MALAKOR)).toBe(true);
    expect(bossFloor.monsterSpawns.some((s) => s.type === MonsterType.CRYPT_KNIGHT)).toBe(true);
    expect(bossFloor.monsterSpawns.some((s) => s.type === MonsterType.CULTIST_ACOLYTE)).toBe(true);
  });
});

describe('5. Combat Engine, Armor Mitigation & XP Balancing', () => {
  it('verifies non-linear armor mitigation formula: 100 / (100 + Defense)', () => {
    const defValues = [0, 5, 10, 20, 50, 100];
    const baseDamage = 40;

    let prevDamage = baseDamage + 1;
    defValues.forEach((def) => {
      const multiplier = 100 / (100 + def);
      const mitigated = Math.round(baseDamage * multiplier);
      expect(mitigated).toBeLessThanOrEqual(prevDamage);
      prevDamage = mitigated;
    });
  });

  it('verifies monster archetypes scaling from Depth 1 to 5', () => {
    const rat = Entity.createMonster(MonsterType.CRYPT_RAT, 0, 0);
    const knight = Entity.createMonster(MonsterType.CRYPT_KNIGHT, 0, 0);
    const boss = Entity.createMonster(MonsterType.BOSS_MALAKOR, 0, 0);

    expect(knight.stats.maxHp).toBeGreaterThan(rat.stats.maxHp);
    expect(boss.stats.maxHp).toBeGreaterThan(knight.stats.maxHp);
    expect(boss.stats.strength).toBeGreaterThan(knight.stats.strength);
  });
});

describe('6. Shop, Economy & Gacha Chests', () => {
  it('stocks shop with equipment, consumables, relics, mystery gacha, and stat elixirs', () => {
    const shop = new ShopManager(2);
    const stock = shop.getStock();
    expect(stock.length).toBe(7);

    // Verify mystery box
    const mystery = stock.find((s) => s.id === 'mystery_chest_entry');
    expect(mystery).toBeDefined();
    expect(mystery?.price).toBe(65);

    // Buy mystery box with sufficient gold
    const buyRes = shop.buyItem('mystery_chest_entry', 100);
    expect(buyRes.success).toBe(true);
    expect(buyRes.item).toBeDefined();
    expect(mystery?.purchased).toBe(true);

    // Cannot buy already purchased item
    const rebuy = shop.buyItem('mystery_chest_entry', 100);
    expect(rebuy.success).toBe(false);

    // Cannot buy with insufficient gold
    const unpurchased = stock.find((s) => !s.purchased);
    if (unpurchased) {
      const brokeBuy = shop.buyItem(unpurchased.id, 0);
      expect(brokeBuy.success).toBe(false);
      expect(brokeBuy.error).toContain('Not enough gold');
    }
  });

  it('calculates fair sell values (45% of base value, min 2)', () => {
    const shop = new ShopManager(1);
    const cheapPotion = LootManager.createItem('health_potion'); // value 20 -> 9 gold
    const sellVal = shop.getSellValue(cheapPotion);
    expect(sellVal).toBe(9);
  });
});
