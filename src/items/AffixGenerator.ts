import { Item, ItemRarity, ItemAffix } from '../types';

export const PREFIXES: { name: string; rarity: ItemRarity; power: number; bonus: Partial<ItemAffix> }[] = [
  { name: 'Flaming', rarity: ItemRarity.RARE, power: 15, bonus: { elementalBonus: 'FIRE', elementalDamage: 5 } },
  { name: 'Glacial', rarity: ItemRarity.RARE, power: 15, bonus: { elementalBonus: 'FROST', elementalDamage: 4 } },
  { name: 'Thunderous', rarity: ItemRarity.EPIC, power: 25, bonus: { elementalBonus: 'LIGHTNING', elementalDamage: 7 } },
  { name: 'Vorpal', rarity: ItemRarity.EPIC, power: 30, bonus: { statBonus: { agility: 4 } } },
  { name: 'Vampiric', rarity: ItemRarity.EPIC, power: 35, bonus: { lifesteal: 0.15 } },
  { name: 'Stalwart', rarity: ItemRarity.RARE, power: 18, bonus: { statBonus: { defense: 3 } } },
  { name: 'Celestial', rarity: ItemRarity.LEGENDARY, power: 60, bonus: { elementalBonus: 'HOLY', elementalDamage: 10 } }
];

export const SUFFIXES: { name: string; rarity: ItemRarity; power: number; bonus: Partial<ItemAffix> }[] = [
  { name: 'of the Titan', rarity: ItemRarity.RARE, power: 20, bonus: { statBonus: { strength: 4, hp: 15, maxHp: 15 } } },
  { name: 'of Swiftness', rarity: ItemRarity.RARE, power: 15, bonus: { statBonus: { agility: 3 } } },
  { name: 'of the Archmage', rarity: ItemRarity.EPIC, power: 30, bonus: { statBonus: { arcana: 5, mana: 20, maxMana: 20 } } },
  { name: 'of Thorns', rarity: ItemRarity.RARE, power: 18, bonus: { statBonus: { defense: 2 } } },
  { name: 'of the Phoenix', rarity: ItemRarity.LEGENDARY, power: 75, bonus: { statBonus: { hp: 30, maxHp: 30 } } }
];

export class AffixGenerator {
  public static applyRandomAffix(item: Item, dungeonDepth: number = 1): Item {
    if (item.type !== 'WEAPON' && item.type !== 'ARMOR' && item.type !== 'SHIELD') {
      return item;
    }

    const affixRoll = Math.random();
    const chance = 0.25 + dungeonDepth * 0.08;
    if (affixRoll > chance) return item;

    const hasPrefix = Math.random() < 0.6;
    const pool = hasPrefix ? PREFIXES : SUFFIXES;
    const selected = pool[Math.floor(Math.random() * pool.length)];

    const newName = hasPrefix ? `${selected.name} ${item.name}` : `${item.name} ${selected.name}`;
    const newColor = selected.rarity === ItemRarity.LEGENDARY ? '#f59e0b' : selected.rarity === ItemRarity.EPIC ? '#a855f7' : '#38bdf8';

    const enhancedItem: Item = {
      ...item,
      name: newName,
      color: newColor,
      value: item.value + selected.power,
      rarity: selected.rarity
    };

    if (selected.bonus.elementalDamage && enhancedItem.attackPower) {
      enhancedItem.attackPower += selected.bonus.elementalDamage;
    }
    if (selected.bonus.statBonus?.defense && enhancedItem.defense) {
      enhancedItem.defense += selected.bonus.statBonus.defense;
    }

    return enhancedItem;
  }
}
