import {
  Position,
  StatBlock,
  Item,
  EquipmentMap,
  EquipSlot,
  StatusEffect,
  StatusEffectType,
  EntityAlignment,
  MonsterType
} from '../types';
import { MonsterArchetype, MONSTER_ARCHETYPES } from './MonsterArchetypes';

export class Entity {
  public id: string;
  public name: string;
  public char: string;
  public color: string;
  public bgColor?: string;
  public alignment: EntityAlignment;
  public isPlayer: boolean;
  public monsterType?: MonsterType;
  public archetype?: MonsterArchetype;

  // Grid coordinates
  public x: number;
  public y: number;

  // Smooth render interpolation coordinates
  public renderX: number;
  public renderY: number;
  public bumpOffsetX: number = 0;
  public bumpOffsetY: number = 0;
  public bumpDuration: number = 0;
  public bumpElapsed: number = 0;

  // Visual feedback
  public hitFlashTimer: number = 0; // In seconds

  // Stats & Health
  public stats: StatBlock;
  public statusEffects: StatusEffect[] = [];
  public inventory: Item[] = [];
  public equipment: EquipmentMap = {};

  // Monster AI state
  public isAlerted: boolean = false;
  public lastKnownPlayerPos?: Position;
  public abilityCooldowns: Record<string, number> = {};

  constructor(
    id: string,
    name: string,
    char: string,
    color: string,
    x: number,
    y: number,
    alignment: EntityAlignment = EntityAlignment.HOSTILE,
    isPlayer: boolean = false,
    stats?: Partial<StatBlock>
  ) {
    this.id = id;
    this.name = name;
    this.char = char;
    this.color = color;
    this.x = x;
    this.y = y;
    this.renderX = x;
    this.renderY = y;
    this.alignment = alignment;
    this.isPlayer = isPlayer;

    const baseMaxHp = isPlayer ? 100 : 20;
    const baseMaxMana = isPlayer ? 50 : 0;

    this.stats = {
      hp: stats?.hp ?? baseMaxHp,
      maxHp: stats?.maxHp ?? baseMaxHp,
      mana: stats?.mana ?? baseMaxMana,
      maxMana: stats?.maxMana ?? baseMaxMana,
      strength: stats?.strength ?? 10,
      agility: stats?.agility ?? 10,
      arcana: stats?.arcana ?? 10,
      defense: stats?.defense ?? 2,
      level: stats?.level ?? 1,
      xp: stats?.xp ?? 0,
      xpToNextLevel: stats?.xpToNextLevel ?? 100,
      gold: stats?.gold ?? 0,
      dungeonDepth: stats?.dungeonDepth ?? 1,
      turnsElapsed: stats?.turnsElapsed ?? 0,
      monstersSlain: stats?.monstersSlain ?? 0,
      damageDealt: stats?.damageDealt ?? 0,
      damageTaken: stats?.damageTaken ?? 0
    };
  }

  public static createMonster(type: MonsterType, x: number, y: number): Entity {
    const arch = MONSTER_ARCHETYPES[type];
    const monster = new Entity(
      `${type}_${Math.random().toString(36).substring(2, 9)}`,
      arch.name,
      arch.char,
      arch.color,
      x,
      y,
      EntityAlignment.HOSTILE,
      false,
      {
        hp: arch.maxHp,
        maxHp: arch.maxHp,
        mana: arch.mana,
        maxMana: arch.mana,
        strength: arch.attackPower,
        agility: arch.agility,
        defense: arch.defense,
        gold: arch.goldReward,
        xp: arch.xpReward
      }
    );
    monster.monsterType = type;
    monster.archetype = arch;
    if (arch.bgColor) monster.bgColor = arch.bgColor;
    return monster;
  }

  public getEffectiveAttackPower(): number {
    let power = this.stats.strength;
    const mainHand = this.equipment[EquipSlot.MAIN_HAND];
    if (mainHand?.attackPower) power += mainHand.attackPower;

    // Status effect modifiers
    if (this.hasStatusEffect(StatusEffectType.MIGHT)) {
      power += 5;
    }
    return power;
  }

  public getEffectiveDefense(): number {
    let def = this.stats.defense;
    Object.values(this.equipment).forEach((item) => {
      if (item?.defense) def += item.defense;
    });
    if (this.hasStatusEffect(StatusEffectType.BLESSED)) {
      def += 4;
    }
    return def;
  }

  public getEffectiveCritChance(): number {
    let crit = 0.05 + this.stats.agility * 0.005;
    const mainHand = this.equipment[EquipSlot.MAIN_HAND];
    if (mainHand?.critBonus) crit += mainHand.critBonus;
    const ring = this.equipment[EquipSlot.RING];
    if (ring?.critBonus) crit += ring.critBonus;
    return Math.min(0.75, crit);
  }

  public getEffectiveMagicPower(): number {
    let magic = this.stats.arcana;
    Object.values(this.equipment).forEach((item) => {
      if (item?.magicPower) magic += item.magicPower;
    });
    return magic;
  }

  public equipItem(item: Item): Item | null {
    if (!item.equipSlot) return null;
    const previous = this.equipment[item.equipSlot] || null;
    this.equipment[item.equipSlot] = item;

    // Remove from inventory
    const idx = this.inventory.indexOf(item);
    if (idx >= 0) this.inventory.splice(idx, 1);

    // If there was an old item, put it back in inventory
    if (previous) {
      this.inventory.push(previous);
    }
    return previous;
  }

  public unequipItem(slot: EquipSlot): Item | null {
    const item = this.equipment[slot];
    if (item) {
      delete this.equipment[slot];
      this.inventory.push(item);
      return item;
    }
    return null;
  }

  public hasStatusEffect(type: StatusEffectType): boolean {
    return this.statusEffects.some((e) => e.type === type);
  }

  public applyStatusEffect(effect: StatusEffect): void {
    const existing = this.statusEffects.find((e) => e.type === effect.type);
    if (existing) {
      existing.duration = Math.max(existing.duration, effect.duration);
    } else {
      this.statusEffects.push({ ...effect });
    }
  }

  public tickStatusEffects(): { damage: number; messages: string[] } {
    let totalDmg = 0;
    const msgs: string[] = [];

    for (let i = this.statusEffects.length - 1; i >= 0; i--) {
      const effect = this.statusEffects[i];
      if (effect.type === StatusEffectType.POISON) {
        totalDmg += effect.power;
        msgs.push(`${this.name} suffers ${effect.power} poison damage.`);
      } else if (effect.type === StatusEffectType.BURNING) {
        totalDmg += effect.power;
        msgs.push(`${this.name} is scorched for ${effect.power} fire damage.`);
      }

      effect.duration--;
      if (effect.duration <= 0) {
        msgs.push(`${effect.name} on ${this.name} has worn off.`);
        this.statusEffects.splice(i, 1);
      }
    }

    if (totalDmg > 0) {
      this.takeDamage(totalDmg);
    }

    return { damage: totalDmg, messages: msgs };
  }

  public takeDamage(amount: number): boolean {
    this.stats.hp = Math.max(0, this.stats.hp - amount);
    this.stats.damageTaken += amount;
    this.hitFlashTimer = 0.18; // 180ms hit flash
    return this.stats.hp === 0;
  }

  public heal(amount: number): number {
    const oldHp = this.stats.hp;
    this.stats.hp = Math.min(this.stats.maxHp, this.stats.hp + amount);
    return this.stats.hp - oldHp;
  }

  public restoreMana(amount: number): number {
    const oldMana = this.stats.mana;
    this.stats.mana = Math.min(this.stats.maxMana, this.stats.mana + amount);
    return this.stats.mana - oldMana;
  }

  public startBumpAnimation(targetX: number, targetY: number, duration: number = 0.12): void {
    this.bumpOffsetX = (targetX - this.x) * 0.45;
    this.bumpOffsetY = (targetY - this.y) * 0.45;
    this.bumpDuration = duration;
    this.bumpElapsed = 0;
  }

  public updateAnimation(dt: number): void {
    // Smooth position lerp
    const lerpFactor = Math.min(1.0, dt * 25);
    this.renderX += (this.x - this.renderX) * lerpFactor;
    this.renderY += (this.y - this.renderY) * lerpFactor;

    // Bump animation
    if (this.bumpDuration > 0) {
      this.bumpElapsed += dt;
      if (this.bumpElapsed >= this.bumpDuration) {
        this.bumpOffsetX = 0;
        this.bumpOffsetY = 0;
        this.bumpDuration = 0;
      } else {
        const progress = this.bumpElapsed / this.bumpDuration;
        // Bump forward then spring back: sin(pi * progress)
        const bounce = Math.sin(Math.PI * progress);
        this.bumpOffsetX *= bounce;
        this.bumpOffsetY *= bounce;
      }
    }

    // Hit flash decay
    if (this.hitFlashTimer > 0) {
      this.hitFlashTimer = Math.max(0, this.hitFlashTimer - dt);
    }
  }
}
