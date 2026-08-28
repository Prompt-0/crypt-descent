import { Entity } from '../entities/Entity';
import { StatusEffectType, EquipSlot } from '../types';

export interface AttackResult {
  hit: boolean;
  isCrit: boolean;
  rawDamage: number;
  mitigatedDamage: number;
  targetKilled: boolean;
  xpGained: number;
  goldGained: number;
  statusApplied?: StatusEffectType;
  message: string;
}

export class CombatEngine {
  public static calculateXpForLevel(level: number): number {
    return 40 * level * level + 60 * level;
  }

  public static executeAttack(attacker: Entity, defender: Entity): AttackResult {
    // 1. Calculate Hit / Evasion Chance
    const agiDiff = attacker.stats.agility - defender.stats.agility;
    const hitChance = Math.min(0.98, Math.max(0.20, 0.75 + agiDiff * 0.03));
    const roll = Math.random();

    if (roll > hitChance) {
      return {
        hit: false,
        isCrit: false,
        rawDamage: 0,
        mitigatedDamage: 0,
        targetKilled: false,
        xpGained: 0,
        goldGained: 0,
        message: `${attacker.name} attacks ${defender.name} but misses!`
      };
    }

    // 2. Critical Strike Check
    const critChance = attacker.getEffectiveCritChance();
    const isCrit = Math.random() < critChance;

    // 3. Raw Damage Calculation with variance
    const basePower = attacker.getEffectiveAttackPower();
    const variance = (Math.random() * 0.3 - 0.15) * basePower; // ±15%
    let rawDamage = Math.max(1, Math.round(basePower + variance));

    if (isCrit) {
      rawDamage = Math.round(rawDamage * 1.75);
    }

    // 4. Armor Mitigation Formula: Damage = Raw * (100 / (100 + Defense))
    const defense = defender.getEffectiveDefense();
    const armorMultiplier = 100 / (100 + Math.max(0, defense));
    const mitigatedDamage = Math.max(1, Math.round(rawDamage * armorMultiplier));

    // 5. Apply Damage
    const isKilled = defender.takeDamage(mitigatedDamage);
    attacker.stats.damageDealt += mitigatedDamage;

    let xpGained = 0;
    let goldGained = 0;

    // 6. Check Amulet of Phoenix on Player Fatal Damage
    if (defender.isPlayer && isKilled && defender.equipment[EquipSlot.AMULET]?.name.includes('Phoenix')) {
      defender.stats.hp = defender.stats.maxHp;
      delete defender.equipment[EquipSlot.AMULET];
      return {
        hit: true,
        isCrit,
        rawDamage,
        mitigatedDamage,
        targetKilled: false,
        xpGained: 0,
        goldGained: 0,
        message: `The Amulet of the Phoenix shatters in a flash of divine fire, restoring ${defender.name} to full life!`
      };
    }

    if (isKilled) {
      attacker.stats.monstersSlain++;
      xpGained = defender.stats.xp;
      goldGained = defender.stats.gold;
      attacker.stats.gold += goldGained;
      CombatEngine.addXp(attacker, xpGained);
    }

    // 7. Check Monster Special Hit Status Effects
    let statusApplied: StatusEffectType | undefined;
    if (!isKilled && attacker.archetype?.abilities) {
      if (attacker.archetype.abilities.includes('POISON_STRIKE') && Math.random() < 0.35) {
        statusApplied = StatusEffectType.POISON;
        defender.applyStatusEffect({
          type: StatusEffectType.POISON,
          name: 'Necrotic Poison',
          duration: 4,
          power: 4,
          color: '#10b981',
          icon: '☣'
        });
      } else if (attacker.archetype.abilities.includes('SHIELD_BASH_STUN') && Math.random() < 0.25) {
        statusApplied = StatusEffectType.STUNNED;
        defender.applyStatusEffect({
          type: StatusEffectType.STUNNED,
          name: 'Concussed Stun',
          duration: 2,
          power: 0,
          color: '#fbbf24',
          icon: '⚡'
        });
      } else if (attacker.archetype.abilities.includes('LIFE_LEECH') || attacker.archetype.abilities.includes('VAMPIRIC_DRAIN')) {
        const leeched = Math.round(mitigatedDamage * 0.4);
        attacker.heal(leeched);
      }
    }

    const critText = isCrit ? ' CRITICAL HIT!' : '';
    const statusText = statusApplied ? ` [Afflicted with ${statusApplied}]` : '';
    const killText = isKilled ? ` ${defender.name} is destroyed!` : '';

    return {
      hit: true,
      isCrit,
      rawDamage,
      mitigatedDamage,
      targetKilled: isKilled,
      xpGained,
      goldGained,
      statusApplied,
      message: `${attacker.name} strikes ${defender.name} for ${mitigatedDamage} damage!${critText}${statusText}${killText}`
    };
  }

  public static addXp(entity: Entity, amount: number): boolean {
    entity.stats.xp += amount;
    let leveledUp = false;

    while (entity.stats.xp >= entity.stats.xpToNextLevel) {
      entity.stats.xp -= entity.stats.xpToNextLevel;
      entity.stats.level++;
      entity.stats.xpToNextLevel = CombatEngine.calculateXpForLevel(entity.stats.level);

      // Stat growths
      entity.stats.maxHp += 15;
      entity.stats.hp = entity.stats.maxHp;
      entity.stats.maxMana += 10;
      entity.stats.mana = entity.stats.maxMana;
      entity.stats.strength += 2;
      entity.stats.agility += 2;
      entity.stats.arcana += 2;
      entity.stats.defense += 1;

      leveledUp = true;
    }

    return leveledUp;
  }
}
