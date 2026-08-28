import { Item, ItemType, ItemRarity, EquipSlot, StatusEffectType } from '../types';

export const ITEM_CATALOG: Record<string, Omit<Item, 'id'>> = {
  // --- WEAPONS ---
  rusty_dagger: {
    name: 'Rusty Dagger',
    description: 'A notched iron blade. Quick, with higher critical chance.',
    type: ItemType.WEAPON,
    rarity: ItemRarity.COMMON,
    char: '/',
    color: '#94a3b8',
    equipSlot: EquipSlot.MAIN_HAND,
    value: 10,
    attackPower: 3,
    critBonus: 0.15
  },
  iron_broadsword: {
    name: 'Iron Broadsword',
    description: 'A solid forged crypt-cleaver.',
    type: ItemType.WEAPON,
    rarity: ItemRarity.COMMON,
    char: '/',
    color: '#cbd5e1',
    equipSlot: EquipSlot.MAIN_HAND,
    value: 25,
    attackPower: 6,
    critBonus: 0.05
  },
  heavy_warhammer: {
    name: 'Heavy Warhammer',
    description: 'Crushes heavy armor and skeletal bones with devastating force.',
    type: ItemType.WEAPON,
    rarity: ItemRarity.RARE,
    char: '/',
    color: '#38bdf8',
    equipSlot: EquipSlot.MAIN_HAND,
    value: 60,
    attackPower: 11,
    critBonus: 0.08
  },
  necromancer_staff: {
    name: "Necromancer's Bone Staff",
    description: 'Channels necrotic sorcery, empowering spells and regenerating mana.',
    type: ItemType.WEAPON,
    rarity: ItemRarity.EPIC,
    char: '/',
    color: '#a855f7',
    equipSlot: EquipSlot.MAIN_HAND,
    value: 120,
    attackPower: 8,
    magicPower: 12,
    critBonus: 0.1
  },
  sunblade_of_dawn: {
    name: 'Sunblade of Dawn',
    description: 'Radiates celestial holy fire that incinerates undead fiends.',
    type: ItemType.WEAPON,
    rarity: ItemRarity.LEGENDARY,
    char: '/',
    color: '#f59e0b',
    equipSlot: EquipSlot.MAIN_HAND,
    value: 300,
    attackPower: 18,
    magicPower: 15,
    critBonus: 0.2
  },

  // --- ARMOR ---
  leather_tunic: {
    name: 'Padded Leather Tunic',
    description: 'Light protection that allows swift evasive maneuvers.',
    type: ItemType.ARMOR,
    rarity: ItemRarity.COMMON,
    char: '[',
    color: '#b45309',
    equipSlot: EquipSlot.BODY,
    value: 15,
    defense: 4
  },
  chainmail_hauberk: {
    name: 'Chainmail Hauberk',
    description: 'Interlocked steel rings offering dependable protection.',
    type: ItemType.ARMOR,
    rarity: ItemRarity.RARE,
    char: '[',
    color: '#38bdf8',
    equipSlot: EquipSlot.BODY,
    value: 50,
    defense: 10
  },
  necrotic_shroud: {
    name: 'Necrotic Shroud',
    description: 'Woven from ghost silk. Protects against curses and amplifies magic.',
    type: ItemType.ARMOR,
    rarity: ItemRarity.EPIC,
    char: '[',
    color: '#a855f7',
    equipSlot: EquipSlot.BODY,
    value: 140,
    defense: 8,
    magicPower: 8
  },
  aegis_plate: {
    name: 'Aegis Dreadplate',
    description: 'Impervious dark steel armor that turns aside deadly blows.',
    type: ItemType.ARMOR,
    rarity: ItemRarity.LEGENDARY,
    char: '[',
    color: '#f59e0b',
    equipSlot: EquipSlot.BODY,
    value: 350,
    defense: 22
  },

  // --- SHIELDS & HELMETS ---
  wooden_buckler: {
    name: 'Wooden Buckler',
    description: 'A modest round shield.',
    type: ItemType.SHIELD,
    rarity: ItemRarity.COMMON,
    char: ')',
    color: '#78350f',
    equipSlot: EquipSlot.OFF_HAND,
    value: 15,
    defense: 3
  },
  tower_shield: {
    name: 'Iron Tower Shield',
    description: 'Heavy reinforcement that absorbs brutal impacts.',
    type: ItemType.SHIELD,
    rarity: ItemRarity.RARE,
    char: ')',
    color: '#38bdf8',
    equipSlot: EquipSlot.OFF_HAND,
    value: 55,
    defense: 8
  },
  iron_helm: {
    name: 'Iron Bascinet',
    description: 'Guards the skull from stray arrows and concussive strikes.',
    type: ItemType.HELMET,
    rarity: ItemRarity.COMMON,
    char: '^',
    color: '#94a3b8',
    equipSlot: EquipSlot.HEAD,
    value: 20,
    defense: 3
  },

  // --- ACCESSORIES ---
  ring_of_vitality: {
    name: 'Ring of Vitality',
    description: 'Pulses with life-force, increasing maximum health by 25.',
    type: ItemType.RING,
    rarity: ItemRarity.RARE,
    char: '=',
    color: '#ef4444',
    equipSlot: EquipSlot.RING,
    value: 75,
    defense: 2
  },
  ring_of_shadows: {
    name: 'Ring of the Shadow Stalker',
    description: 'Bends dungeon darkness, increasing vision radius and stealth.',
    type: ItemType.RING,
    rarity: ItemRarity.EPIC,
    char: '=',
    color: '#a855f7',
    equipSlot: EquipSlot.RING,
    value: 130,
    critBonus: 0.15
  },
  amulet_of_life: {
    name: 'Amulet of the Undying Phoenix',
    description: 'Shatters upon fatal damage to restore the bearer to full health.',
    type: ItemType.AMULET,
    rarity: ItemRarity.LEGENDARY,
    char: '"',
    color: '#f59e0b',
    equipSlot: EquipSlot.AMULET,
    value: 400,
    defense: 5
  },

  // --- POTIONS ---
  health_potion: {
    name: 'Potion of Greater Healing',
    description: 'Restores 40 Health Points instantly.',
    type: ItemType.POTION,
    rarity: ItemRarity.COMMON,
    char: '!',
    color: '#ef4444',
    value: 20,
    healAmount: 40
  },
  mana_potion: {
    name: 'Mana Elixir',
    description: 'Restores 35 Mana Points instantly.',
    type: ItemType.POTION,
    rarity: ItemRarity.COMMON,
    char: '!',
    color: '#3b82f6',
    value: 20,
    manaAmount: 35
  },
  swift_potion: {
    name: 'Potion of Swiftness',
    description: 'Grants extreme Agility and double movement speed for 15 turns.',
    type: ItemType.POTION,
    rarity: ItemRarity.RARE,
    char: '!',
    color: '#10b981',
    value: 45,
    effectType: StatusEffectType.SWIFT,
    effectDuration: 15,
    effectPower: 2
  },
  invis_potion: {
    name: 'Potion of Invisibility',
    description: 'Cloaks the drinker from enemy sight for 10 turns.',
    type: ItemType.POTION,
    rarity: ItemRarity.EPIC,
    char: '!',
    color: '#c084fc',
    value: 80,
    effectType: StatusEffectType.INVISIBLE,
    effectDuration: 10,
    effectPower: 1
  },

  // --- SCROLLS ---
  scroll_fireball: {
    name: 'Scroll of Fireball',
    description: 'Conjures a roaring blast of flame in an area, dealing 30 damage to all foes.',
    type: ItemType.SCROLL,
    rarity: ItemRarity.COMMON,
    char: '?',
    color: '#f97316',
    value: 30,
    effectPower: 30,
    aoeRadius: 2,
    range: 7
  },
  scroll_holy_light: {
    name: 'Scroll of Holy Light',
    description: 'Purges the room with radiant energy, dealing 25 damage to all visible monsters and healing the player for 20.',
    type: ItemType.SCROLL,
    rarity: ItemRarity.RARE,
    char: '?',
    color: '#fbbf24',
    value: 50,
    effectPower: 25,
    healAmount: 20
  },
  scroll_teleport: {
    name: 'Scroll of Teleportation',
    description: 'Instantly teleports you to a random safe explored room.',
    type: ItemType.SCROLL,
    rarity: ItemRarity.COMMON,
    char: '?',
    color: '#06b6d4',
    value: 25
  },
  scroll_magic_mapping: {
    name: 'Scroll of Magic Mapping',
    description: 'Magically charts the entire floor layout in your memory.',
    type: ItemType.SCROLL,
    rarity: ItemRarity.RARE,
    char: '?',
    color: '#38bdf8',
    value: 40
  },
  scroll_enchant: {
    name: 'Scroll of Enchantment',
    description: 'Permanently increases your equipped weapon attack power by +3.',
    type: ItemType.SCROLL,
    rarity: ItemRarity.EPIC,
    char: '?',
    color: '#ec4899',
    value: 100,
    effectPower: 3
  }
};
