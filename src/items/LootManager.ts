import { Item, ItemRarity } from '../types';
import { ITEM_CATALOG } from './ItemCatalog';

export class LootManager {
  private static pityCounter: number = 0;

  public static createItem(key: string): Item {
    const template = ITEM_CATALOG[key];
    if (!template) {
      throw new Error(`Item template not found for key: ${key}`);
    }
    return {
      ...template,
      id: `${key}_${Math.random().toString(36).substring(2, 9)}`
    };
  }

  public static rollLoot(dungeonDepth: number = 1): Item {
    this.pityCounter++;

    // Tier chances scaling with dungeon depth and pity
    let epicChance = 0.05 + dungeonDepth * 0.03 + (this.pityCounter > 10 ? 0.2 : 0);
    let rareChance = 0.2 + dungeonDepth * 0.06;
    let legendaryChance = dungeonDepth >= 3 ? 0.02 + dungeonDepth * 0.02 : 0;

    const roll = Math.random();
    let targetRarity = ItemRarity.COMMON;

    if (roll < legendaryChance) {
      targetRarity = ItemRarity.LEGENDARY;
      this.pityCounter = 0;
    } else if (roll < legendaryChance + epicChance) {
      targetRarity = ItemRarity.EPIC;
      this.pityCounter = 0;
    } else if (roll < legendaryChance + epicChance + rareChance) {
      targetRarity = ItemRarity.RARE;
    }

    const eligibleKeys = Object.keys(ITEM_CATALOG).filter((k) => ITEM_CATALOG[k].rarity === targetRarity);
    const selectedKey = eligibleKeys.length > 0
      ? eligibleKeys[Math.floor(Math.random() * eligibleKeys.length)]
      : 'health_potion';

    return this.createItem(selectedKey);
  }

  public static rollChestLoot(dungeonDepth: number): Item[] {
    const items: Item[] = [];
    const count = Math.random() < 0.3 ? 2 : 1;
    for (let i = 0; i < count; i++) {
      items.push(this.rollLoot(dungeonDepth + 1));
    }
    return items;
  }
}
