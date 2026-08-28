import { Item } from '../types';
import { LootManager } from '../items/LootManager';
import { RelicManager, RELIC_CATALOG } from '../relics/RelicManager';
import { AffixGenerator } from '../items/AffixGenerator';

export interface ShopItemEntry {
  id: string;
  item: Item;
  price: number;
  purchased: boolean;
  isStatUpgrade?: boolean;
  statUpgradeType?: 'STR' | 'DEF' | 'ARC' | 'HP';
}

export class ShopManager {
  private stock: ShopItemEntry[] = [];
  public depth: number;

  constructor(depth: number = 2) {
    this.depth = depth;
    this.restock();
  }

  public restock(): void {
    this.stock = [];

    // 1. Two Equipment Items with Affixes
    for (let i = 0; i < 2; i++) {
      let gear = LootManager.rollLoot(this.depth + 1);
      gear = AffixGenerator.applyRandomAffix(gear, this.depth);
      const price = Math.max(25, Math.floor(gear.value * 1.3));
      this.stock.push({
        id: `shop_gear_${i}_${Math.random().toString(36).substring(2, 7)}`,
        item: gear,
        price,
        purchased: false
      });
    }

    // 2. Two Potions / Scrolls
    const consumables = ['health_potion', 'mana_potion', 'swift_potion', 'scroll_fireball', 'scroll_teleport', 'scroll_enchant'];
    for (let i = 0; i < 2; i++) {
      const randKey = consumables[Math.floor(Math.random() * consumables.length)];
      const item = LootManager.createItem(randKey);
      this.stock.push({
        id: `shop_cons_${i}_${Math.random().toString(36).substring(2, 7)}`,
        item,
        price: Math.max(15, Math.floor(item.value * 1.1)),
        purchased: false
      });
    }

    // 3. One Relic
    const relicKeys = Object.keys(RELIC_CATALOG);
    const selectedRelicKey = relicKeys[Math.floor(Math.random() * relicKeys.length)];
    const relic = RelicManager.createRelic(selectedRelicKey);
    this.stock.push({
      id: `shop_relic_${Math.random().toString(36).substring(2, 7)}`,
      item: relic,
      price: Math.max(80, Math.floor(relic.value * 1.2)),
      purchased: false
    });

    // 4. Mystery Gacha Chest
    const mysteryItem: Item = {
      id: `mystery_chest_${Math.random().toString(36).substring(2, 7)}`,
      name: "Grimm's Mystery Relic Box",
      description: 'A sealed ancient lockbox containing a random enchanted treasure (High chance of Epic/Legendary)!',
      type: 'RELIC' as any,
      rarity: 'EPIC' as any,
      char: '🎁',
      color: '#f59e0b',
      value: 65
    };
    this.stock.push({
      id: 'mystery_chest_entry',
      item: mysteryItem,
      price: 65,
      purchased: false
    });

    // 5. Permanent Stat Elixir
    const statTypes: ('STR' | 'DEF' | 'ARC' | 'HP')[] = ['STR', 'DEF', 'ARC', 'HP'];
    const chosenStat = statTypes[Math.floor(Math.random() * statTypes.length)];
    const statNames: Record<string, string> = {
      STR: 'Elixir of Colossal Strength (+3 STR)',
      DEF: 'Elixir of Adamantine Skin (+2 DEF)',
      ARC: 'Elixir of Astral Clarity (+3 ARC)',
      HP: 'Elixir of Titanic Vitality (+25 Max HP)'
    };
    const statItem: Item = {
      id: `stat_elixir_${chosenStat}`,
      name: statNames[chosenStat],
      description: 'Permanently increases core character attributes when consumed.',
      type: 'POTION' as any,
      rarity: 'RARE' as any,
      char: '🧪',
      color: '#10b981',
      value: 75
    };
    this.stock.push({
      id: `stat_elixir_entry_${chosenStat}`,
      item: statItem,
      price: 75,
      purchased: false,
      isStatUpgrade: true,
      statUpgradeType: chosenStat
    });
  }

  public getStock(): ShopItemEntry[] {
    return this.stock;
  }

  public buyItem(entryId: string, playerGold: number): { success: boolean; item?: Item; cost?: number; error?: string } {
    const entry = this.stock.find((s) => s.id === entryId);
    if (!entry) return { success: false, error: 'Item not found in shop stock' };
    if (entry.purchased) return { success: false, error: 'Item already purchased' };
    if (playerGold < entry.price) return { success: false, error: 'Not enough gold!' };

    entry.purchased = true;

    // If mystery chest, roll real loot
    if (entry.id === 'mystery_chest_entry') {
      let rolledItem = LootManager.rollLoot(this.depth + 2);
      rolledItem = AffixGenerator.applyRandomAffix(rolledItem, this.depth + 1);
      return { success: true, item: rolledItem, cost: entry.price };
    }

    return { success: true, item: entry.item, cost: entry.price };
  }

  public getSellValue(item: Item): number {
    return Math.max(2, Math.floor(item.value * 0.45));
  }
}
