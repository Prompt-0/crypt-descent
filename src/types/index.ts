export type Position = {
  x: number;
  y: number;
};

export enum TileType {
  WALL = 'WALL',
  CRACKED_WALL = 'CRACKED_WALL',
  FLOOR = 'FLOOR',
  CORRIDOR = 'CORRIDOR',
  DOOR_CLOSED = 'DOOR_CLOSED',
  DOOR_OPEN = 'DOOR_OPEN',
  DOOR_LOCKED = 'DOOR_LOCKED',
  STAIRS_DOWN = 'STAIRS_DOWN',
  STAIRS_UP = 'STAIRS_UP',
  SHRINE = 'SHRINE',
  FOUNTAIN = 'FOUNTAIN',
  CHEST_CLOSED = 'CHEST_CLOSED',
  CHEST_OPEN = 'CHEST_OPEN',
  BARREL = 'BARREL',
  EXPLOSIVE_BARREL = 'EXPLOSIVE_BARREL',
  WATER = 'WATER',
  OIL = 'OIL',
  CHASM = 'CHASM',
  TRAP = 'TRAP',
  VOID = 'VOID'
}

export interface Tile {
  type: TileType;
  char: string;
  color: string;
  bgColor: string;
  transparent: boolean;
  walkable: boolean;
  explored: boolean;
  visible: boolean;
  lightLevel: number; // 0.0 to 1.0
  lightColor?: [number, number, number];
  bloodLevel?: number;
  bloodColor?: string;
  trapDiscovered?: boolean;
  isBurning?: boolean;
  burnTurns?: number;
}

export interface LightSource {
  x: number;
  y: number;
  radius: number;
  color: [number, number, number];
  intensity: number;
  flickerRate?: number;
}

export enum PlayerClassType {
  WARRIOR = 'WARRIOR',
  MAGE = 'MAGE',
  ASSASSIN = 'ASSASSIN',
  CLERIC = 'CLERIC'
}

export enum SkillType {
  // Warrior
  WHIRLWIND = 'WHIRLWIND',
  SHIELD_SLAM = 'SHIELD_SLAM',
  BERSERK_RAGE = 'BERSERK_RAGE',
  // Mage
  FIREBOLT = 'FIREBOLT',
  FROST_NOVA = 'FROST_NOVA',
  BLINK = 'BLINK',
  // Assassin
  SHADOW_STEP = 'SHADOW_STEP',
  SMOKE_BOMB = 'SMOKE_BOMB',
  FAN_OF_KNIVES = 'FAN_OF_KNIVES',
  // Cleric
  HOLY_SMITE = 'HOLY_SMITE',
  DIVINE_HEAL = 'DIVINE_HEAL',
  PURIFYING_AURA = 'PURIFYING_AURA'
}

export interface Skill {
  id: SkillType;
  name: string;
  description: string;
  icon: string;
  manaCost: number;
  cooldownMax: number;
  cooldownCurrent: number;
  range?: number;
  aoeRadius?: number;
  requiresTarget: boolean;
  color: string;
}

export interface ClassDefinition {
  type: PlayerClassType;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  color: string;
  baseHp: number;
  baseMana: number;
  strength: number;
  agility: number;
  arcana: number;
  defense: number;
  startingGear: string[];
  skills: SkillType[];
}

export enum ItemType {
  WEAPON = 'WEAPON',
  ARMOR = 'ARMOR',
  SHIELD = 'SHIELD',
  HELMET = 'HELMET',
  RING = 'RING',
  AMULET = 'AMULET',
  RELIC = 'RELIC',
  POTION = 'POTION',
  SCROLL = 'SCROLL',
  KEY = 'KEY',
  GOLD = 'GOLD'
}

export enum ItemRarity {
  COMMON = 'COMMON',
  RARE = 'RARE',
  EPIC = 'EPIC',
  LEGENDARY = 'LEGENDARY'
}

export enum EquipSlot {
  MAIN_HAND = 'MAIN_HAND',
  OFF_HAND = 'OFF_HAND',
  BODY = 'BODY',
  HEAD = 'HEAD',
  RING = 'RING',
  AMULET = 'AMULET'
}

export interface ItemAffix {
  name: string;
  type: 'PREFIX' | 'SUFFIX';
  statBonus?: Partial<StatBlock>;
  elementalBonus?: 'FIRE' | 'FROST' | 'LIGHTNING' | 'HOLY' | 'DARK';
  elementalDamage?: number;
  lifesteal?: number;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  type: ItemType;
  rarity: ItemRarity;
  char: string;
  color: string;
  equipSlot?: EquipSlot;
  value: number;
  // Stats
  attackPower?: number;
  defense?: number;
  magicPower?: number;
  critBonus?: number;
  range?: number;
  affix?: ItemAffix;
  // Consumables / Relics
  healAmount?: number;
  manaAmount?: number;
  effectDuration?: number;
  effectType?: StatusEffectType;
  effectPower?: number;
  aoeRadius?: number;
  relicProc?: RelicProcType;
}

export enum RelicProcType {
  THUNDER_STRIKE = 'THUNDER_STRIKE',
  VAMPIRE_FANG = 'VAMPIRE_FANG',
  NECRO_MINION = 'NECRO_MINION',
  FROST_TOUCH = 'FROST_TOUCH',
  MOLTEN_CORE = 'MOLTEN_CORE',
  AEGIS_THORNS = 'AEGIS_THORNS'
}

export enum StatusEffectType {
  POISON = 'POISON',
  BURNING = 'BURNING',
  FROZEN = 'FROZEN',
  STUNNED = 'STUNNED',
  BLESSED = 'BLESSED',
  SWIFT = 'SWIFT',
  INVISIBLE = 'INVISIBLE',
  MIGHT = 'MIGHT',
  SHADOW_VEIL = 'SHADOW_VEIL',
  BERSERK = 'BERSERK'
}

export interface StatusEffect {
  type: StatusEffectType;
  name: string;
  duration: number;
  power: number;
  color: string;
  icon: string;
}

export interface StatBlock {
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  strength: number;
  agility: number;
  arcana: number;
  defense: number;
  level: number;
  xp: number;
  xpToNextLevel: number;
  gold: number;
  dungeonDepth: number;
  turnsElapsed: number;
  monstersSlain: number;
  damageDealt: number;
  damageTaken: number;
}

export enum MonsterType {
  CRYPT_RAT = 'CRYPT_RAT',
  SKELETON_WARRIOR = 'SKELETON_WARRIOR',
  SKELETON_ARCHER = 'SKELETON_ARCHER',
  ZOMBIE_BRUTE = 'ZOMBIE_BRUTE',
  SHADOW_WRAITH = 'SHADOW_WRAITH',
  CULTIST_ACOLYTE = 'CULTIST_ACOLYTE',
  CRYPT_KNIGHT = 'CRYPT_KNIGHT',
  BLOOD_BAT = 'BLOOD_BAT',
  MERCHANT_GRIMM = 'MERCHANT_GRIMM',
  FRIENDLY_SKELETON = 'FRIENDLY_SKELETON',
  BOSS_MALAKOR = 'BOSS_MALAKOR'
}

export enum EntityAlignment {
  PLAYER = 'PLAYER',
  HOSTILE = 'HOSTILE',
  NEUTRAL = 'NEUTRAL',
  ALLY = 'ALLY'
}

export enum AIBehavior {
  CHASE_MELEE = 'CHASE_MELEE',
  RANGED_KITE = 'RANGED_KITE',
  MAGIC_SUMMONER = 'MAGIC_SUMMONER',
  PHASING_LURKER = 'PHASING_LURKER',
  BOSS_MULTI_PHASE = 'BOSS_MULTI_PHASE',
  ALLY_PET = 'ALLY_PET',
  SHOPKEEPER = 'SHOPKEEPER'
}

export interface EquipmentMap {
  [EquipSlot.MAIN_HAND]?: Item;
  [EquipSlot.OFF_HAND]?: Item;
  [EquipSlot.BODY]?: Item;
  [EquipSlot.HEAD]?: Item;
  [EquipSlot.RING]?: Item;
  [EquipSlot.AMULET]?: Item;
}

export enum GameState {
  TITLE = 'TITLE',
  CLASS_SELECT = 'CLASS_SELECT',
  PLAYING = 'PLAYING',
  INVENTORY = 'INVENTORY',
  SHOP = 'SHOP',
  ALTAR = 'ALTAR',
  HELP = 'HELP',
  GAME_OVER = 'GAME_OVER',
  VICTORY = 'VICTORY',
  TARGETING = 'TARGETING'
}

export interface LogMessage {
  id: string;
  text: string;
  color: string;
  turn: number;
  category?: 'combat' | 'item' | 'system' | 'story' | 'warning' | 'shop' | 'skill';
}

export interface TargetingMode {
  active: boolean;
  item?: Item;
  skill?: Skill;
  range: number;
  aoeRadius: number;
  validTarget: (x: number, y: number) => boolean;
  onSelect: (x: number, y: number) => void;
}
