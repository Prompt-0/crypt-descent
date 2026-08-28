import { Item, ItemType, ItemRarity, EquipSlot, RelicProcType } from '../types';

export const RELIC_CATALOG: Record<string, Omit<Item, 'id'>> = {
  thunderstone_charm: {
    name: 'Thunderstone Charm',
    description: 'Arcs high-voltage chain lightning to 3 nearby enemies every 3rd melee strike.',
    type: ItemType.RELIC,
    rarity: ItemRarity.EPIC,
    char: 'Z',
    color: '#38bdf8',
    equipSlot: EquipSlot.RING,
    value: 120,
    relicProc: RelicProcType.THUNDER_STRIKE
  },
  vampire_fang: {
    name: 'Vampire Lord Fang',
    description: 'Critical hits siphon life-essence, restoring 25% of damage dealt as Health.',
    type: ItemType.RELIC,
    rarity: ItemRarity.RARE,
    char: 'V',
    color: '#ef4444',
    equipSlot: EquipSlot.AMULET,
    value: 100,
    relicProc: RelicProcType.VAMPIRE_FANG
  },
  phylactery_of_souls: {
    name: "Necromancer's Phylactery",
    description: 'Slain monsters have a 30% chance to resurrect as friendly Skeleton allies fighting for you!',
    type: ItemType.RELIC,
    rarity: ItemRarity.LEGENDARY,
    char: 'P',
    color: '#c084fc',
    equipSlot: EquipSlot.AMULET,
    value: 250,
    relicProc: RelicProcType.NECRO_MINION
  },
  frostbite_band: {
    name: 'Glacial Frostbite Band',
    description: 'Melee and spell strikes have a 25% chance to deep-freeze enemies for 2 turns.',
    type: ItemType.RELIC,
    rarity: ItemRarity.RARE,
    char: 'F',
    color: '#06b6d4',
    equipSlot: EquipSlot.RING,
    value: 90,
    relicProc: RelicProcType.FROST_TOUCH
  },
  molten_core: {
    name: 'Heart of the Molten Core',
    description: 'Infuses all attacks with +6 Fire damage and ignites targets in flames.',
    type: ItemType.RELIC,
    rarity: ItemRarity.EPIC,
    char: 'M',
    color: '#f97316',
    equipSlot: EquipSlot.RING,
    value: 135,
    attackPower: 4,
    relicProc: RelicProcType.MOLTEN_CORE
  },
  aegis_dreadstone: {
    name: 'Aegis Dreadstone',
    description: 'Reflects 30% of all incoming melee and ranged damage back at the attacker.',
    type: ItemType.RELIC,
    rarity: ItemRarity.EPIC,
    char: 'A',
    color: '#fbbf24',
    equipSlot: EquipSlot.OFF_HAND,
    defense: 6,
    value: 150,
    relicProc: RelicProcType.AEGIS_THORNS
  }
};

export class RelicManager {
  private static attackCounter: number = 0;

  public static createRelic(key: string): Item {
    const template = RELIC_CATALOG[key];
    if (!template) throw new Error(`Relic template not found: ${key}`);
    return {
      ...template,
      id: `relic_${key}_${Math.random().toString(36).substring(2, 9)}`
    };
  }

  public static hasRelic(entityEquipment: Record<string, Item | undefined>, proc: RelicProcType): boolean {
    return Object.values(entityEquipment).some((item) => item?.relicProc === proc);
  }

  public static incrementAttackCounter(): number {
    this.attackCounter++;
    return this.attackCounter;
  }
}
