import { MonsterType, PlayerClassType, TileType } from '../types';

export class SpriteRenderer {
  public static drawPlayer(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    classType: PlayerClassType = PlayerClassType.WARRIOR,
    time: number = 0
  ): void {
    const cx = x + size / 2;
    const cy = y + size / 2;
    const idleBob = Math.sin(time * 6) * 1.2;

    ctx.save();
    ctx.translate(cx, cy + idleBob);

    if (classType === PlayerClassType.WARRIOR) {
      // Ironclad Warrior: Knight helm, visor, steel shield & broadsword
      // Body Armor
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(-6, -4, 12, 10);
      // Helmet
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(-5, -11, 10, 8);
      // Visor slit
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(-4, -8, 8, 2);
      // Shield
      ctx.fillStyle = '#0369a1';
      ctx.fillRect(-9, -2, 4, 8);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(-8, 1, 2, 2);
      // Sword
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(7, -9, 2, 12);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(5, -1, 6, 2);
    } else if (classType === PlayerClassType.MAGE) {
      // Arcane Pyromancer: Wizard Hat, Robes, Glowing Wand
      // Robes
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(-6, -3, 12, 11);
      // Face
      ctx.fillStyle = '#fde047';
      ctx.fillRect(-4, -8, 8, 6);
      // Wizard Hat
      ctx.fillStyle = '#7c2d12';
      ctx.beginPath();
      ctx.moveTo(0, -14);
      ctx.lineTo(8, -8);
      ctx.lineTo(-8, -8);
      ctx.closePath();
      ctx.fill();
      // Glowing Wand Orb
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(8, -4, 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (classType === PlayerClassType.ASSASSIN) {
      // Shadow Assassin: Hooded Cloak, Dual Daggers
      // Cloak
      ctx.fillStyle = '#581c87';
      ctx.fillRect(-6, -3, 12, 11);
      // Shadow Hood
      ctx.fillStyle = '#3b0764';
      ctx.beginPath();
      ctx.arc(0, -7, 6, 0, Math.PI * 2);
      ctx.fill();
      // Glowing Eyes
      ctx.fillStyle = '#c084fc';
      ctx.fillRect(-3, -7, 2, 2);
      ctx.fillRect(1, -7, 2, 2);
      // Dual Daggers
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(-8, -6, 2, 8);
      ctx.fillRect(7, -6, 2, 8);
    } else {
      // Blood Cleric: Holy Vestments, Halo & Radiant Mace
      // Vestments
      ctx.fillStyle = '#047857';
      ctx.fillRect(-6, -3, 12, 11);
      // Face
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(-4, -8, 8, 6);
      // Golden Halo
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, -12, 5, 0, Math.PI * 2);
      ctx.stroke();
      // Holy Mace
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(6, -8, 3, 10);
      ctx.fillRect(4, -9, 7, 3);
    }

    ctx.restore();
  }

  public static drawMonster(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    type: MonsterType,
    time: number = 0
  ): void {
    const cx = x + size / 2;
    const cy = y + size / 2;
    const bob = Math.sin(time * 5 + x) * 1.0;

    ctx.save();
    ctx.translate(cx, cy + bob);

    if (type === MonsterType.CRYPT_RAT) {
      // Rat body
      ctx.fillStyle = '#71717a';
      ctx.beginPath();
      ctx.ellipse(0, 1, 6, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      // Red eyes
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-4, 0, 1.5, 1.5);
      ctx.fillRect(-4, 2, 1.5, 1.5);
      // Tail
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(5, 2);
      ctx.quadraticCurveTo(8, 4, 9, 1);
      ctx.stroke();
    } else if (type === MonsterType.SKELETON_WARRIOR || type === MonsterType.FRIENDLY_SKELETON) {
      const isAlly = type === MonsterType.FRIENDLY_SKELETON;
      // Skull
      ctx.fillStyle = isAlly ? '#38bdf8' : '#e2e8f0';
      ctx.fillRect(-4, -9, 8, 6);
      // Eye sockets
      ctx.fillStyle = isAlly ? '#0369a1' : '#090a0f';
      ctx.fillRect(-3, -7, 2, 2);
      ctx.fillRect(1, -7, 2, 2);
      // Ribs & spine
      ctx.fillStyle = isAlly ? '#7dd3fc' : '#cbd5e1';
      ctx.fillRect(-1, -3, 2, 8);
      ctx.fillRect(-4, -1, 8, 1.5);
      ctx.fillRect(-3, 2, 6, 1.5);
      // Sword
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(6, -6, 2, 10);
    } else if (type === MonsterType.SKELETON_ARCHER) {
      // Skull
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(-4, -9, 8, 6);
      ctx.fillStyle = '#090a0f';
      ctx.fillRect(-3, -7, 2, 2);
      ctx.fillRect(1, -7, 2, 2);
      // Ribs
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(-1, -3, 2, 7);
      // Bow
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(6, 0, 6, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();
    } else if (type === MonsterType.ZOMBIE_BRUTE) {
      // Hulking green brute
      ctx.fillStyle = '#4d7c0f';
      ctx.fillRect(-7, -8, 14, 15);
      // Head
      ctx.fillStyle = '#65a30d';
      ctx.fillRect(-5, -11, 10, 6);
      // Eyes
      ctx.fillStyle = '#facc15';
      ctx.fillRect(-3, -9, 2, 2);
      ctx.fillRect(1, -9, 2, 2);
    } else if (type === MonsterType.SHADOW_WRAITH) {
      // Floating purple phantom
      ctx.fillStyle = 'rgba(168, 85, 247, 0.85)';
      ctx.beginPath();
      ctx.arc(0, -4, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(-6, -4, 12, 10);
      // Glowing Cyan Eyes
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(-3, -5, 2, 2);
      ctx.fillRect(1, -5, 2, 2);
    } else if (type === MonsterType.CULTIST_ACOLYTE) {
      // Red Robes
      ctx.fillStyle = '#be123c';
      ctx.fillRect(-6, -5, 12, 13);
      // Hood
      ctx.fillStyle = '#881337';
      ctx.beginPath();
      ctx.arc(0, -7, 5, 0, Math.PI * 2);
      ctx.fill();
      // Cultist Staff
      ctx.fillStyle = '#a855f7';
      ctx.fillRect(6, -10, 2, 14);
      ctx.fillStyle = '#e11d48';
      ctx.fillRect(5, -11, 4, 3);
    } else if (type === MonsterType.CRYPT_KNIGHT) {
      // Horned Death Knight
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-7, -5, 14, 13);
      // Horned Helm
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-5, -11, 10, 7);
      // Cyan Visor Glow
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(-3, -9, 6, 2);
      // Greatsword
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(7, -12, 2.5, 16);
    } else if (type === MonsterType.BLOOD_BAT) {
      // Flapping Bat
      const wingFlap = Math.sin(time * 16) * 4;
      ctx.fillStyle = '#b91c1c';
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.fill();
      // Wings
      ctx.fillStyle = '#7f1d1d';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-7, -4 + wingFlap);
      ctx.lineTo(-4, 4);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(7, -4 + wingFlap);
      ctx.lineTo(4, 4);
      ctx.closePath();
      ctx.fill();
    } else if (type === MonsterType.MERCHANT_GRIMM) {
      // Merchant Grimm: Brown cloak, pack, brass scale
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-6, -4, 12, 12);
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.arc(0, -7, 5, 0, Math.PI * 2);
      ctx.fill();
      // Gold Coin in Hand
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(6, -2, 2.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === MonsterType.BOSS_MALAKOR) {
      // Necromancer Lord: Crowned Giant Skull, Dark Void Robes
      ctx.fillStyle = '#4c0519';
      ctx.fillRect(-10, -6, 20, 18);
      // Skull
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(-7, -14, 14, 10);
      // Crimson Eyes
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(-5, -11, 3, 3);
      ctx.fillRect(2, -11, 3, 3);
      // Bone Crown
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.moveTo(-8, -14);
      ctx.lineTo(-5, -19);
      ctx.lineTo(-2, -14);
      ctx.lineTo(0, -20);
      ctx.lineTo(2, -14);
      ctx.lineTo(5, -19);
      ctx.lineTo(8, -14);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  public static drawEnvironment(
    ctx: CanvasRenderingContext2D,
    tileType: TileType,
    x: number,
    y: number,
    size: number,
    time: number = 0
  ): boolean {
    const cx = x + size / 2;
    const cy = y + size / 2;

    if (tileType === TileType.EXPLOSIVE_BARREL) {
      // Wooden Barrel with red band and skull
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.roundRect(x + 4, y + 4, size - 8, size - 8, 3);
      ctx.fill();
      // Red Hazard Band
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(x + 4, cy - 2, size - 8, 4);
      // Fuse Spark
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(cx - 1, y + 2, 2, 2);
      return true;
    }

    if (tileType === TileType.BARREL) {
      // Normal Wooden Barrel
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.roundRect(x + 4, y + 4, size - 8, size - 8, 3);
      ctx.fill();
      ctx.fillStyle = '#451a03';
      ctx.fillRect(x + 4, cy - 1, size - 8, 2);
      return true;
    }

    if (tileType === TileType.CRACKED_WALL) {
      // Cracked stone wall with glowing fissure
      ctx.fillStyle = '#334155';
      ctx.fillRect(x, y, size, size);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x + 4, y + 4);
      ctx.lineTo(cx, cy);
      ctx.lineTo(x + size - 4, y + size - 4);
      ctx.stroke();
      return true;
    }

    if (tileType === TileType.WATER) {
      const wave = Math.sin(time * 4 + x * 0.1) * 0.1;
      ctx.fillStyle = `rgba(14, 116, 144, ${0.7 + wave})`;
      ctx.fillRect(x, y, size, size);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(cx - 3, cy, 6, 1.5);
      return true;
    }

    if (tileType === TileType.OIL) {
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(x, y, size, size);
      // Iridescent sheen
      ctx.fillStyle = 'rgba(168, 85, 247, 0.3)';
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fill();
      return true;
    }

    return false;
  }
}
