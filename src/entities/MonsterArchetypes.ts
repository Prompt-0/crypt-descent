import { MonsterType, AIBehavior } from '../types';

export interface MonsterArchetype {
  type: MonsterType;
  name: string;
  char: string;
  color: string;
  bgColor?: string;
  maxHp: number;
  mana: number;
  attackPower: number;
  defense: number;
  agility: number;
  xpReward: number;
  goldReward: number;
  behavior: AIBehavior;
  range?: number;
  speed: number;
  abilities?: string[];
  description: string;
}

export const MONSTER_ARCHETYPES: Record<MonsterType, MonsterArchetype> = {
  [MonsterType.CRYPT_RAT]: {
    type: MonsterType.CRYPT_RAT,
    name: 'Crypt Rat',
    char: 'r',
    color: '#a1a1aa',
    maxHp: 12,
    mana: 0,
    attackPower: 4,
    defense: 1,
    agility: 14,
    xpReward: 15,
    goldReward: 3,
    behavior: AIBehavior.CHASE_MELEE,
    speed: 1.2,
    description: 'A vicious, diseased rodent skittering in the dark.'
  },
  [MonsterType.SKELETON_WARRIOR]: {
    type: MonsterType.SKELETON_WARRIOR,
    name: 'Skeleton Warrior',
    char: 's',
    color: '#e2e8f0',
    maxHp: 22,
    mana: 0,
    attackPower: 7,
    defense: 3,
    agility: 10,
    xpReward: 30,
    goldReward: 8,
    behavior: AIBehavior.CHASE_MELEE,
    speed: 1.0,
    description: 'An ancient animated swordsman clutching a rusted blade.'
  },
  [MonsterType.SKELETON_ARCHER]: {
    type: MonsterType.SKELETON_ARCHER,
    name: 'Skeleton Archer',
    char: 'k',
    color: '#facc15',
    maxHp: 18,
    mana: 0,
    attackPower: 6,
    defense: 2,
    agility: 12,
    xpReward: 35,
    goldReward: 10,
    behavior: AIBehavior.RANGED_KITE,
    range: 6,
    speed: 1.0,
    description: 'Draws a notched recurve bow with chilling accuracy.'
  },
  [MonsterType.ZOMBIE_BRUTE]: {
    type: MonsterType.ZOMBIE_BRUTE,
    name: 'Rotting Zombie Brute',
    char: 'Z',
    color: '#84cc16',
    maxHp: 42,
    mana: 0,
    attackPower: 10,
    defense: 5,
    agility: 6,
    xpReward: 55,
    goldReward: 14,
    behavior: AIBehavior.CHASE_MELEE,
    speed: 0.8,
    abilities: ['POISON_STRIKE'],
    description: 'A hulking corpse oozing necrotic bile.'
  },
  [MonsterType.SHADOW_WRAITH]: {
    type: MonsterType.SHADOW_WRAITH,
    name: 'Shadow Wraith',
    char: 'W',
    color: '#c084fc',
    maxHp: 28,
    mana: 20,
    attackPower: 11,
    defense: 2,
    agility: 15,
    xpReward: 65,
    goldReward: 18,
    behavior: AIBehavior.PHASING_LURKER,
    speed: 1.1,
    abilities: ['LIFE_LEECH'],
    description: 'A spectral entity that glides effortlessly through walls.'
  },
  [MonsterType.CULTIST_ACOLYTE]: {
    type: MonsterType.CULTIST_ACOLYTE,
    name: 'Crypt Cultist Acolyte',
    char: 'c',
    color: '#f43f5e',
    maxHp: 32,
    mana: 40,
    attackPower: 8,
    defense: 3,
    agility: 11,
    xpReward: 75,
    goldReward: 25,
    behavior: AIBehavior.MAGIC_SUMMONER,
    range: 5,
    speed: 1.0,
    abilities: ['DARK_FIREBALL', 'SUMMON_SKELETON'],
    description: 'Chants forbidden incantations to resurrect the dead.'
  },
  [MonsterType.CRYPT_KNIGHT]: {
    type: MonsterType.CRYPT_KNIGHT,
    name: 'Crypt Death Knight',
    char: 'K',
    color: '#38bdf8',
    maxHp: 58,
    mana: 15,
    attackPower: 15,
    defense: 9,
    agility: 9,
    xpReward: 110,
    goldReward: 40,
    behavior: AIBehavior.CHASE_MELEE,
    speed: 0.95,
    abilities: ['SHIELD_BASH_STUN'],
    description: 'Encased in cursed black plate, wielding a massive zweihander.'
  },
  [MonsterType.BLOOD_BAT]: {
    type: MonsterType.BLOOD_BAT,
    name: 'Vampiric Blood Bat',
    char: 'b',
    color: '#dc2626',
    maxHp: 20,
    mana: 0,
    attackPower: 9,
    defense: 2,
    agility: 17,
    xpReward: 45,
    goldReward: 12,
    behavior: AIBehavior.CHASE_MELEE,
    speed: 1.35,
    abilities: ['VAMPIRIC_DRAIN'],
    description: 'Darts erratically from shadows to gorge on warm blood.'
  },
  [MonsterType.MERCHANT_GRIMM]: {
    type: MonsterType.MERCHANT_GRIMM,
    name: 'Grimm the Wandering Trader',
    char: '$',
    color: '#fbbf24',
    bgColor: '#451a03',
    maxHp: 500,
    mana: 100,
    attackPower: 50,
    defense: 30,
    agility: 15,
    xpReward: 0,
    goldReward: 1000,
    behavior: AIBehavior.SHOPKEEPER,
    speed: 1.0,
    description: 'A cloaked subterranean merchant offering exotic crypt wares.'
  },
  [MonsterType.FRIENDLY_SKELETON]: {
    type: MonsterType.FRIENDLY_SKELETON,
    name: 'Resurrected Skeleton Ally',
    char: 's',
    color: '#38bdf8',
    maxHp: 25,
    mana: 0,
    attackPower: 9,
    defense: 3,
    agility: 12,
    xpReward: 0,
    goldReward: 0,
    behavior: AIBehavior.ALLY_PET,
    speed: 1.0,
    description: 'A loyal bone warrior fighting alongside you.'
  },
  [MonsterType.BOSS_MALAKOR]: {
    type: MonsterType.BOSS_MALAKOR,
    name: 'Malakor, the Necromancer Lord',
    char: 'M',
    color: '#e11d48',
    bgColor: '#4c0519',
    maxHp: 240,
    mana: 100,
    attackPower: 22,
    defense: 12,
    agility: 13,
    xpReward: 1000,
    goldReward: 500,
    behavior: AIBehavior.BOSS_MULTI_PHASE,
    range: 7,
    speed: 1.0,
    abilities: ['BONE_SPEAR', 'DARK_NOVA', 'SUMMON_ARMY', 'TELEPORT_AWAY'],
    description: 'The ancient master of the crypts. Commands legions of the restless dead.'
  }
};
