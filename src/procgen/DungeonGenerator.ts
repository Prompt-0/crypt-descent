import { Tile, TileType, Position, LightSource, MonsterType } from '../types';
import * as ROT from 'rot-js';

export interface DungeonRoom {
  x: number;
  y: number;
  w: number;
  h: number;
  isSpecial?: boolean;
  specialType?: 'SHRINE' | 'FOUNTAIN' | 'VAULT' | 'SHOP' | 'BOSS';
}

export interface GeneratedLevel {
  width: number;
  height: number;
  tiles: Tile[][];
  rooms: DungeonRoom[];
  playerSpawn: Position;
  stairsDownPos: Position;
  stairsUpPos?: Position;
  monsterSpawns: { pos: Position; difficultyTier: number; type?: MonsterType }[];
  itemSpawns: { pos: Position; tier: number }[];
  chests: Position[];
  lights: LightSource[];
  depth: number;
  hasShop?: boolean;
}

export class DungeonGenerator {
  private width: number;
  private height: number;

  constructor(width: number = 60, height: number = 40) {
    this.width = width;
    this.height = height;
  }

  public generate(depth: number = 1): GeneratedLevel {
    if (depth === 5) {
      return this.generateBossFloor(depth);
    }

    const tiles: Tile[][] = this.createEmptyGrid();
    const rooms: DungeonRoom[] = [];
    const lights: LightSource[] = [];

    // Use ROT.js Digger for room layout
    const digger = new ROT.Map.Digger(this.width, this.height, {
      roomWidth: [5, 12],
      roomHeight: [5, 10],
      corridorLength: [2, 6],
      dugPercentage: 0.35
    });

    digger.create((x, y, value) => {
      if (value === 0) {
        tiles[y][x] = this.createFloorTile(depth);
      }
    });

    const rotRooms = digger.getRooms();
    rotRooms.forEach((r) => {
      const x = r.getLeft();
      const y = r.getTop();
      const w = r.getRight() - r.getLeft() + 1;
      const h = r.getBottom() - r.getTop() + 1;
      rooms.push({ x, y, w, h });

      // Torch in center
      if (Math.random() < 0.8) {
        lights.push({
          x: Math.floor(x + w / 2),
          y: Math.floor(y + h / 2),
          radius: 5.5,
          color: depth === 4 ? [230, 80, 50] : [245, 158, 50],
          intensity: 0.9,
          flickerRate: 8.0
        });
      }

      // Doors
      r.getDoors((doorX, doorY) => {
        if (this.isInBounds(doorX, doorY) && tiles[doorY][doorX].type === TileType.FLOOR) {
          tiles[doorY][doorX] = this.createDoorTile();
        }
      });
    });

    // Special Floor Features: Merchant Grimm Shop Room on Floor 2 and 4
    let hasShop = false;
    const monsterSpawns: { pos: Position; difficultyTier: number; type?: MonsterType }[] = [];

    if ((depth === 2 || depth === 4) && rooms.length >= 4) {
      hasShop = true;
      const shopRoom = rooms[rooms.length - 2];
      shopRoom.isSpecial = true;
      shopRoom.specialType = 'SHOP';
      const sX = Math.floor(shopRoom.x + shopRoom.w / 2);
      const sY = Math.floor(shopRoom.y + shopRoom.h / 2);

      // Carpet decor
      for (let cy = shopRoom.y + 1; cy < shopRoom.y + shopRoom.h - 1; cy++) {
        for (let cx = shopRoom.x + 1; cx < shopRoom.x + shopRoom.w - 1; cx++) {
          if (tiles[cy][cx].walkable) {
            tiles[cy][cx].bgColor = '#451a03'; // Velvet carpet
          }
        }
      }

      monsterSpawns.push({
        pos: { x: sX, y: sY },
        difficultyTier: 0,
        type: MonsterType.MERCHANT_GRIMM
      });

      lights.push({
        x: sX,
        y: sY,
        radius: 6,
        color: [251, 191, 36],
        intensity: 1.0,
        flickerRate: 5.0
      });
    }

    // Special Altar & Fountain Rooms
    if (rooms.length >= 3) {
      const shrineRoom = rooms[1];
      shrineRoom.isSpecial = true;
      shrineRoom.specialType = 'SHRINE';
      const shrineX = Math.floor(shrineRoom.x + shrineRoom.w / 2);
      const shrineY = Math.floor(shrineRoom.y + shrineRoom.h / 2);
      tiles[shrineY][shrineX] = this.createShrineTile();
      lights.push({
        x: shrineX,
        y: shrineY,
        radius: 4,
        color: [168, 85, 247],
        intensity: 0.95,
        flickerRate: 4.0
      });

      if (rooms.length >= 5) {
        const fountainRoom = rooms[2];
        fountainRoom.isSpecial = true;
        fountainRoom.specialType = 'FOUNTAIN';
        const fX = Math.floor(fountainRoom.x + fountainRoom.w / 2);
        const fY = Math.floor(fountainRoom.y + fountainRoom.h / 2);
        tiles[fY][fX] = this.createFountainTile();
        lights.push({
          x: fX,
          y: fY,
          radius: 4,
          color: [59, 130, 246],
          intensity: 0.85
        });
      }
    }

    // Player Spawn & Stairs
    const startRoom = rooms[0] || { x: 5, y: 5, w: 6, h: 6 };
    const endRoom = rooms[rooms.length - 1] || { x: this.width - 10, y: this.height - 10, w: 6, h: 6 };

    const playerSpawn: Position = {
      x: Math.floor(startRoom.x + startRoom.w / 2),
      y: Math.floor(startRoom.y + startRoom.h / 2)
    };
    tiles[playerSpawn.y][playerSpawn.x] = this.createFloorTile(depth);

    const stairsDownPos: Position = {
      x: Math.floor(endRoom.x + endRoom.w / 2),
      y: Math.floor(endRoom.y + endRoom.h / 2)
    };
    tiles[stairsDownPos.y][stairsDownPos.x] = this.createStairsDownTile();

    const itemSpawns: { pos: Position; tier: number }[] = [];
    const chests: Position[] = [];

    // Populate rooms with monsters, barrels, cracked secret walls, oil/water puddles
    for (let i = 1; i < rooms.length; i++) {
      const room = rooms[i];
      if (room.specialType === 'SHOP') continue; // Don't spawn hostile mobs in shop

      const monsterCount = Math.floor(Math.random() * 3) + 1 + Math.floor(depth / 2);
      for (let m = 0; m < monsterCount; m++) {
        const mx = room.x + 1 + Math.floor(Math.random() * Math.max(1, room.w - 2));
        const my = room.y + 1 + Math.floor(Math.random() * Math.max(1, room.h - 2));
        if (tiles[my][mx].walkable && !(mx === stairsDownPos.x && my === stairsDownPos.y)) {
          monsterSpawns.push({
            pos: { x: mx, y: my },
            difficultyTier: depth + (room === endRoom ? 1 : 0)
          });
        }
      }

      // Spawn Explosive Barrels & Normal Barrels
      if (Math.random() < 0.6) {
        const bx = room.x + 1 + Math.floor(Math.random() * Math.max(1, room.w - 2));
        const by = room.y + 1 + Math.floor(Math.random() * Math.max(1, room.h - 2));
        if (tiles[by][bx].walkable && !(bx === stairsDownPos.x && by === stairsDownPos.y)) {
          tiles[by][bx] = Math.random() < 0.5 ? this.createExplosiveBarrelTile() : this.createBarrelTile();
        }
      }

      // Spawn Oil or Water Puddle
      if (Math.random() < 0.45) {
        const px = room.x + 1 + Math.floor(Math.random() * Math.max(1, room.w - 2));
        const py = room.y + 1 + Math.floor(Math.random() * Math.max(1, room.h - 2));
        if (tiles[py][px].type === TileType.FLOOR) {
          tiles[py][px] = Math.random() < 0.5 ? this.createOilTile() : this.createWaterTile();
        }
      }

      // Spawn Chests or Items
      if (Math.random() < 0.6) {
        const ix = room.x + 1 + Math.floor(Math.random() * Math.max(1, room.w - 2));
        const iy = room.y + 1 + Math.floor(Math.random() * Math.max(1, room.h - 2));
        if (tiles[iy][ix].walkable) {
          if (Math.random() < 0.4) {
            tiles[iy][ix] = this.createChestTile();
            chests.push({ x: ix, y: iy });
          } else {
            itemSpawns.push({ pos: { x: ix, y: iy }, tier: depth });
          }
        }
      }

      // Add a cracked wall on room perimeter leading to secret loot
      if (Math.random() < 0.3) {
        const crackedX = room.x;
        const crackedY = Math.floor(room.y + room.h / 2);
        if (this.isInBounds(crackedX, crackedY) && tiles[crackedY][crackedX].type === TileType.WALL) {
          tiles[crackedY][crackedX] = this.createCrackedWallTile();
        }
      }
    }

    return {
      width: this.width,
      height: this.height,
      tiles,
      rooms,
      playerSpawn,
      stairsDownPos,
      monsterSpawns,
      itemSpawns,
      chests,
      lights,
      depth,
      hasShop
    };
  }

  private generateBossFloor(depth: number): GeneratedLevel {
    const tiles: Tile[][] = this.createEmptyGrid();
    const rooms: DungeonRoom[] = [];
    const lights: LightSource[] = [];

    const arenaW = 28;
    const arenaH = 22;
    const startX = Math.floor((this.width - arenaW) / 2);
    const startY = Math.floor((this.height - arenaH) / 2);

    for (let y = startY; y < startY + arenaH; y++) {
      for (let x = startX; x < startX + arenaW; x++) {
        tiles[y][x] = this.createFloorTile(depth);
      }
    }

    const pillarPositions = [
      { x: startX + 5, y: startY + 5 },
      { x: startX + arenaW - 6, y: startY + 5 },
      { x: startX + 5, y: startY + arenaH - 6 },
      { x: startX + arenaW - 6, y: startY + arenaH - 6 },
      { x: startX + 10, y: startY + 11 },
      { x: startX + arenaW - 11, y: startY + 11 }
    ];

    pillarPositions.forEach((p) => {
      tiles[p.y][p.x] = this.createWallTile(depth);
      lights.push({
        x: p.x,
        y: p.y,
        radius: 6,
        color: [180, 50, 240],
        intensity: 0.95,
        flickerRate: 10.0
      });
    });

    // Add 4 explosive barrels in boss arena corners for tactical trick shots
    const barrelPos = [
      { x: startX + 3, y: startY + 3 },
      { x: startX + arenaW - 4, y: startY + 3 },
      { x: startX + 3, y: startY + arenaH - 4 },
      { x: startX + arenaW - 4, y: startY + arenaH - 4 }
    ];
    barrelPos.forEach((b) => {
      tiles[b.y][b.x] = this.createExplosiveBarrelTile();
    });

    const playerSpawn: Position = {
      x: startX + Math.floor(arenaW / 2),
      y: startY + arenaH - 3
    };

    const bossPos: Position = {
      x: startX + Math.floor(arenaW / 2),
      y: startY + 4
    };

    const stairsDownPos: Position = {
      x: startX + Math.floor(arenaW / 2),
      y: startY + 2
    };
    tiles[stairsDownPos.y][stairsDownPos.x] = this.createShrineTile();

    rooms.push({
      x: startX,
      y: startY,
      w: arenaW,
      h: arenaH,
      isSpecial: true,
      specialType: 'BOSS'
    });

    const monsterSpawns = [
      { pos: bossPos, difficultyTier: 99, type: MonsterType.BOSS_MALAKOR },
      { pos: { x: bossPos.x - 4, y: bossPos.y }, difficultyTier: 4, type: MonsterType.CRYPT_KNIGHT },
      { pos: { x: bossPos.x + 4, y: bossPos.y }, difficultyTier: 4, type: MonsterType.CULTIST_ACOLYTE }
    ];

    const itemSpawns = [
      { pos: { x: startX + 2, y: startY + arenaH - 2 }, tier: 4 },
      { pos: { x: startX + arenaW - 3, y: startY + arenaH - 2 }, tier: 4 }
    ];

    return {
      width: this.width,
      height: this.height,
      tiles,
      rooms,
      playerSpawn,
      stairsDownPos,
      monsterSpawns,
      itemSpawns,
      chests: [],
      lights,
      depth
    };
  }

  private createEmptyGrid(): Tile[][] {
    const grid: Tile[][] = [];
    for (let y = 0; y < this.height; y++) {
      grid[y] = [];
      for (let x = 0; x < this.width; x++) {
        grid[y][x] = this.createWallTile(1);
      }
    }
    return grid;
  }

  private isInBounds(x: number, y: number): boolean {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  private createWallTile(depth: number): Tile {
    const colors = ['#334155', '#475569', '#3f3f46', '#450a0a', '#2e1065'];
    const wallColor = colors[Math.min(depth - 1, colors.length - 1)];
    return {
      type: TileType.WALL,
      char: '#',
      color: wallColor,
      bgColor: '#0f172a',
      transparent: false,
      walkable: false,
      explored: false,
      visible: false,
      lightLevel: 0
    };
  }

  private createCrackedWallTile(): Tile {
    return {
      type: TileType.CRACKED_WALL,
      char: '▓',
      color: '#f59e0b',
      bgColor: '#1e293b',
      transparent: false,
      walkable: false,
      explored: false,
      visible: false,
      lightLevel: 0
    };
  }

  private createFloorTile(depth: number): Tile {
    const colors = ['#1e293b', '#18181b', '#1e1e24', '#2a0e0e', '#1c0f2b'];
    const floorColor = colors[Math.min(depth - 1, colors.length - 1)];
    return {
      type: TileType.FLOOR,
      char: '.',
      color: '#64748b',
      bgColor: floorColor,
      transparent: true,
      walkable: true,
      explored: false,
      visible: false,
      lightLevel: 0,
      bloodLevel: 0
    };
  }

  private createDoorTile(): Tile {
    return {
      type: TileType.DOOR_CLOSED,
      char: '+',
      color: '#d97706',
      bgColor: '#1e293b',
      transparent: false,
      walkable: false,
      explored: false,
      visible: false,
      lightLevel: 0
    };
  }

  private createStairsDownTile(): Tile {
    return {
      type: TileType.STAIRS_DOWN,
      char: '>',
      color: '#38bdf8',
      bgColor: '#0f172a',
      transparent: true,
      walkable: true,
      explored: false,
      visible: false,
      lightLevel: 0
    };
  }

  private createChestTile(): Tile {
    return {
      type: TileType.CHEST_CLOSED,
      char: '=',
      color: '#fbbf24',
      bgColor: '#1e293b',
      transparent: true,
      walkable: false,
      explored: false,
      visible: false,
      lightLevel: 0
    };
  }

  private createBarrelTile(): Tile {
    return {
      type: TileType.BARREL,
      char: 'O',
      color: '#78350f',
      bgColor: '#1e293b',
      transparent: true,
      walkable: false,
      explored: false,
      visible: false,
      lightLevel: 0
    };
  }

  private createExplosiveBarrelTile(): Tile {
    return {
      type: TileType.EXPLOSIVE_BARREL,
      char: 'Ø',
      color: '#ef4444',
      bgColor: '#450a0a',
      transparent: true,
      walkable: false,
      explored: false,
      visible: false,
      lightLevel: 0
    };
  }

  private createOilTile(): Tile {
    return {
      type: TileType.OIL,
      char: '~',
      color: '#a855f7',
      bgColor: '#1c1917',
      transparent: true,
      walkable: true,
      explored: false,
      visible: false,
      lightLevel: 0
    };
  }

  private createWaterTile(): Tile {
    return {
      type: TileType.WATER,
      char: '≈',
      color: '#38bdf8',
      bgColor: '#0e7490',
      transparent: true,
      walkable: true,
      explored: false,
      visible: false,
      lightLevel: 0
    };
  }

  private createShrineTile(): Tile {
    return {
      type: TileType.SHRINE,
      char: '§',
      color: '#c084fc',
      bgColor: '#2e1065',
      transparent: true,
      walkable: true,
      explored: false,
      visible: false,
      lightLevel: 0
    };
  }

  private createFountainTile(): Tile {
    return {
      type: TileType.FOUNTAIN,
      char: '≈',
      color: '#60a5fa',
      bgColor: '#172554',
      transparent: true,
      walkable: true,
      explored: false,
      visible: false,
      lightLevel: 0
    };
  }
}
