import { Tile, TileType, Position, PlayerClassType } from '../types';
import { Entity } from '../entities/Entity';
import { ParticleEngine } from './ParticleEngine';
import { CameraShake } from './CameraShake';
import { SpriteRenderer } from './SpriteRenderer';
import { TileTextureRenderer } from './TileTextureRenderer';

export class CanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  public tileSize: number = 48;

  // Camera viewport
  public cameraX: number = 0;
  public cameraY: number = 0;
  public viewWidth: number = 1280;
  public viewHeight: number = 720;
  public playerClass: PlayerClassType = PlayerClassType.WARRIOR;
  public currentDepth: number = 1;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) throw new Error('Could not get 2D canvas context');
    this.ctx = context;
  }

  public resize(width: number, height: number): void {
    if (width <= 0 || height <= 0) return;
    this.viewWidth = width;
    this.viewHeight = height;

    const targetTilesAcross = 26;
    this.tileSize = Math.max(36, Math.min(64, Math.floor(width / targetTilesAcross)));

    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = Math.floor(width * dpr);
    this.canvas.height = Math.floor(height * dpr);
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);
    this.ctx.imageSmoothingEnabled = false;
  }

  public render(
    tiles: Tile[][],
    player: Entity,
    monsters: Entity[],
    itemsOnFloor: { pos: Position; item: any }[],
    particleEngine: ParticleEngine,
    cameraShake: CameraShake,
    dt: number,
    hoverTile?: Position | null,
    pathToTarget?: Position[] | null
  ): void {
    const viewWidth = this.viewWidth;
    const viewHeight = this.viewHeight;
    const time = performance.now() / 1000;

    // 1. Smooth Camera Tracking Centered on Player
    const targetCamX = (player.renderX + 0.5) * this.tileSize - viewWidth / 2;
    const targetCamY = (player.renderY + 0.5) * this.tileSize - viewHeight / 2;

    const camLerp = Math.min(1.0, dt * 14);
    this.cameraX += (targetCamX - this.cameraX) * camLerp;
    this.cameraY += (targetCamY - this.cameraY) * camLerp;

    const shake = cameraShake.update(dt);

    // 2. Clear Screen
    this.ctx.save();
    this.ctx.fillStyle = '#03060a';
    this.ctx.fillRect(0, 0, viewWidth, viewHeight);

    this.ctx.translate(
      -Math.round(this.cameraX) + shake.offsetX,
      -Math.round(this.cameraY) + shake.offsetY
    );
    if (shake.angle !== 0) {
      this.ctx.rotate(shake.angle);
    }

    const gridHeight = tiles.length;
    const gridWidth = tiles[0]?.length || 0;

    // 3. Render Textured Dungeon Tiles
    const startX = Math.max(0, Math.floor((this.cameraX - 140) / this.tileSize));
    const endX = Math.min(gridWidth, Math.ceil((this.cameraX + viewWidth + 140) / this.tileSize));
    const startY = Math.max(0, Math.floor((this.cameraY - 140) / this.tileSize));
    const endY = Math.min(gridHeight, Math.ceil((this.cameraY + viewHeight + 140) / this.tileSize));

    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        const tile = tiles[y][x];
        if (!tile.explored) continue;

        const screenX = x * this.tileSize;
        const screenY = y * this.tileSize;
        const seed = (x * 73856093) ^ (y * 19349663);

        if (tile.type === TileType.WALL) {
          TileTextureRenderer.drawWall(this.ctx, screenX, screenY, this.tileSize, this.currentDepth, tile.visible, tile.lightLevel, seed);
        } else if (tile.type === TileType.FLOOR || tile.type === TileType.CORRIDOR) {
          TileTextureRenderer.drawFloor(this.ctx, screenX, screenY, this.tileSize, this.currentDepth, tile.visible, tile.lightLevel, seed);
        } else if (tile.type === TileType.DOOR_CLOSED || tile.type === TileType.DOOR_OPEN) {
          TileTextureRenderer.drawFloor(this.ctx, screenX, screenY, this.tileSize, this.currentDepth, tile.visible, tile.lightLevel, seed);
          TileTextureRenderer.drawDoor(this.ctx, screenX, screenY, this.tileSize, tile.type === TileType.DOOR_OPEN);
        } else if (tile.type === TileType.STAIRS_DOWN) {
          TileTextureRenderer.drawStairs(this.ctx, screenX, screenY, this.tileSize);
        } else if (tile.type === TileType.CHEST_CLOSED || tile.type === TileType.CHEST_OPEN) {
          TileTextureRenderer.drawFloor(this.ctx, screenX, screenY, this.tileSize, this.currentDepth, tile.visible, tile.lightLevel, seed);
          TileTextureRenderer.drawChest(this.ctx, screenX, screenY, this.tileSize, tile.type === TileType.CHEST_OPEN);
        } else if (tile.type === TileType.SHRINE) {
          TileTextureRenderer.drawFloor(this.ctx, screenX, screenY, this.tileSize, this.currentDepth, tile.visible, tile.lightLevel, seed);
          TileTextureRenderer.drawShrine(this.ctx, screenX, screenY, this.tileSize, time);
        } else {
          TileTextureRenderer.drawFloor(this.ctx, screenX, screenY, this.tileSize, this.currentDepth, tile.visible, tile.lightLevel, seed);
          SpriteRenderer.drawEnvironment(this.ctx, tile.type, screenX, screenY, this.tileSize, time);
        }

        // Blood Stains
        if (tile.bloodLevel && tile.bloodLevel > 0) {
          this.ctx.fillStyle = tile.visible ? (tile.bloodColor || 'rgba(185, 28, 28, 0.65)') : 'rgba(75, 15, 15, 0.35)';
          this.ctx.fillRect(screenX + 3, screenY + 3, this.tileSize - 6, this.tileSize - 6);
        }

        // Fog of War Overlay
        if (tile.visible) {
          const light = Math.max(0.15, Math.min(1.0, tile.lightLevel || 0.2));
          if (light < 0.9) {
            this.ctx.fillStyle = `rgba(3, 6, 10, ${1.0 - light})`;
            this.ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);
          }
        } else {
          this.ctx.fillStyle = 'rgba(3, 6, 10, 0.8)';
          this.ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);
        }
      }
    }

    // 4. Render Items on Ground with Distinct Animated Sprites
    itemsOnFloor.forEach(({ pos, item }) => {
      const tile = tiles[pos.y]?.[pos.x];
      if (tile && tile.visible) {
        const itemX = pos.x * this.tileSize;
        const itemY = pos.y * this.tileSize;
        SpriteRenderer.drawGroundItem(this.ctx, itemX, itemY, this.tileSize, item, time);
      }
    });

    // 5. Render Path Preview
    if (pathToTarget && pathToTarget.length > 0) {
      this.ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
      pathToTarget.forEach((pt) => {
        this.ctx.fillRect(pt.x * this.tileSize + 6, pt.y * this.tileSize + 6, this.tileSize - 12, this.tileSize - 12);
      });
    }

    // 6. Render Monsters with Threat Rims & Health
    monsters.forEach((monster) => {
      if (monster.stats.hp <= 0) return;
      const tile = tiles[monster.y]?.[monster.x];
      if (!tile || !tile.visible) return;

      const entX = (monster.renderX + monster.bumpOffsetX) * this.tileSize;
      const entY = (monster.renderY + monster.bumpOffsetY) * this.tileSize;

      // Threat ring under hostile monsters
      if (monster.alignment === 'HOSTILE') {
        this.ctx.strokeStyle = monster.isAlerted ? 'rgba(239, 68, 68, 0.45)' : 'rgba(245, 158, 11, 0.25)';
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath();
        this.ctx.arc(entX + this.tileSize / 2, entY + this.tileSize / 2 + 4, this.tileSize * 0.38, 0, Math.PI * 2);
        this.ctx.stroke();
      }

      if (monster.hitFlashTimer > 0) {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(entX + 4, entY + 4, this.tileSize - 8, this.tileSize - 8);
      } else {
        if (monster.monsterType) {
          SpriteRenderer.drawMonster(this.ctx, entX, entY, this.tileSize, monster.monsterType, time);
        }
      }

      // Monster Health Bar with Numerical Counter
      if (monster.stats.hp < monster.stats.maxHp && monster.alignment !== 'NEUTRAL') {
        const barWidth = this.tileSize - 8;
        const barHeight = 5;
        const hpPercent = Math.max(0, monster.stats.hp / monster.stats.maxHp);

        this.ctx.fillStyle = '#0f172a';
        this.ctx.fillRect(entX + 4, entY - 8, barWidth, barHeight);

        this.ctx.fillStyle = hpPercent > 0.5 ? '#10b981' : hpPercent > 0.25 ? '#f59e0b' : '#ef4444';
        this.ctx.fillRect(entX + 4, entY - 8, barWidth * hpPercent, barHeight);
      }
    });

    // 7. Render Player
    const playerX = (player.renderX + player.bumpOffsetX) * this.tileSize;
    const playerY = (player.renderY + player.bumpOffsetY) * this.tileSize;

    // Lantern Glow
    const auraRadius = this.tileSize * 1.35;
    const gradient = this.ctx.createRadialGradient(
      playerX + this.tileSize / 2,
      playerY + this.tileSize / 2,
      2,
      playerX + this.tileSize / 2,
      playerY + this.tileSize / 2,
      auraRadius
    );
    gradient.addColorStop(0, 'rgba(251, 191, 36, 0.45)');
    gradient.addColorStop(1, 'rgba(251, 191, 36, 0)');
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(playerX + this.tileSize / 2, playerY + this.tileSize / 2, auraRadius, 0, Math.PI * 2);
    this.ctx.fill();

    if (player.hitFlashTimer > 0) {
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillRect(playerX + 4, playerY + 4, this.tileSize - 8, this.tileSize - 8);
    } else {
      SpriteRenderer.drawPlayer(this.ctx, playerX, playerY, this.tileSize, this.playerClass, time);
    }

    // 8. Projectiles
    particleEngine.getProjectiles().forEach((proj) => {
      const pX = proj.currentX * this.tileSize;
      const pY = proj.currentY * this.tileSize;

      this.ctx.fillStyle = proj.color;
      this.ctx.font = `bold ${Math.floor(this.tileSize * 0.85)}px monospace`;
      this.ctx.fillText(proj.char, pX, pY);
    });

    // 9. Particles
    particleEngine.getParticles().forEach((p) => {
      const pX = p.x * this.tileSize;
      const pY = p.y * this.tileSize;
      const alpha = Math.max(0, p.life / p.maxLife);

      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = alpha;
      this.ctx.fillRect(pX - p.size / 2, pY - p.size / 2, p.size, p.size);
    });
    this.ctx.globalAlpha = 1.0;

    // 10. Floating Combat Text
    particleEngine.getFloatingTexts().forEach((ft) => {
      const ftX = ft.x * this.tileSize;
      const ftY = ft.y * this.tileSize;
      const alpha = Math.max(0, ft.life / ft.maxLife);

      this.ctx.save();
      this.ctx.globalAlpha = alpha;
      this.ctx.font = `900 ${Math.max(16, ft.fontSize)}px 'Cinzel', serif`;
      this.ctx.fillStyle = '#000000';
      this.ctx.fillText(ft.text, ftX + 1.5, ftY + 1.5);
      this.ctx.fillStyle = ft.color;
      this.ctx.fillText(ft.text, ftX, ftY);
      this.ctx.restore();
    });

    // 11. Hover Reticle & Comprehensive Tile/Combat Inspector
    if (hoverTile && hoverTile.x >= 0 && hoverTile.x < gridWidth && hoverTile.y >= 0 && hoverTile.y < gridHeight) {
      const hX = hoverTile.x * this.tileSize;
      const hY = hoverTile.y * this.tileSize;
      this.ctx.strokeStyle = '#38bdf8';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(hX + 1, hY + 1, this.tileSize - 2, this.tileSize - 2);

      const targetTile = tiles[hoverTile.y][hoverTile.x];
      if (targetTile.visible) {
        this.renderRichTileInspector(targetTile, hoverTile, monsters, itemsOnFloor, player, hX, hY);
      }
    }

    this.ctx.restore();
  }

  private renderRichTileInspector(
    tile: Tile,
    pos: Position,
    monsters: Entity[],
    itemsOnFloor: { pos: Position; item: any }[],
    player: Entity,
    x: number,
    y: number
  ): void {
    const cardW = 280;
    let cardH = 110;
    const cardX = x + this.tileSize + 12 > this.viewWidth + this.cameraX - cardW - 10
      ? x - cardW - 12
      : x + this.tileSize + 12;
    const cardY = Math.max(this.cameraY + 10, Math.min(this.cameraY + this.viewHeight - 160, y - 10));

    const monster = monsters.find((m) => m.stats.hp > 0 && m.x === pos.x && m.y === pos.y);
    const floorItem = itemsOnFloor.find((i) => i.pos.x === pos.x && i.pos.y === pos.y);

    this.ctx.save();

    if (monster) {
      cardH = 125;
      this.ctx.fillStyle = 'rgba(11, 18, 33, 0.98)';
      this.ctx.strokeStyle = monster.alignment === 'HOSTILE' ? '#ef4444' : '#38bdf8';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.roundRect(cardX, cardY, cardW, cardH, 8);
      this.ctx.fill();
      this.ctx.stroke();

      // Monster Title
      this.ctx.textAlign = 'left';
      this.ctx.font = 'bold 15px Cinzel, serif';
      this.ctx.fillStyle = monster.color;
      this.ctx.fillText(`⚔ ${monster.name}`, cardX + 12, cardY + 24);

      // Monster Health
      this.ctx.font = 'bold 13px JetBrains Mono, monospace';
      this.ctx.fillStyle = '#f8fafc';
      this.ctx.fillText(`HP: ${monster.stats.hp} / ${monster.stats.maxHp}   DEF: ${monster.stats.defense}`, cardX + 12, cardY + 46);

      // Combat Forecast
      const baseDmg = player.getEffectiveAttackPower();
      const def = monster.getEffectiveDefense();
      const estimatedDmg = Math.max(1, Math.round(baseDmg * (100 / (100 + def))));
      const agiDiff = player.stats.agility - monster.stats.agility;
      const hitChance = Math.min(98, Math.max(20, Math.round((0.75 + agiDiff * 0.03) * 100)));

      this.ctx.fillStyle = '#fbbf24';
      this.ctx.fillText(`Your Est. Dmg: ~${estimatedDmg} (${hitChance}% Hit)`, cardX + 12, cardY + 72);

      this.ctx.font = '12px Spectral, serif';
      this.ctx.fillStyle = '#94a3b8';
      this.ctx.fillText('Step into enemy with WASD or Click to strike!', cardX + 12, cardY + 98);
      this.ctx.fillText('Press [1], [2], [3] to unleash active skills.', cardX + 12, cardY + 115);
    } else if (floorItem) {
      cardH = 95;
      this.ctx.fillStyle = 'rgba(11, 18, 33, 0.98)';
      this.ctx.strokeStyle = floorItem.item.color || '#fbbf24';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.roundRect(cardX, cardY, cardW, cardH, 8);
      this.ctx.fill();
      this.ctx.stroke();

      this.ctx.textAlign = 'left';
      this.ctx.font = 'bold 15px Cinzel, serif';
      this.ctx.fillStyle = floorItem.item.color || '#fbbf24';
      this.ctx.fillText(`✦ ${floorItem.item.name}`, cardX + 12, cardY + 24);

      this.ctx.font = '13px Spectral, serif';
      this.ctx.fillStyle = '#e2e8f0';
      this.ctx.fillText(floorItem.item.description || 'Rare subterranean relic.', cardX + 12, cardY + 48);

      this.ctx.font = 'bold 12px JetBrains Mono, monospace';
      this.ctx.fillStyle = '#38bdf8';
      this.ctx.fillText('Walk over tile to pick up into Knapsack (I).', cardX + 12, cardY + 76);
    } else if (tile.type === TileType.STAIRS_DOWN) {
      cardH = 85;
      this.ctx.fillStyle = 'rgba(11, 18, 33, 0.98)';
      this.ctx.strokeStyle = '#38bdf8';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.roundRect(cardX, cardY, cardW, cardH, 8);
      this.ctx.fill();
      this.ctx.stroke();

      this.ctx.textAlign = 'left';
      this.ctx.font = 'bold 15px Cinzel, serif';
      this.ctx.fillStyle = '#38bdf8';
      this.ctx.fillText(`🌀 Descent Gateway to Sanctum ${this.currentDepth + 1}`, cardX + 12, cardY + 24);

      this.ctx.font = '13px Spectral, serif';
      this.ctx.fillStyle = '#e2e8f0';
      this.ctx.fillText('Step onto gateway and press SPACE to descend.', cardX + 12, cardY + 54);
    } else if (tile.type === TileType.EXPLOSIVE_BARREL) {
      cardH = 85;
      this.ctx.fillStyle = 'rgba(11, 18, 33, 0.98)';
      this.ctx.strokeStyle = '#dc2626';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.roundRect(cardX, cardY, cardW, cardH, 8);
      this.ctx.fill();
      this.ctx.stroke();

      this.ctx.textAlign = 'left';
      this.ctx.font = 'bold 15px Cinzel, serif';
      this.ctx.fillStyle = '#f87171';
      this.ctx.fillText('💥 Explosive TNT Barrel', cardX + 12, cardY + 24);

      this.ctx.font = '13px Spectral, serif';
      this.ctx.fillStyle = '#e2e8f0';
      this.ctx.fillText('Attack or cast fire to detonate 3x3 blast radius!', cardX + 12, cardY + 54);
    } else if (tile.type === TileType.CHEST_CLOSED) {
      cardH = 85;
      this.ctx.fillStyle = 'rgba(11, 18, 33, 0.98)';
      this.ctx.strokeStyle = '#f59e0b';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.roundRect(cardX, cardY, cardW, cardH, 8);
      this.ctx.fill();
      this.ctx.stroke();

      this.ctx.textAlign = 'left';
      this.ctx.font = 'bold 15px Cinzel, serif';
      this.ctx.fillStyle = '#fbbf24';
      this.ctx.fillText('🎁 Ornate Treasure Chest', cardX + 12, cardY + 24);

      this.ctx.font = '13px Spectral, serif';
      this.ctx.fillStyle = '#e2e8f0';
      this.ctx.fillText('Step into chest to crack lock and claim treasure.', cardX + 12, cardY + 54);
    }

    this.ctx.restore();
  }
}
