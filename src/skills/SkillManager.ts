import { Skill, SkillType, Position } from '../types';
import { Entity } from '../entities/Entity';
import { SKILL_DEFINITIONS } from '../classes/ClassCatalog';

export interface SkillExecutionResult {
  success: boolean;
  manaConsumed: number;
  message: string;
  affectedMonsters?: { monster: Entity; damage: number; isCrit?: boolean; isFrozen?: boolean; isStunned?: boolean }[];
  teleportTarget?: Position;
  cleansedEffects?: boolean;
}

export class SkillManager {
  public static createSkill(type: SkillType): Skill {
    const def = SKILL_DEFINITIONS[type];
    if (!def) throw new Error(`Skill definition not found for: ${type}`);
    return {
      ...def,
      cooldownCurrent: 0
    };
  }

  public static tickCooldowns(skills: Skill[]): void {
    skills.forEach((s) => {
      if (s.cooldownCurrent > 0) {
        s.cooldownCurrent--;
      }
    });
  }

  public static canUseSkill(player: Entity, skill: Skill): { canUse: boolean; reason?: string } {
    if (player.stats.mana < skill.manaCost) {
      return { canUse: false, reason: `Not enough mana! (Requires ${skill.manaCost} MP)` };
    }
    if (skill.cooldownCurrent > 0) {
      return { canUse: false, reason: `${skill.name} is on cooldown for ${skill.cooldownCurrent} more turns.` };
    }
    return { canUse: true };
  }
}
