import {
  Tile,
  TileType,
  Position,
  GameState,
  LogMessage,
  Item,
  EquipSlot,
  ItemType,
  MonsterType,
  TargetingMode,
  PlayerClassType,
  Skill,
  SkillType,
  RelicProcType,
  EntityAlignment,
  LevelUpPerk
} from '../types';
import { Entity } from '../entities/Entity';
import { DungeonGenerator, GeneratedLevel } from '../procgen/DungeonGenerator';
import { VisibilityEngine } from '../fov/VisibilityEngine';
import { CanvasRenderer } from '../render/CanvasRenderer';
import { HUDOverlay } from '../ui/HUDOverlay';
import { InputManager } from './InputManager';
import { ParticleEngine } from '../render/ParticleEngine';
import { CameraShake } from '../render/CameraShake';
import { MonsterAI } from '../ai/MonsterAI';
import { CombatEngine } from '../combat/CombatEngine';
import { LootManager } from '../items/LootManager';
import { RelicManager } from '../relics/RelicManager';
import { CLASS_CATALOG } from '../classes/ClassCatalog';
import { SkillManager } from '../skills/SkillManager';
import { ShopManager } from '../shop/ShopManager';
import { sound } from '../audio/SoundSynth';
import * as ROT from 'rot-js';

export class Engine {
  private canvas: HTMLCanvasElement;
  private renderer: CanvasRenderer;
  private hud: HUDOverlay;
  public inputManager!: InputManager;
  private particleEngine: ParticleEngine;
  private cameraShake: CameraShake;
  private visibilityEngine!: VisibilityEngine;

  // Game World State
  public gameState: GameState = GameState.TITLE;
  public previousGameState: GameState = GameState.TITLE;
  public currentFloor: number = 1;
  public maxFloor: number = 5;
  public tiles: Tile[][] = [];
  public width: number = 54;
  public height: number = 36;
  public player!: Entity;
  public playerClass: PlayerClassType = PlayerClassType.WARRIOR;
  public playerSkills: Skill[] = [];
  public monsters: Entity[] = [];
  public itemsOnFloor: { pos: Position; item: Item }[] = [];
  public lights: any[] = [];
  public stairsDownPos!: Position;
  public logs: LogMessage[] = [];
  public boss: Entity | null = null;
  public shopManager: ShopManager | null = null;
  public currentLevelUpPerks: LevelUpPerk[] = [];

  // Mouse & Targeting state
  public hoverTile: Position | null = null;
  public pathToTarget: Position[] | null = null;
  public targetingMode: TargetingMode | null = null;

  // Timing & flags
  private lastTime: number = 0;
  private isProcessingTurn: boolean = false;
  private isAutoExploring: boolean = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.renderer = new CanvasRenderer(canvas);
    this.particleEngine = new ParticleEngine();
    this.cameraShake = new CameraShake();
    this.hud = new HUDOverlay(this.handleUIAction.bind(this));

    this.initTitleScreen();
    this.initInput();
    this.startLoop();
  }

  public resize(width: number, height: number): void {
    this.renderer.resize(width, height);
  }

  private initTitleScreen(): void {
    this.gameState = GameState.TITLE;
    this.previousGameState = GameState.TITLE;
    this.currentFloor = 1;
    this.logs = [];

    // Fallback dummy player to prevent undefined lookups before game start
    this.player = new Entity('player', 'Crypt Walker', '@', '#fbbf24', 0, 0, undefined, true);
  }

  public selectClass(classType: PlayerClassType): void {
    this.playerClass = classType;
    this.renderer.playerClass = classType;
    const def = CLASS_CATALOG[classType];

    this.player = new Entity('player', def.name, '@', '#fbbf24', 0, 0, undefined, true, {
      hp: def.baseHp,
      maxHp: def.baseHp,
      mana: def.baseMana,
      maxMana: def.baseMana,
      strength: def.strength,
      agility: def.agility,
      arcana: def.arcana,
      defense: def.defense
    });

    // Equip starting gear
    def.startingGear.forEach((gearKey) => {
      const item = LootManager.createItem(gearKey);
      if (item.equipSlot && !this.player.equipment[item.equipSlot]) {
        this.player.equipItem(item);
      } else {
        this.player.inventory.push(item);
      }
    });

    // Populate skills
    this.playerSkills = def.skills.map((s) => SkillManager.createSkill(s));

    this.currentFloor = 1;
    this.previousGameState = GameState.TITLE;
    this.gameState = GameState.TRANSITION;
    sound.startAmbientDrone();
  }

  private loadFloor(depth: number): void {
    this.currentFloor = depth;
    this.renderer.currentDepth = depth;
    this.player.stats.dungeonDepth = depth;
    this.monsters = [];
    this.itemsOnFloor = [];
    this.boss = null;
    this.particleEngine.clear();

    const gen = new DungeonGenerator(this.width, this.height);
    const level: GeneratedLevel = gen.generate(depth);

    this.tiles = level.tiles;
    this.lights = level.lights;
    this.stairsDownPos = level.stairsDownPos;

    // Place Player
    this.player.x = level.playerSpawn.x;
    this.player.y = level.playerSpawn.y;
    this.player.renderX = this.player.x;
    this.player.renderY = this.player.y;

    // Spawn Monsters
    level.monsterSpawns.forEach((spawn) => {
      let monsterType = spawn.type;
      if (!monsterType) {
        if (spawn.difficultyTier === 99) {
          monsterType = MonsterType.BOSS_MALAKOR;
        } else if (depth === 1) {
          monsterType = Math.random() < 0.6 ? MonsterType.CRYPT_RAT : MonsterType.SKELETON_WARRIOR;
        } else if (depth === 2) {
          monsterType = Math.random() < 0.5 ? MonsterType.SKELETON_ARCHER : MonsterType.ZOMBIE_BRUTE;
        } else if (depth === 3) {
          monsterType = Math.random() < 0.5 ? MonsterType.SHADOW_WRAITH : MonsterType.CULTIST_ACOLYTE;
        } else if (depth === 4) {
          monsterType = Math.random() < 0.5 ? MonsterType.CRYPT_KNIGHT : MonsterType.BLOOD_BAT;
        } else {
          monsterType = MonsterType.CRYPT_RAT;
        }
      }

      const monster = Entity.createMonster(monsterType, spawn.pos.x, spawn.pos.y);
      if (monsterType === MonsterType.MERCHANT_GRIMM) {
        monster.alignment = EntityAlignment.NEUTRAL;
      }
      this.monsters.push(monster);
      if (monsterType === MonsterType.BOSS_MALAKOR) {
        this.boss = monster;
      }
    });

    // Setup Shop if floor has merchant
    if (level.hasShop) {
      this.shopManager = new ShopManager(depth);
    } else {
      this.shopManager = null;
    }

    // Spawn Items
    level.itemSpawns.forEach((spawn) => {
      const item = LootManager.rollLoot(depth);
      this.itemsOnFloor.push({ pos: spawn.pos, item });
    });

    // Setup FOV
    this.visibilityEngine = new VisibilityEngine(
      this.width,
      this.height,
      (x, y) => this.tiles[y]?.[x]?.transparent ?? false
    );

    this.updateFOV();
    this.log(`Entered Depth ${depth}. The shadows deepen...`, '#38bdf8', 'system');
  }

  private initInput(): void {
    this.inputManager = new InputManager(this.canvas, {
      onDirectionInput: (dx, dy) => this.handlePlayerMove(dx, dy),
      onWaitTurn: () => this.handlePlayerWait(),
      onTileClick: (pos) => this.handleTileClick(pos),
      onTileHover: (pos) => this.handleTileHover(pos),
      onKeyAction: (action, data) => this.handleKeyAction(action, data),
      getTileSize: () => this.renderer.tileSize,
      getCameraOffset: () => ({ x: this.renderer.cameraX, y: this.renderer.cameraY })
    });
  }

  public handlePlayerMove(dx: number, dy: number): void {
    if (this.gameState !== GameState.PLAYING || this.isProcessingTurn) return;

    const targetX = this.player.x + dx;
    const targetY = this.player.y + dy;

    if (!this.isInBounds(targetX, targetY)) return;

    // 1. Check if talking to Merchant Grimm
    const npc = this.getMonsterAt(targetX, targetY);
    if (npc && npc.monsterType === MonsterType.MERCHANT_GRIMM) {
      sound.playCoinClink();
      this.previousGameState = this.gameState;
      this.gameState = GameState.SHOP;
      this.log('Merchant Grimm: "Greetings, traveler. Inspect my subterranean curiosities."', '#fbbf24', 'shop');
      return;
    }

    // 2. Check if attacking a hostile monster
    if (npc && npc.alignment === EntityAlignment.HOSTILE) {
      this.executeMeleeAttack(this.player, npc);
      this.endTurn();
      return;
    }

    const tile = this.tiles[targetY][targetX];

    // 3. Attack Explosive Barrel or Normal Barrel
    if (tile.type === TileType.EXPLOSIVE_BARREL || tile.type === TileType.BARREL) {
      this.hitBarrel(targetX, targetY, tile.type === TileType.EXPLOSIVE_BARREL);
      this.endTurn();
      return;
    }

    // 4. Attack Cracked Wall
    if (tile.type === TileType.CRACKED_WALL) {
      tile.type = TileType.FLOOR;
      tile.char = '.';
      tile.walkable = true;
      tile.transparent = true;
      sound.playMeleeHit(true);
      this.cameraShake.addTrauma(0.35);
      this.particleEngine.spawnBurst(targetX, targetY, '#f59e0b', 16);
      this.log('You smash through the cracked wall, revealing a hidden chamber!', '#f59e0b', 'story');
      this.updateFOV();
      this.endTurn();
      return;
    }

    // 5. Open closed door
    if (tile.type === TileType.DOOR_CLOSED) {
      tile.type = TileType.DOOR_OPEN;
      tile.char = "'";
      tile.transparent = true;
      tile.walkable = true;
      sound.playDoorOpen();
      this.log('You push open the heavy oak door.', '#d97706');
      this.updateFOV();
      this.endTurn();
      return;
    }

    // 6. Open chest
    if (tile.type === TileType.CHEST_CLOSED) {
      tile.type = TileType.CHEST_OPEN;
      tile.char = '-';
      sound.playShrineBlessing();
      const lootItems = LootManager.rollChestLoot(this.currentFloor);
      lootItems.forEach((it) => {
        this.player.inventory.push(it);
        this.log(`Opened treasure chest! Claimed: ${it.name}.`, it.color, 'item');
        this.particleEngine.spawnBurst(targetX, targetY, it.color, 10);
      });
      this.endTurn();
      return;
    }

    // 7. Walkable floor move
    if (tile.walkable) {
      this.player.x = targetX;
      this.player.y = targetY;
      sound.playFootstep();

      // Check stepped on stairs
      if (tile.type === TileType.STAIRS_DOWN) {
        this.log('You stand before the descent archway. Press > or click stairs to descend.', '#38bdf8', 'system');
      }

      // Check stepped on shrine/altar
      if (tile.type === TileType.SHRINE) {
        sound.playShrineBlessing();
        this.previousGameState = this.gameState;
        this.gameState = GameState.ALTAR;
        return;
      }

      // Check stepped on fountain
      if (tile.type === TileType.FOUNTAIN) {
        tile.type = TileType.FLOOR;
        tile.char = '.';
        sound.playPotionDrink();
        this.player.heal(50);
        this.player.restoreMana(30);
        this.particleEngine.spawnFloatingText(this.player.x, this.player.y, '+50 HP +30 MP', '#60a5fa', 18);
        this.log('You drink restorative crystalline water from the fountain.', '#60a5fa');
      }

      // Check stepped on hidden trap
      if (tile.type === TileType.TRAP) {
        tile.trapDiscovered = true;
        this.cameraShake.addTrauma(0.4);
        sound.playPlayerHurt();
        const trapDamage = 10 + this.currentFloor * 3;
        this.player.takeDamage(trapDamage);
        this.particleEngine.spawnFloatingText(this.player.x, this.player.y, `-${trapDamage}`, '#ef4444', 18);
        this.log(`You triggered a concealed spike trap! Suffered ${trapDamage} damage.`, '#ef4444', 'warning');
      }

      // Check item pickup
      for (let i = this.itemsOnFloor.length - 1; i >= 0; i--) {
        const floorItem = this.itemsOnFloor[i];
        if (floorItem.pos.x === targetX && floorItem.pos.y === targetY) {
          this.player.inventory.push(floorItem.item);
          sound.playItemPickup();
          this.log(`Picked up ${floorItem.item.name}.`, floorItem.item.color, 'item');
          this.itemsOnFloor.splice(i, 1);
        }
      }

      this.updateFOV();
      this.endTurn();
    }
  }

  public hitBarrel(x: number, y: number, isExplosive: boolean): void {
    this.tiles[y][x] = {
      type: TileType.FLOOR,
      char: '.',
      color: '#64748b',
      bgColor: '#1e293b',
      transparent: true,
      walkable: true,
      explored: true,
      visible: true,
      lightLevel: 0.8
    };

    if (isExplosive) {
      sound.playExplosion();
      this.cameraShake.addTrauma(0.75);
      this.particleEngine.spawnBurst(x, y, '#f97316', 26, 4.2);

      for (let ey = y - 1; ey <= y + 1; ey++) {
        for (let ex = x - 1; ex <= x + 1; ex++) {
          if (this.isInBounds(ex, ey)) {
            const targetMob = this.getMonsterAt(ex, ey);
            if (targetMob) {
              targetMob.takeDamage(40);
              this.particleEngine.spawnFloatingText(ex, ey, '-40 BLAST', '#ef4444', 18, true);
            }
            if (this.player.x === ex && this.player.y === ey) {
              this.player.takeDamage(20);
              sound.playPlayerHurt();
              this.particleEngine.spawnFloatingText(ex, ey, '-20 BLAST', '#ef4444', 18, true);
            }
            if (this.tiles[ey][ex].type === TileType.CRACKED_WALL) {
              this.tiles[ey][ex] = {
                type: TileType.FLOOR,
                char: '.',
                color: '#64748b',
                bgColor: '#1e293b',
                transparent: true,
                walkable: true,
                explored: true,
                visible: true,
                lightLevel: 0.8
              };
            }
          }
        }
      }
      this.log('The explosive barrel detonates in a violent fireball!', '#f97316', 'combat');
    } else {
      sound.playMeleeHit();
      this.particleEngine.spawnBurst(x, y, '#78350f', 12);
      if (Math.random() < 0.45) {
        this.itemsOnFloor.push({ pos: { x, y }, item: LootManager.rollLoot(this.currentFloor) });
        this.log('The oak barrel splinters open, dropping supplies!', '#38bdf8');
      }
    }
  }

  public handlePlayerWait(): void {
    if (this.gameState !== GameState.PLAYING || this.isProcessingTurn) return;
    this.player.restoreMana(4);
    this.log('You steady your breathing and recover 4 Mana.', '#94a3b8');
    this.endTurn();
  }

  private handleTileClick(pos: Position): void {
    if (this.gameState === GameState.TARGETING && this.targetingMode) {
      if (this.targetingMode.validTarget(pos.x, pos.y)) {
        this.targetingMode.onSelect(pos.x, pos.y);
        this.targetingMode = null;
        this.gameState = GameState.PLAYING;
      }
      return;
    }

    if (this.gameState !== GameState.PLAYING || this.isProcessingTurn) return;

    const dist = Math.hypot(pos.x - this.player.x, pos.y - this.player.y);
    if (dist <= 1.5) {
      const dx = pos.x - this.player.x;
      const dy = pos.y - this.player.y;
      this.handlePlayerMove(dx, dy);
      return;
    }

    const targetTile = this.tiles[pos.y]?.[pos.x];
    if (targetTile && targetTile.explored && targetTile.walkable) {
      const astar = new ROT.Path.AStar(pos.x, pos.y, (x, y) => {
        if (!this.isInBounds(x, y)) return false;
        return this.tiles[y][x].walkable;
      });

      const path: Position[] = [];
      astar.compute(this.player.x, this.player.y, (x, y) => path.push({ x, y }));

      if (path.length >= 2) {
        const nextStep = path[1];
        this.handlePlayerMove(nextStep.x - this.player.x, nextStep.y - this.player.y);
      }
    }
  }

  private handleTileHover(pos: Position | null): void {
    this.hoverTile = pos;
    if (pos && this.tiles[pos.y]?.[pos.x]?.explored && this.tiles[pos.y]?.[pos.x]?.walkable) {
      const astar = new ROT.Path.AStar(pos.x, pos.y, (x, y) => {
        if (!this.isInBounds(x, y)) return false;
        return this.tiles[y][x].walkable;
      });
      const path: Position[] = [];
      astar.compute(this.player.x, this.player.y, (x, y) => path.push({ x, y }));
      this.pathToTarget = path.slice(1);
    } else {
      this.pathToTarget = null;
    }
  }

  public useSkill(skillIndex: number): void {
    if (this.gameState !== GameState.PLAYING || this.isProcessingTurn) return;
    const skill = this.playerSkills[skillIndex];
    if (!skill) return;

    const check = SkillManager.canUseSkill(this.player, skill);
    if (!check.canUse) {
      this.log(check.reason!, '#f43f5e', 'warning');
      return;
    }

    if (!skill.requiresTarget) {
      this.executeSkillDirect(skill);
    } else {
      this.gameState = GameState.TARGETING;
      this.targetingMode = {
        active: true,
        skill,
        range: skill.range || 5,
        aoeRadius: skill.aoeRadius || 1,
        validTarget: (x, y) => {
          const dist = Math.hypot(x - this.player.x, y - this.player.y);
          return dist <= (skill.range || 5) && (this.tiles[y]?.[x]?.visible ?? false);
        },
        onSelect: (targetX, targetY) => {
          this.executeSkillTargeted(skill, targetX, targetY);
        }
      };
    }
  }

  private executeSkillDirect(skill: Skill): void {
    this.player.stats.mana -= skill.manaCost;
    skill.cooldownCurrent = skill.cooldownMax;

    if (skill.id === SkillType.WHIRLWIND) {
      sound.playMeleeHit(true);
      this.cameraShake.addTrauma(0.5);
      this.particleEngine.spawnBurst(this.player.x, this.player.y, '#f97316', 22, 3.5);

      const adjacentDmg = Math.round(this.player.getEffectiveAttackPower() * 1.4);
      this.monsters.forEach((m) => {
        if (m.alignment === EntityAlignment.HOSTILE && Math.hypot(m.x - this.player.x, m.y - this.player.y) <= 1.5) {
          m.takeDamage(adjacentDmg);
          this.particleEngine.spawnFloatingText(m.x, m.y, `-${adjacentDmg} WHIRLWIND`, '#f97316', 17, true);
        }
      });
      this.log('You unleash Whirlwind Strike, cleaving all adjacent foes!', '#f97316', 'skill');
    } else if (skill.id === SkillType.FROST_NOVA) {
      sound.playFreezeShimmer();
      this.cameraShake.addTrauma(0.4);
      this.particleEngine.spawnBurst(this.player.x, this.player.y, '#06b6d4', 24, 3.0);

      this.monsters.forEach((m) => {
        if (m.alignment === EntityAlignment.HOSTILE && Math.hypot(m.x - this.player.x, m.y - this.player.y) <= 2.5) {
          m.takeDamage(20);
          m.applyStatusEffect({
            type: 'FROZEN' as any,
            name: 'Deep Frozen',
            duration: 2,
            power: 0,
            color: '#06b6d4',
            icon: '❄'
          });
          this.particleEngine.spawnFloatingText(m.x, m.y, '-20 FROZEN', '#06b6d4', 17);
        }
      });
      this.log('A freezing wave erupts, deep-freezing nearby enemies!', '#06b6d4', 'skill');
    } else if (skill.id === SkillType.SMOKE_BOMB) {
      sound.playSpellCast('dark');
      this.player.applyStatusEffect({
        type: 'INVISIBLE' as any,
        name: 'Smoke Cloak',
        duration: 6,
        power: 1,
        color: '#94a3b8',
        icon: '💨'
      });
      this.particleEngine.spawnBurst(this.player.x, this.player.y, '#94a3b8', 20, 2.5);
      this.log('You drop a smoke bomb and vanish into thin air!', '#94a3b8', 'skill');
    } else if (skill.id === SkillType.DIVINE_HEAL) {
      sound.playShrineBlessing();
      this.player.heal(50);
      this.player.statusEffects = [];
      this.particleEngine.spawnFloatingText(this.player.x, this.player.y, '+50 HP CLEANSED', '#34d399', 18);
      this.log('Divine Grace restores 50 Health and purges all negative afflictions!', '#34d399', 'skill');
    }

    this.endTurn();
  }

  private executeSkillTargeted(skill: Skill, targetX: number, targetY: number): void {
    this.player.stats.mana -= skill.manaCost;
    skill.cooldownCurrent = skill.cooldownMax;

    if (skill.id === SkillType.FIREBOLT) {
      sound.playSpellCast('fire');
      this.particleEngine.spawnProjectile(
        { x: this.player.x, y: this.player.y },
        { x: targetX, y: targetY },
        '#f97316',
        '•',
        '#ea580c',
        14,
        () => {
          sound.playMeleeHit(true);
          const target = this.getMonsterAt(targetX, targetY);
          if (target) {
            target.takeDamage(28);
            this.particleEngine.spawnFloatingText(targetX, targetY, '-28 FIRE', '#f97316', 18, true);
          }
          this.log(`Firebolt strikes with intense arcane flame!`, '#f97316', 'skill');
          this.endTurn();
        }
      );
    } else if (skill.id === SkillType.SHADOW_STEP) {
      sound.playSpellCast('teleport');
      this.player.x = targetX + (targetX > this.player.x ? -1 : 1);
      this.player.y = targetY;
      this.updateFOV();

      const target = this.getMonsterAt(targetX, targetY);
      if (target) {
        this.executeMeleeAttack(this.player, target, true);
      }
      this.log(`Shadow Step: Teleported behind the enemy with guaranteed Critical Strike!`, '#c084fc', 'skill');
      this.endTurn();
    } else if (skill.id === SkillType.BLINK) {
      sound.playSpellCast('teleport');
      this.player.x = targetX;
      this.player.y = targetY;
      this.updateFOV();
      this.particleEngine.spawnBurst(targetX, targetY, '#a855f7', 16);
      this.log(`Arcane Blink: Teleported across the room!`, '#a855f7', 'skill');
      this.endTurn();
    } else if (skill.id === SkillType.HOLY_SMITE) {
      sound.playSpellCast('holy');
      this.cameraShake.addTrauma(0.5);
      const target = this.getMonsterAt(targetX, targetY);
      if (target) {
        target.takeDamage(45);
        this.particleEngine.spawnBurst(targetX, targetY, '#fbbf24', 18);
        this.particleEngine.spawnFloatingText(targetX, targetY, '-45 SMITE', '#fbbf24', 18, true);
      }
      this.log(`Smite Undead calls down radiant celestial retribution!`, '#fbbf24', 'skill');
      this.endTurn();
    }
  }

  private executeMeleeAttack(attacker: Entity, defender: Entity, forceCrit: boolean = false): void {
    attacker.startBumpAnimation(defender.x, defender.y);
    const result = CombatEngine.executeAttack(attacker, defender);
    if (forceCrit) result.isCrit = true;

    if (result.hit) {
      sound.playMeleeHit(result.isCrit);
      if (result.isCrit) {
        this.cameraShake.addTrauma(0.5);
      }

      // Relic procs
      if (attacker.isPlayer) {
        const attackCount = RelicManager.incrementAttackCounter();

        // 1. Thunderstone Charm
        if (RelicManager.hasRelic(attacker.equipment as any, RelicProcType.THUNDER_STRIKE) && attackCount % 3 === 0) {
          sound.playLightning();
          this.cameraShake.addTrauma(0.4);
          this.monsters.forEach((m) => {
            if (m !== defender && m.alignment === EntityAlignment.HOSTILE && Math.hypot(m.x - defender.x, m.y - defender.y) <= 3) {
              m.takeDamage(15);
              this.particleEngine.spawnFloatingText(m.x, m.y, '-15 CHAIN LIGHTNING', '#38bdf8', 16);
              this.particleEngine.spawnBurst(m.x, m.y, '#38bdf8', 10);
            }
          });
        }

        // 2. Vampire Fang
        if (result.isCrit && RelicManager.hasRelic(attacker.equipment as any, RelicProcType.VAMPIRE_FANG)) {
          const lifesteal = Math.round(result.mitigatedDamage * 0.25);
          attacker.heal(lifesteal);
          this.particleEngine.spawnFloatingText(attacker.x, attacker.y, `+${lifesteal} VAMPIRIC`, '#ef4444', 16);
        }

        // 3. Frostbite Band
        if (RelicManager.hasRelic(attacker.equipment as any, RelicProcType.FROST_TOUCH) && Math.random() < 0.25) {
          defender.applyStatusEffect({
            type: 'FROZEN' as any,
            name: 'Frostbitten',
            duration: 2,
            power: 0,
            color: '#06b6d4',
            icon: '❄'
          });
        }

        // 4. Molten Core
        if (RelicManager.hasRelic(attacker.equipment as any, RelicProcType.MOLTEN_CORE)) {
          defender.takeDamage(6);
          this.particleEngine.spawnBurst(defender.x, defender.y, '#f97316', 6);
        }
      }

      this.particleEngine.spawnFloatingText(
        defender.x,
        defender.y,
        `${result.isCrit ? 'CRIT ' : ''}${result.mitigatedDamage}`,
        result.isCrit ? '#ef4444' : '#f59e0b',
        16,
        result.isCrit
      );
      this.particleEngine.spawnBurst(defender.x, defender.y, '#dc2626', result.isCrit ? 16 : 8, 2.5, true);

      if (result.targetKilled) {
        sound.playMonsterDeath(defender.monsterType === MonsterType.BOSS_MALAKOR);
        this.particleEngine.spawnBurst(defender.x, defender.y, '#e2e8f0', 18, 3.5, false);

        if (attacker.isPlayer && RelicManager.hasRelic(attacker.equipment as any, RelicProcType.NECRO_MINION) && Math.random() < 0.3) {
          const ally = Entity.createMonster(MonsterType.FRIENDLY_SKELETON, defender.x, defender.y);
          ally.alignment = EntityAlignment.ALLY;
          this.monsters.push(ally);
          this.particleEngine.spawnBurst(defender.x, defender.y, '#38bdf8', 16);
          this.log('Slain monster reanimates as a loyal Skeleton Ally!', '#38bdf8', 'story');
        }

        if (defender.monsterType === MonsterType.BOSS_MALAKOR) {
          this.gameState = GameState.VICTORY;
          sound.playLevelUp();
          this.log('MALAKOR THE NECROMANCER LORD IS VANQUISHED!', '#f59e0b', 'story');
        }
      }
    } else {
      sound.playMeleeMiss();
      this.particleEngine.spawnFloatingText(defender.x, defender.y, 'MISS', '#94a3b8', 14);
    }

    this.log(result.message, result.isCrit ? '#ef4444' : '#e2e8f0', 'combat');
  }

  public autoExplore(): void {
    if (this.gameState !== GameState.PLAYING || this.isProcessingTurn || this.isAutoExploring) return;

    const visibleMonster = this.monsters.some((m) => m.alignment === EntityAlignment.HOSTILE && this.tiles[m.y]?.[m.x]?.visible);
    if (visibleMonster) {
      this.log('Cannot auto-explore while hostiles are in sight!', '#f43f5e', 'warning');
      return;
    }

    let nearestTarget: Position | null = null;
    let shortestDist = Infinity;

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const tile = this.tiles[y][x];
        if (!tile.explored && tile.walkable) {
          const dist = Math.hypot(x - this.player.x, y - this.player.y);
          if (dist < shortestDist) {
            shortestDist = dist;
            nearestTarget = { x, y };
          }
        }
      }
    }

    if (!nearestTarget) {
      this.log('All areas explored on this floor! Proceed to the stairs (>).', '#38bdf8');
      return;
    }

    const astar = new ROT.Path.AStar(nearestTarget.x, nearestTarget.y, (x, y) => {
      if (!this.isInBounds(x, y)) return false;
      return this.tiles[y][x].walkable;
    });

    const path: Position[] = [];
    astar.compute(this.player.x, this.player.y, (x, y) => path.push({ x, y }));

    if (path.length >= 2) {
      const next = path[1];
      this.handlePlayerMove(next.x - this.player.x, next.y - this.player.y);
    }
  }

  public quickHeal(): void {
    if (this.gameState !== GameState.PLAYING || this.isProcessingTurn) return;
    const potion = this.player.inventory.find((i) => i.type === ItemType.POTION && (i.healAmount || 0) > 0);
    if (potion) {
      this.useItem(potion);
    } else {
      this.log('No health potions available in knapsack.', '#f43f5e', 'warning');
    }
  }

  public quickMana(): void {
    if (this.gameState !== GameState.PLAYING || this.isProcessingTurn) return;
    const potion = this.player.inventory.find((i) => i.type === ItemType.POTION && (i.manaAmount || 0) > 0);
    if (potion) {
      this.useItem(potion);
    } else {
      this.log('No mana potions available in knapsack.', '#f43f5e', 'warning');
    }
  }

  private endTurn(): void {
    this.isProcessingTurn = true;
    this.player.stats.turnsElapsed++;

    // Check Level Up
    if (this.player.stats.xp >= this.player.stats.xpToNextLevel) {
      this.triggerLevelUp();
    }

    // 1. Tick Skill Cooldowns
    SkillManager.tickCooldowns(this.playerSkills);

    // 2. Tick Player status effects
    const pStatus = this.player.tickStatusEffects();
    pStatus.messages.forEach((m) => this.log(m, '#10b981', 'warning'));
    if (this.player.stats.hp <= 0) {
      this.handlePlayerDeath();
      this.isProcessingTurn = false;
      return;
    }

    // 3. Monsters & Allies Turn Dispatch
    this.monsters.forEach((monster) => {
      if (monster.stats.hp <= 0) return;
      monster.tickStatusEffects();
      if (monster.stats.hp <= 0) return;

      if (monster.alignment === EntityAlignment.ALLY) {
        const hostiles = this.monsters.filter((m) => m.alignment === EntityAlignment.HOSTILE && m.stats.hp > 0);
        if (hostiles.length > 0) {
          hostiles.sort((a, b) => Math.hypot(a.x - monster.x, a.y - monster.y) - Math.hypot(b.x - monster.x, b.y - monster.y));
          const target = hostiles[0];
          const dist = Math.hypot(target.x - monster.x, target.y - monster.y);
          if (dist <= 1.5) {
            this.executeMeleeAttack(monster, target);
          } else {
            const next = MonsterAI.findNextStep(monster, { x: target.x, y: target.y }, this.tiles, this.monsters, this.width, this.height);
            if (next) {
              monster.x = next.x;
              monster.y = next.y;
            }
          }
        }
        return;
      }

      if (monster.alignment === EntityAlignment.NEUTRAL) return;

      const action = MonsterAI.planTurn(monster, this.player, this.tiles, this.monsters, this.width, this.height);

      if (action.type === 'MOVE' && action.targetPos) {
        monster.x = action.targetPos.x;
        monster.y = action.targetPos.y;
      } else if (action.type === 'MELEE_ATTACK') {
        this.executeMeleeAttack(monster, this.player);
      } else if (action.type === 'RANGED_ATTACK' && action.targetPos) {
        sound.playSpellCast('dark');
        this.particleEngine.spawnProjectile(
          { x: monster.x, y: monster.y },
          action.targetPos,
          '#facc15',
          '•',
          '#ca8a04',
          10,
          () => {
            const res = CombatEngine.executeAttack(monster, this.player);
            sound.playPlayerHurt();
            this.cameraShake.addTrauma(0.25);
            this.particleEngine.spawnFloatingText(this.player.x, this.player.y, `-${res.mitigatedDamage}`, '#facc15', 16);
            this.log(res.message, '#facc15', 'combat');
            if (this.player.stats.hp <= 0) this.handlePlayerDeath();
          }
        );
      } else if (action.type === 'SPELL' && action.targetPos) {
        sound.playSpellCast('dark');
        this.particleEngine.spawnProjectile(
          { x: monster.x, y: monster.y },
          action.targetPos,
          '#a855f7',
          '✦',
          '#c084fc',
          9,
          () => {
            const dmg = action.damage || 15;
            this.player.takeDamage(dmg);
            sound.playPlayerHurt();
            this.cameraShake.addTrauma(0.4);
            this.particleEngine.spawnFloatingText(this.player.x, this.player.y, `-${dmg} (${action.spellName})`, '#a855f7', 17);
            this.log(`${monster.name} casts ${action.spellName} for ${dmg} dark damage!`, '#a855f7', 'combat');
            if (this.player.stats.hp <= 0) this.handlePlayerDeath();
          }
        );
      } else if (action.type === 'SUMMON' && action.summonType) {
        sound.playSpellCast('dark');
        const summonPos = { x: monster.x + (Math.random() < 0.5 ? 1 : -1), y: monster.y };
        if (this.isInBounds(summonPos.x, summonPos.y) && this.tiles[summonPos.y][summonPos.x].walkable) {
          const summoned = Entity.createMonster(action.summonType, summonPos.x, summonPos.y);
          this.monsters.push(summoned);
          this.particleEngine.spawnBurst(summonPos.x, summonPos.y, '#a855f7', 14);
          this.log(`${monster.name} chants ${action.spellName} and raises a ${summoned.name}!`, '#c084fc', 'story');
        }
      }
    });

    this.monsters = this.monsters.filter((m) => m.stats.hp > 0);

    this.updateFOV();
    if (this.player.stats.hp <= 0) {
      this.handlePlayerDeath();
    }

    this.isProcessingTurn = false;
  }

  private triggerLevelUp(): void {
    sound.playLevelUp();
    this.player.stats.level++;
    this.player.stats.xp -= this.player.stats.xpToNextLevel;
    this.player.stats.xpToNextLevel = Math.round(this.player.stats.xpToNextLevel * 1.5);

    // Roll 3 perks
    this.currentLevelUpPerks = [
      {
        id: 'vigor',
        title: "Titan's Vitality",
        description: 'Permanently increases Max Health by +25 and instantly restores full Health.',
        icon: 'HEART',
        apply: (p: Entity) => {
          p.stats.maxHp += 25;
          p.stats.hp = p.stats.maxHp;
        }
      },
      {
        id: 'bloodthirst',
        title: 'Bloodlust Fury',
        description: 'Permanently grants +3 Attack Power and +5% Critical Strike multiplier.',
        icon: 'SWORD',
        apply: (p: Entity) => {
          p.stats.strength += 3;
        }
      },
      {
        id: 'aegis',
        title: 'Adamantine Ward',
        description: 'Permanently grants +3 Defense Armor and +15 Max Mana.',
        icon: 'SHIELD',
        apply: (p: Entity) => {
          p.stats.defense += 3;
          p.stats.maxMana += 15;
          p.stats.mana = p.stats.maxMana;
        }
      }
    ];

    this.previousGameState = this.gameState;
    this.gameState = GameState.LEVEL_UP;
  }

  private handlePlayerDeath(): void {
    this.gameState = GameState.GAME_OVER;
    sound.playPlayerHurt();
    this.cameraShake.addTrauma(0.8);
    this.log('You have fallen in battle. Darkness claims your soul...', '#ef4444', 'story');
  }

  public descendStairs(): void {
    if (this.player.x === this.stairsDownPos.x && this.player.y === this.stairsDownPos.y) {
      if (this.currentFloor < this.maxFloor) {
        sound.playStairsDescent();
        this.currentFloor++;
        this.previousGameState = GameState.PLAYING;
        this.gameState = GameState.TRANSITION;
      } else {
        this.log("You stand at the heart of Malakor's Sanctum.", '#e11d48');
      }
    } else {
      this.log('There are no stairs to descend here.', '#94a3b8');
    }
  }

  public updateFOV(): void {
    if (!this.visibilityEngine) return;
    const viewRadius = 8 + (this.player.equipment[EquipSlot.RING]?.name.includes('Shadow') ? 3 : 0);
    this.visibilityEngine.updateVisibility(
      { x: this.player.x, y: this.player.y },
      viewRadius,
      this.tiles,
      this.lights,
      performance.now() / 1000
    );
  }

  public handleUIAction(action: string, data?: any): void {
    switch (action) {
      case 'START_GAME':
        this.previousGameState = GameState.TITLE;
        this.gameState = GameState.CLASS_SELECT;
        break;
      case 'SELECT_CLASS':
        if (data?.classType) this.selectClass(data.classType);
        break;
      case 'CONTINUE_DESCENT':
        this.loadFloor(this.currentFloor);
        this.gameState = GameState.PLAYING;
        break;
      case 'SELECT_LEVEL_PERK':
        if (typeof data?.perkIndex === 'number' && this.currentLevelUpPerks[data.perkIndex]) {
          this.currentLevelUpPerks[data.perkIndex].apply(this.player);
          this.log(`Gained Boon: ${this.currentLevelUpPerks[data.perkIndex].title}!`, '#fbbf24', 'story');
          this.gameState = GameState.PLAYING;
        }
        break;
      case 'USE_SKILL':
        if (typeof data?.skillIndex === 'number') this.useSkill(data.skillIndex);
        break;
      case 'AUTO_EXPLORE':
        this.autoExplore();
        break;
      case 'TOGGLE_CODEX':
        if (this.gameState === GameState.CODEX) {
          this.gameState = this.previousGameState;
        } else {
          this.previousGameState = this.gameState;
          this.gameState = GameState.CODEX;
        }
        break;
      case 'BUY_SHOP_ITEM':
        if (this.shopManager && data?.entryId) {
          const res = this.shopManager.buyItem(data.entryId, this.player.stats.gold);
          if (res.success && res.item && res.cost) {
            this.player.stats.gold -= res.cost;
            sound.playCoinClink();
            this.player.inventory.push(res.item);
            this.log(`Purchased ${res.item.name} for ${res.cost} Gold!`, '#f59e0b', 'shop');
          }
        }
        break;
      case 'SELL_SHOP_ITEM':
        if (this.shopManager && data?.item) {
          const val = this.shopManager.getSellValue(data.item);
          const idx = this.player.inventory.indexOf(data.item);
          if (idx >= 0) {
            this.player.inventory.splice(idx, 1);
            this.player.stats.gold += val;
            sound.playCoinClink();
            this.log(`Sold ${data.item.name} for ${val} Gold.`, '#10b981', 'shop');
          }
        }
        break;
      case 'ALTAR_OFFERING':
        if (data?.choice === 'GOLD') {
          if (this.player.stats.gold >= 50) {
            this.player.stats.gold -= 50;
            this.player.stats.maxMana += 15;
            this.player.stats.mana = this.player.stats.maxMana;
            sound.playShrineBlessing();
            this.particleEngine.spawnFloatingText(this.player.x, this.player.y, '+15 MAX MANA & CRIT', '#c084fc', 18);
            this.log('Altar accepts gold offering: Granted +15 Max Mana & +10% Crit!', '#c084fc', 'story');
            this.gameState = GameState.PLAYING;
          } else {
            this.log('Not enough gold (50 required).', '#f43f5e', 'warning');
          }
        } else if (data?.choice === 'BLOOD') {
          if (this.player.stats.hp > 25) {
            this.player.takeDamage(20);
            this.player.stats.strength += 4;
            this.player.stats.defense += 2;
            sound.playMeleeHit(true);
            this.cameraShake.addTrauma(0.5);
            this.particleEngine.spawnFloatingText(this.player.x, this.player.y, '+4 STR +2 DEF', '#ef4444', 18);
            this.log('Blood sacrifice accepted: +4 Strength and +2 Defense granted!', '#ef4444', 'story');
            this.gameState = GameState.PLAYING;
          } else {
            this.log('Vitality too low to survive sacrifice!', '#f43f5e', 'warning');
          }
        }
        break;
      case 'TOGGLE_SOUND':
        sound.toggleMute();
        break;
      case 'TOGGLE_INVENTORY':
        if (this.gameState === GameState.INVENTORY) {
          this.gameState = this.previousGameState;
        } else {
          this.previousGameState = this.gameState;
          this.gameState = GameState.INVENTORY;
        }
        break;
      case 'CLOSE_MODAL':
        this.gameState = this.previousGameState;
        break;
      case 'RESTART_GAME':
        this.initTitleScreen();
        break;
      case 'USE_ITEM':
        if (data?.item) this.useItem(data.item);
        break;
      case 'DROP_ITEM':
        if (data?.item) this.dropItem(data.item);
        break;
      case 'UNEQUIP_ITEM':
        if (data?.slot) {
          this.player.unequipItem(data.slot);
          sound.playItemPickup();
        }
        break;
    }
  }

  private useItem(item: Item): void {
    if (item.equipSlot) {
      this.player.equipItem(item);
      sound.playItemPickup();
      this.log(`Equipped ${item.name}.`, '#38bdf8', 'item');
      this.gameState = GameState.PLAYING;
      this.endTurn();
      return;
    }

    if (item.type === ItemType.POTION) {
      const idx = this.player.inventory.indexOf(item);
      if (idx >= 0) this.player.inventory.splice(idx, 1);
      sound.playPotionDrink();

      if (item.healAmount) {
        const healed = this.player.heal(item.healAmount);
        this.particleEngine.spawnFloatingText(this.player.x, this.player.y, `+${healed} HP`, '#10b981', 18);
        this.log(`Drank ${item.name} and restored ${healed} Health.`, '#10b981', 'item');
      }
      if (item.manaAmount) {
        const restored = this.player.restoreMana(item.manaAmount);
        this.particleEngine.spawnFloatingText(this.player.x, this.player.y, `+${restored} MP`, '#3b82f6', 18);
        this.log(`Drank ${item.name} and restored ${restored} Mana.`, '#3b82f6', 'item');
      }
      if (item.effectType && item.effectDuration) {
        this.player.applyStatusEffect({
          type: item.effectType,
          name: item.name,
          duration: item.effectDuration,
          power: item.effectPower || 1,
          color: item.color,
          icon: '✨'
        });
        this.log(`Gained effect: ${item.name}!`, item.color, 'item');
      }

      this.gameState = GameState.PLAYING;
      this.endTurn();
      return;
    }

    if (item.type === ItemType.SCROLL) {
      if (item.name.includes('Fireball')) {
        this.gameState = GameState.TARGETING;
        this.targetingMode = {
          active: true,
          item,
          range: item.range || 7,
          aoeRadius: item.aoeRadius || 2,
          validTarget: (x, y) => {
            const dist = Math.hypot(x - this.player.x, y - this.player.y);
            return dist <= (item.range || 7) && (this.tiles[y]?.[x]?.visible ?? false);
          },
          onSelect: (targetX, targetY) => {
            const idx = this.player.inventory.indexOf(item);
            if (idx >= 0) this.player.inventory.splice(idx, 1);

            sound.playSpellCast('fire');
            this.particleEngine.spawnProjectile(
              { x: this.player.x, y: this.player.y },
              { x: targetX, y: targetY },
              '#f97316',
              '•',
              '#ea580c',
              12,
              () => {
                this.cameraShake.addTrauma(0.6);
                sound.playMeleeHit(true);
                this.monsters.forEach((m) => {
                  if (Math.hypot(m.x - targetX, m.y - targetY) <= (item.aoeRadius || 2)) {
                    m.takeDamage(item.effectPower || 30);
                    this.particleEngine.spawnFloatingText(m.x, m.y, `-${item.effectPower || 30}`, '#f97316', 18, true);
                    this.particleEngine.spawnBurst(m.x, m.y, '#f97316', 14);
                  }
                });
                this.log(`Fireball erupted dealing ${item.effectPower} damage!`, '#f97316', 'combat');
                this.endTurn();
              }
            );
          }
        };
        return;
      }

      if (item.name.includes('Holy Light')) {
        const idx = this.player.inventory.indexOf(item);
        if (idx >= 0) this.player.inventory.splice(idx, 1);

        sound.playSpellCast('holy');
        this.cameraShake.addTrauma(0.4);
        this.player.heal(item.healAmount || 20);

        this.monsters.forEach((m) => {
          if (this.tiles[m.y]?.[m.x]?.visible) {
            m.takeDamage(item.effectPower || 25);
            this.particleEngine.spawnFloatingText(m.x, m.y, `-${item.effectPower || 25}`, '#fbbf24', 18);
            this.particleEngine.spawnBurst(m.x, m.y, '#fbbf24', 12);
          }
        });
        this.log('Radiant holy light purges the chamber!', '#fbbf24', 'combat');
        this.gameState = GameState.PLAYING;
        this.endTurn();
        return;
      }
    }
  }

  private dropItem(item: Item): void {
    const idx = this.player.inventory.indexOf(item);
    if (idx >= 0) {
      this.player.inventory.splice(idx, 1);
      this.itemsOnFloor.push({ pos: { x: this.player.x, y: this.player.y }, item });
      this.log(`Dropped ${item.name}.`, '#94a3b8');
    }
  }

  public handleKeyAction(action: string, data?: any): void {
    if (action === 'SPACE_OR_ENTER') {
      if (this.gameState === GameState.TRANSITION) {
        this.handleUIAction('CONTINUE_DESCENT');
      } else if (this.gameState === GameState.PLAYING) {
        this.handlePlayerWait();
      }
      return;
    }

    if (this.gameState === GameState.TRANSITION && action === 'ESCAPE') {
      this.handleUIAction('CONTINUE_DESCENT');
      return;
    }

    switch (action) {
      case 'USE_SKILL':
        if (typeof data?.skillIndex === 'number') this.useSkill(data.skillIndex);
        break;
      case 'AUTO_EXPLORE':
        this.autoExplore();
        break;
      case 'QUICK_HEAL':
        this.quickHeal();
        break;
      case 'QUICK_MANA':
        this.quickMana();
        break;
      case 'TOGGLE_INVENTORY':
        this.handleUIAction('TOGGLE_INVENTORY');
        break;
      case 'TOGGLE_HELP':
      case 'TOGGLE_CODEX':
        this.handleUIAction('TOGGLE_CODEX');
        break;
      case 'ESCAPE':
        if (this.gameState === GameState.TARGETING) {
          this.targetingMode = null;
          this.gameState = GameState.PLAYING;
        } else if (
          this.gameState === GameState.SHOP ||
          this.gameState === GameState.ALTAR ||
          this.gameState === GameState.INVENTORY ||
          this.gameState === GameState.CODEX ||
          this.gameState === GameState.HELP
        ) {
          this.gameState = this.previousGameState;
        }
        break;
      case 'DESCEND_STAIRS':
        this.descendStairs();
        break;
    }
  }

  public log(text: string, color: string = '#e2e8f0', category: 'combat' | 'item' | 'system' | 'story' | 'warning' | 'shop' | 'skill' = 'system'): void {
    this.logs.push({
      id: Math.random().toString(36).substring(2, 9),
      text,
      color,
      turn: this.player?.stats.turnsElapsed || 0,
      category
    });
  }

  private getMonsterAt(x: number, y: number): Entity | null {
    return this.monsters.find((m) => m.stats.hp > 0 && m.x === x && m.y === y) || null;
  }

  private isInBounds(x: number, y: number): boolean {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  private startLoop(): void {
    const loop = (currentTime: number) => {
      const dt = Math.min(0.1, (currentTime - this.lastTime) / 1000);
      this.lastTime = currentTime;

      this.player.updateAnimation(dt);
      this.monsters.forEach((m) => m.updateAnimation(dt));

      this.particleEngine.update(dt, (bX, bY, color) => {
        if (this.isInBounds(bX, bY)) {
          this.tiles[bY][bX].bloodLevel = Math.min(1.0, (this.tiles[bY][bX].bloodLevel || 0) + 0.3);
          this.tiles[bY][bX].bloodColor = color;
        }
      });

      this.renderer.render(
        this.tiles,
        this.player,
        this.monsters,
        this.itemsOnFloor,
        this.particleEngine,
        this.cameraShake,
        dt,
        this.hoverTile,
        this.pathToTarget
      );

      this.hud.render(
        this.player,
        this.logs,
        this.gameState,
        this.currentFloor,
        this.tiles,
        this.boss,
        this.playerSkills,
        this.shopManager?.getStock() || [],
        this.currentLevelUpPerks
      );

      requestAnimationFrame(loop);
    };

    this.lastTime = performance.now();
    requestAnimationFrame(loop);
  }
}
