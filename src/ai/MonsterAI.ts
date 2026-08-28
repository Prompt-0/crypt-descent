import { Entity } from '../entities/Entity';
import { Position, Tile, TileType, AIBehavior, MonsterType } from '../types';
import * as ROT from 'rot-js';

export interface AIActionResult {
  type: 'MOVE' | 'MELEE_ATTACK' | 'RANGED_ATTACK' | 'SPELL' | 'SUMMON' | 'WAIT';
  targetPos?: Position;
  spellName?: string;
  damage?: number;
  summonType?: MonsterType;
}

export class MonsterAI {
  public static planTurn(
    monster: Entity,
    player: Entity,
    tiles: Tile[][],
    allMonsters: Entity[],
    width: number,
    height: number
  ): AIActionResult {
    const dist = Math.hypot(player.x - monster.x, player.y - monster.y);

    // If stunned, cannot act
    if (monster.hasStatusEffect('STUNNED' as any)) {
      return { type: 'WAIT' };
    }

    // Check if monster sees player or is close enough
    const hasLOS = MonsterAI.hasLineOfSight(monster.x, monster.y, player.x, player.y, tiles);

    // If player is invisible, monster cannot see unless adjacent
    if (player.hasStatusEffect('INVISIBLE' as any) && dist > 1.5) {
      return { type: 'WAIT' };
    }

    if (hasLOS) {
      monster.isAlerted = true;
      monster.lastKnownPlayerPos = { x: player.x, y: player.y };
    }

    if (!monster.isAlerted || !monster.lastKnownPlayerPos) {
      // Idle patrol or sleep
      return { type: 'WAIT' };
    }

    const behavior = monster.archetype?.behavior || AIBehavior.CHASE_MELEE;

    // --- BEHAVIOR 1: BOSS MULTI-PHASE ---
    if (behavior === AIBehavior.BOSS_MULTI_PHASE) {
      return MonsterAI.planBossAction(monster, player, dist, hasLOS, tiles, allMonsters, width, height);
    }

    // --- BEHAVIOR 2: MAGIC SUMMONER ---
    if (behavior === AIBehavior.MAGIC_SUMMONER) {
      // Chance to summon skeleton if few enemies around
      if (dist <= 6 && Math.random() < 0.25 && allMonsters.length < 15) {
        return {
          type: 'SUMMON',
          summonType: MonsterType.SKELETON_WARRIOR,
          spellName: 'Dark Resuscitation'
        };
      }
      // Cast Dark Fireball if in range and line of sight
      if (dist <= 5 && hasLOS) {
        return {
          type: 'SPELL',
          targetPos: { x: player.x, y: player.y },
          spellName: 'Dark Fireball',
          damage: 12
        };
      }
    }

    // --- BEHAVIOR 3: RANGED KITE (ARCHER) ---
    if (behavior === AIBehavior.RANGED_KITE) {
      // If adjacent, try to step back if possible
      if (dist <= 1.5) {
        const retreatStep = MonsterAI.findRetreatStep(monster, player, tiles, allMonsters, width, height);
        if (retreatStep) {
          return { type: 'MOVE', targetPos: retreatStep };
        }
      }
      // If within ranged attack distance and has LOS, shoot arrow!
      if (dist <= 6 && hasLOS) {
        return {
          type: 'RANGED_ATTACK',
          targetPos: { x: player.x, y: player.y },
          damage: monster.getEffectiveAttackPower()
        };
      }
    }

    // --- BEHAVIOR 4: MELEE ATTACK IF ADJACENT ---
    if (dist <= 1.5) {
      return {
        type: 'MELEE_ATTACK',
        targetPos: { x: player.x, y: player.y }
      };
    }

    // --- BEHAVIOR 5: PATHFINDING PURSUIT ---
    const targetPos = monster.lastKnownPlayerPos;
    const nextStep = MonsterAI.findNextStep(monster, targetPos, tiles, allMonsters, width, height, behavior === AIBehavior.PHASING_LURKER);

    if (nextStep) {
      return { type: 'MOVE', targetPos: nextStep };
    }

    return { type: 'WAIT' };
  }

  private static planBossAction(
    boss: Entity,
    player: Entity,
    dist: number,
    hasLOS: boolean,
    tiles: Tile[][],
    allMonsters: Entity[],
    width: number,
    height: number
  ): AIActionResult {
    // 1. Dark Nova if player is adjacent and low on cooldown
    if (dist <= 1.5 && Math.random() < 0.4) {
      return {
        type: 'SPELL',
        targetPos: { x: player.x, y: player.y },
        spellName: 'Dark Nova Blast',
        damage: 24
      };
    }

    // 2. Summon Undead Legion
    if (Math.random() < 0.2 && allMonsters.length < 12) {
      return {
        type: 'SUMMON',
        summonType: Math.random() < 0.5 ? MonsterType.SKELETON_WARRIOR : MonsterType.ZOMBIE_BRUTE,
        spellName: 'Legion of Bone'
      };
    }

    // 3. Cast Bone Spear from range
    if (dist <= 7 && hasLOS && Math.random() < 0.55) {
      return {
        type: 'SPELL',
        targetPos: { x: player.x, y: player.y },
        spellName: 'Bone Spear',
        damage: 18
      };
    }

    // 4. Melee hit
    if (dist <= 1.5) {
      return {
        type: 'MELEE_ATTACK',
        targetPos: { x: player.x, y: player.y }
      };
    }

    // 5. March forward
    const nextStep = MonsterAI.findNextStep(boss, { x: player.x, y: player.y }, tiles, allMonsters, width, height, false);
    if (nextStep) {
      return { type: 'MOVE', targetPos: nextStep };
    }

    return { type: 'WAIT' };
  }

  public static findNextStep(
    monster: Entity,
    target: Position,
    tiles: Tile[][],
    allMonsters: Entity[],
    width: number,
    height: number,
    isPhasing: boolean = false
  ): Position | null {
    // Passable function for A*
    const passableCallback = (x: number, y: number): boolean => {
      if (x < 0 || x >= width || y < 0 || y >= height) return false;
      if (x === target.x && y === target.y) return true; // Target itself is reachable

      if (!isPhasing) {
        const tile = tiles[y][x];
        if (!tile.walkable && tile.type !== TileType.DOOR_CLOSED) return false;
      }

      // Check if blocked by another monster
      const blockedByMonster = allMonsters.some(
        (m) => m !== monster && m.stats.hp > 0 && m.x === x && m.y === y
      );
      if (blockedByMonster) return false;

      return true;
    };

    const astar = new ROT.Path.AStar(target.x, target.y, passableCallback, { topology: 8 });
    const path: Position[] = [];

    astar.compute(monster.x, monster.y, (x, y) => {
      path.push({ x, y });
    });

    // path[0] is monster's current tile, path[1] is the next step
    if (path.length >= 2) {
      return path[1];
    }
    return null;
  }

  public static findRetreatStep(
    monster: Entity,
    player: Entity,
    tiles: Tile[][],
    allMonsters: Entity[],
    width: number,
    height: number
  ): Position | null {
    const dx = Math.sign(monster.x - player.x);
    const dy = Math.sign(monster.y - player.y);

    const candidates = [
      { x: monster.x + dx, y: monster.y + dy },
      { x: monster.x + dx, y: monster.y },
      { x: monster.x, y: monster.y + dy }
    ];

    for (const cand of candidates) {
      if (
        cand.x >= 0 &&
        cand.x < width &&
        cand.y >= 0 &&
        cand.y < height &&
        tiles[cand.y][cand.x].walkable &&
        !allMonsters.some((m) => m !== monster && m.stats.hp > 0 && m.x === cand.x && m.y === cand.y)
      ) {
        return cand;
      }
    }
    return null;
  }

  public static hasLineOfSight(x0: number, y0: number, x1: number, y1: number, tiles: Tile[][]): boolean {
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;

    let currX = x0;
    let currY = y0;

    while (currX !== x1 || currY !== y1) {
      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        currX += sx;
      }
      if (e2 < dx) {
        err += dx;
        currY += sy;
      }

      if (currX === x1 && currY === y1) return true;

      // Check obstruction
      if (!tiles[currY][currX].transparent) {
        return false;
      }
    }
    return true;
  }
}
