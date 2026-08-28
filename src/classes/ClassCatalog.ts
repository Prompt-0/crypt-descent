import { PlayerClassType, ClassDefinition, SkillType, Skill } from '../types';

export const SKILL_DEFINITIONS: Record<SkillType, Omit<Skill, 'cooldownCurrent'>> = {
  // Warrior Skills
  [SkillType.WHIRLWIND]: {
    id: SkillType.WHIRLWIND,
    name: 'Whirlwind Strike',
    description: 'Spin with devastating force, striking all 8 adjacent tiles for 140% weapon damage.',
    icon: '🌪️',
    manaCost: 15,
    cooldownMax: 4,
    aoeRadius: 1.5,
    requiresTarget: false,
    color: '#f97316'
  },
  [SkillType.SHIELD_SLAM]: {
    id: SkillType.SHIELD_SLAM,
    name: 'Shield Slam',
    description: 'Bash an adjacent foe with your shield, dealing damage and stunning them for 2 turns.',
    icon: '🛡️',
    manaCost: 10,
    cooldownMax: 3,
    range: 1.5,
    requiresTarget: true,
    color: '#38bdf8'
  },
  [SkillType.BERSERK_RAGE]: {
    id: SkillType.BERSERK_RAGE,
    name: 'Berserker Rage',
    description: 'Enter a battle frenzy for 6 turns, gaining +8 Attack Power and +50% Crit Chance.',
    icon: '🩸',
    manaCost: 20,
    cooldownMax: 8,
    requiresTarget: false,
    color: '#ef4444'
  },

  // Mage Skills
  [SkillType.FIREBOLT]: {
    id: SkillType.FIREBOLT,
    name: 'Firebolt Ray',
    description: 'Hurl a piercing bolt of arcane flame up to 7 tiles away, dealing 28 Fire damage.',
    icon: '🔥',
    manaCost: 12,
    cooldownMax: 2,
    range: 7,
    requiresTarget: true,
    color: '#f97316'
  },
  [SkillType.FROST_NOVA]: {
    id: SkillType.FROST_NOVA,
    name: 'Frost Nova',
    description: 'Erupt an icy ring in a 2-tile radius around you, dealing 20 Frost damage and freezing all enemies for 2 turns.',
    icon: '❄️',
    manaCost: 22,
    cooldownMax: 5,
    aoeRadius: 2.5,
    requiresTarget: false,
    color: '#06b6d4'
  },
  [SkillType.BLINK]: {
    id: SkillType.BLINK,
    name: 'Arcane Blink',
    description: 'Instantly teleport to any visible explored tile within 5 range.',
    icon: '✨',
    manaCost: 18,
    cooldownMax: 6,
    range: 5,
    requiresTarget: true,
    color: '#a855f7'
  },

  // Assassin Skills
  [SkillType.SHADOW_STEP]: {
    id: SkillType.SHADOW_STEP,
    name: 'Shadow Step',
    description: 'Teleport adjacent to an enemy from up to 5 tiles away and strike with a guaranteed Critical Hit.',
    icon: '🗡️',
    manaCost: 16,
    cooldownMax: 4,
    range: 5,
    requiresTarget: true,
    color: '#c084fc'
  },
  [SkillType.SMOKE_BOMB]: {
    id: SkillType.SMOKE_BOMB,
    name: 'Smoke Bomb',
    description: 'Vanish into darkness, gaining Invisibility and +50% Movement Speed for 6 turns.',
    icon: '💨',
    manaCost: 14,
    cooldownMax: 7,
    requiresTarget: false,
    color: '#94a3b8'
  },
  [SkillType.FAN_OF_KNIVES]: {
    id: SkillType.FAN_OF_KNIVES,
    name: 'Fan of Knives',
    description: 'Throw poison-tipped daggers in a 3-tile radius, applying Poison to all foes.',
    icon: '🔪',
    manaCost: 18,
    cooldownMax: 5,
    aoeRadius: 3.5,
    requiresTarget: false,
    color: '#10b981'
  },

  // Cleric Skills
  [SkillType.HOLY_SMITE]: {
    id: SkillType.HOLY_SMITE,
    name: 'Smite Undead',
    description: 'Call down celestial holy pillar on a target within 6 tiles, dealing 35 Holy damage (double to Undead).',
    icon: '⚡',
    manaCost: 16,
    cooldownMax: 3,
    range: 6,
    requiresTarget: true,
    color: '#fbbf24'
  },
  [SkillType.DIVINE_HEAL]: {
    id: SkillType.DIVINE_HEAL,
    name: 'Divine Grace',
    description: 'Channel divine power to restore 50 Health and cleanse all negative status effects.',
    icon: '🕊️',
    manaCost: 20,
    cooldownMax: 6,
    requiresTarget: false,
    color: '#34d399'
  },
  [SkillType.PURIFYING_AURA]: {
    id: SkillType.PURIFYING_AURA,
    name: 'Sanctified Aura',
    description: 'Surround yourself with holy radiance, gaining +6 Armor and burning nearby undead for 4 turns.',
    icon: '🌟',
    manaCost: 25,
    cooldownMax: 8,
    requiresTarget: false,
    color: '#fde047'
  }
};

export const CLASS_CATALOG: Record<PlayerClassType, ClassDefinition> = {
  [PlayerClassType.WARRIOR]: {
    type: PlayerClassType.WARRIOR,
    name: 'Ironclad Warrior',
    tagline: 'Master of steel, defense, and brutal close-quarters cleaves.',
    description: 'High HP pool, heavy armor mitigation, and crowd-clearing whirlwind attacks.',
    icon: '🛡️',
    color: '#38bdf8',
    baseHp: 125,
    baseMana: 35,
    strength: 15,
    agility: 9,
    arcana: 6,
    defense: 6,
    startingGear: ['iron_broadsword', 'chainmail_hauberk', 'tower_shield', 'health_potion'],
    skills: [SkillType.WHIRLWIND, SkillType.SHIELD_SLAM, SkillType.BERSERK_RAGE]
  },
  [PlayerClassType.MAGE]: {
    type: PlayerClassType.MAGE,
    name: 'Arcane Pyromancer',
    tagline: 'Wielder of elemental fire, chilling frost, and space-warping blinks.',
    description: 'Massive mana pool, devastating ranged spell attacks, and crowd-control freezing waves.',
    icon: '🔥',
    color: '#f97316',
    baseHp: 80,
    baseMana: 90,
    strength: 7,
    agility: 11,
    arcana: 18,
    defense: 2,
    startingGear: ['necromancer_staff', 'necrotic_shroud', 'mana_potion', 'scroll_fireball'],
    skills: [SkillType.FIREBOLT, SkillType.FROST_NOVA, SkillType.BLINK]
  },
  [PlayerClassType.ASSASSIN]: {
    type: PlayerClassType.ASSASSIN,
    name: 'Shadow Assassin',
    tagline: 'Silent executioner striking from the darkness with lethal precision.',
    description: 'Extreme agility, massive critical strike multipliers, poison daggers, and smoke evasion.',
    icon: '🗡️',
    color: '#c084fc',
    baseHp: 95,
    baseMana: 50,
    strength: 11,
    agility: 18,
    arcana: 8,
    defense: 3,
    startingGear: ['rusty_dagger', 'leather_tunic', 'ring_of_shadows', 'swift_potion'],
    skills: [SkillType.SHADOW_STEP, SkillType.SMOKE_BOMB, SkillType.FAN_OF_KNIVES]
  },
  [PlayerClassType.CLERIC]: {
    type: PlayerClassType.CLERIC,
    name: 'Blood Cleric',
    tagline: 'Holy crusader cleansing the crypts with radiant fury and restoration.',
    description: 'Balanced warrior-caster with heavy undead-slaying smites, self-heals, and defensive auras.',
    icon: '✝️',
    color: '#fbbf24',
    baseHp: 110,
    baseMana: 60,
    strength: 12,
    agility: 10,
    arcana: 13,
    defense: 4,
    startingGear: ['heavy_warhammer', 'leather_tunic', 'wooden_buckler', 'scroll_holy_light'],
    skills: [SkillType.HOLY_SMITE, SkillType.DIVINE_HEAL, SkillType.PURIFYING_AURA]
  }
};
