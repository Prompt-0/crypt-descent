import { Tile, Position, PlayerClassType } from '../types';
import { Entity } from '../entities/Entity';
import { ParticleEngine } from './ParticleEngine';
import { CameraShake } from './CameraShake';
import { SpriteRenderer } from './SpriteRenderer';

export class CanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  public tileSize: number = 28;

  // Camera viewport
  public cameraX: number = 0;
  public cameraY: number = 0;
  public viewWidth: number = 800;
  public viewHeight: number = 600;
  public playerClass: PlayerClassType = PlayerClassType.WARRIOR;

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

    // 1. Smooth Camera Tracking
    const targetCamX = (player.renderX + 0.5) * this.tileSize - viewWidth / 2;
    const targetCamY = (player.renderY + 0.5) * this.tileSize - viewHeight / 2;

    const camLerp = Math.min(1.0, dt * 12);
    this.cameraX += (targetCamX - this.cameraX) * camLerp;
    this.cameraY += (targetCamY - this.cameraY) * camLerp;

    // Apply Camera Shake
    const shake = cameraShake.update(dt);

    // 2. Clear Screen
    this.ctx.save();
    this.ctx.fillStyle = '#090a0f';
    this.ctx.fillRect(0, 0, viewWidth, viewHeight);

    // Apply Camera Transform
    this.ctx.translate(
      -Math.round(this.cameraX) + shake.offsetX,
      -Math.round(this.cameraY) + shake.offsetY
    );
    if (shake.angle !== 0) {
      this.ctx.rotate(shake.angle);
    }

    const gridHeight = tiles.length;
    const gridWidth = tiles[0]?.length || 0;

    // 3. Render Tiles & Environment
    const startX = Math.max(0, Math.floor((this.cameraX - 100) / this.tileSize));
    const endX = Math.min(gridWidth, Math.ceil((this.cameraX + viewWidth + 100) / this.tileSize));
    const startY = Math.max(0, Math.floor((this.cameraY - 100) / this.tileSize));
    const endY = Math.min(gridHeight, Math.ceil((this.cameraY + viewHeight + 100) / this.tileSize));

    this.ctx.font = `bold ${Math.floor(this.tileSize * 0.75)}px 'JetBrains Mono', monospace`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        const tile = tiles[y][x];
        if (!tile.explored) continue;

        const screenX = x * this.tileSize;
        const screenY = y * this.tileSize;

        // Base Tile Background
        if (tile.visible) {
          const light = tile.lightLevel || 0.2;
          const [r, g, b] = tile.lightColor || [200, 200, 200];
          this.ctx.fillStyle = `rgb(${Math.floor(r * light * 0.25)}, ${Math.floor(g * light * 0.25)}, ${Math.floor(b * light * 0.25)})`;
        } else {
          this.ctx.fillStyle = '#0f172a';
        }
        this.ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);

        // Render Blood Stains
        if (tile.bloodLevel && tile.bloodLevel > 0) {
          this.ctx.fillStyle = tile.visible ? (tile.bloodColor || 'rgba(185, 28, 28, 0.45)') : 'rgba(75, 15, 15, 0.25)';
          this.ctx.fillRect(screenX + 2, screenY + 2, this.tileSize - 4, this.tileSize - 4);
        }

        // Draw Special Environment Object or Glyph
        const handledBySprite = SpriteRenderer.drawEnvironment(this.ctx, tile.type, screenX, screenY, this.tileSize, time);

        if (!handledBySprite) {
          let charColor = tile.color;
          if (!tile.visible) {
            charColor = '#334155';
          } else if (tile.lightLevel < 0.5) {
            charColor = '#64748b';
          }

          this.ctx.fillStyle = charColor;
          this.ctx.fillText(tile.char, screenX + this.tileSize / 2, screenY + this.tileSize / 2);
        }
      }
    }

    // 4. Render Items on Ground
    itemsOnFloor.forEach(({ pos, item }) => {
      const tile = tiles[pos.y]?.[pos.x];
      if (tile && tile.visible) {
        const itemX = pos.x * this.tileSize;
        const itemY = pos.y * this.tileSize;

        this.ctx.fillStyle = item.color + '33';
        this.ctx.beginPath();
        this.ctx.arc(itemX + this.tileSize / 2, itemY + this.tileSize / 2, this.tileSize * 0.4, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.fillStyle = item.color;
        this.ctx.fillText(item.char, itemX + this.tileSize / 2, itemY + this.tileSize / 2);
      }
    });

    // 5. Render Path Preview
    if (pathToTarget && pathToTarget.length > 0) {
      this.ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
      pathToTarget.forEach((pt) => {
        this.ctx.fillRect(pt.x * this.tileSize + 4, pt.y * this.tileSize + 4, this.tileSize - 8, this.tileSize - 8);
      });
    }

    // 6. Render Monsters
    monsters.forEach((monster) => {
      if (monster.stats.hp <= 0) return;
      const tile = tiles[monster.y]?.[monster.x];
      if (!tile || !tile.visible) return;

      const entX = (monster.renderX + monster.bumpOffsetX) * this.tileSize;
      const entY = (monster.renderY + monster.bumpOffsetY) * this.tileSize;

      if (monster.hitFlashTimer > 0) {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(entX + 2, entY + 2, this.tileSize - 4, this.tileSize - 4);
      } else {
        if (monster.monsterType) {
          SpriteRenderer.drawMonster(this.ctx, entX, entY, this.tileSize, monster.monsterType, time);
        } else {
          this.ctx.fillStyle = monster.color;
          this.ctx.fillText(monster.char, entX + this.tileSize / 2, entY + this.tileSize / 2);
        }
      }

      // Small Health Bar
      if (monster.stats.hp < monster.stats.maxHp && monster.alignment !== 'NEUTRAL') {
        const barWidth = this.tileSize - 6;
        const barHeight = 3;
        const hpPercent = Math.max(0, monster.stats.hp / monster.stats.maxHp);

        this.ctx.fillStyle = '#1e293b';
        this.ctx.fillRect(entX + 3, entY - 4, barWidth, barHeight);

        this.ctx.fillStyle = hpPercent > 0.5 ? '#10b981' : hpPercent > 0.25 ? '#f59e0b' : '#ef4444';
        this.ctx.fillRect(entX + 3, entY - 4, barWidth * hpPercent, barHeight);
      }
    });

    // 7. Render Player
    const playerX = (player.renderX + player.bumpOffsetX) * this.tileSize;
    const playerY = (player.renderY + player.bumpOffsetY) * this.tileSize;

    // Lantern Glow
    const auraRadius = this.tileSize * 0.75;
    const gradient = this.ctx.createRadialGradient(
      playerX + this.tileSize / 2,
      playerY + this.tileSize / 2,
      2,
      playerX + this.tileSize / 2,
      playerY + this.tileSize / 2,
      auraRadius
    );
    gradient.addColorStop(0, 'rgba(251, 191, 36, 0.35)');
    gradient.addColorStop(1, 'rgba(251, 191, 36, 0)');
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(playerX + this.tileSize / 2, playerY + this.tileSize / 2, auraRadius, 0, Math.PI * 2);
    this.ctx.fill();

    if (player.hitFlashTimer > 0) {
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillRect(playerX + 2, playerY + 2, this.tileSize - 4, this.tileSize - 4);
    } else {
      SpriteRenderer.drawPlayer(this.ctx, playerX, playerY, this.tileSize, this.playerClass, time);
    }

    // 8. Projectiles
    particleEngine.getProjectiles().forEach((proj) => {
      const pX = proj.currentX * this.tileSize;
      const pY = proj.currentY * this.tileSize;

      this.ctx.fillStyle = proj.color;
      this.ctx.font = `bold ${Math.floor(this.tileSize * 0.8)}px monospace`;
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
      this.ctx.font = `900 ${ft.fontSize}px 'JetBrains Mono', monospace`;
      this.ctx.fillStyle = '#000000';
      this.ctx.fillText(ft.text, ftX + 1, ftY + 1);
      this.ctx.fillStyle = ft.color;
      this.ctx.fillText(ft.text, ftX, ftY);
      this.ctx.restore();
    });

    // 11. Hover Reticle & Tooltip
    if (hoverTile && hoverTile.x >= 0 && hoverTile.x < gridWidth && hoverTile.y >= 0 && hoverTile.y < gridHeight) {
      const hX = hoverTile.x * this.tileSize;
      const hY = hoverTile.y * this.tileSize;
      this.ctx.strokeStyle = '#38bdf8';
      this.ctx.lineWidth = 1.5;
      this.ctx.strokeRect(hX + 1, hY + 1, this.tileSize - 2, this.tileSize - 2);

      // Check if hovering over monster to show inspect card
      const hoveredMonster = monsters.find((m) => m.stats.hp > 0 && m.x === hoverTile.x && m.y === hoverTile.y);
      if (hoveredMonster && tiles[hoverTile.y][hoverTile.x].visible) {
        this.renderInspectCard(hoveredMonster, hX, hY);
      }
    }

    this.ctx.restore();
  }

  private renderInspectCard(monster: Entity, x: number, y: number): void {
    const cardW = 150;
    const cardH = 65;
    const cardX = x + this.tileSize + 8;
    const cardY = y - 10;

    this.ctx.save();
    this.ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
    this.ctx.strokeStyle = monster.color;
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.roundRect(cardX, cardY, cardW, cardH, 4);
    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.textAlign = 'left';
    this.ctx.font = 'bold 11px Cinzel, serif';
    this.ctx.fillStyle = monster.color;
    this.ctx.fillText(monster.name, cardX + 8, cardY + 16);

    this.ctx.font = '10px JetBrains Mono, monospace';
    this.ctx.fillStyle = '#cbd5e1';
    this.ctx.fillText(`HP: ${monster.stats.hp} / ${monster.stats.maxHp}`, cardX + 8, cardY + 32);
    this.ctx.fillText(`ATK: ${monster.stats.strength}  DEF: ${monster.stats.defense}`, cardX + 8, cardY + 46);

    this.ctx.restore();
  }
}
