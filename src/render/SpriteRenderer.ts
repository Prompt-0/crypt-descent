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
    const idleBob = Math.sin(time * 5) * 1.0;
    const breathe = Math.sin(time * 3) * 0.5;

    ctx.save();
    ctx.translate(cx, cy + idleBob);

    // Hero Selection Aura
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 4, size * 0.38, 0, Math.PI * 2);
    ctx.stroke();

    if (classType === PlayerClassType.WARRIOR) {
      // Ironclad Warrior
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.ellipse(0, 8, 8, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Steel Plate Body & Legs
      ctx.fillStyle = '#334155';
      ctx.fillRect(-6, -2, 12, 10 + breathe);
      ctx.fillStyle = '#475569';
      ctx.fillRect(-5, -1, 10, 8);

      // Gold Belt Buckle
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(-3, 3, 6, 2.5);

      // Bascinet Helmet
      ctx.fillStyle = '#64748b';
      ctx.fillRect(-6, -12, 12, 9);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(-5, -11, 10, 4.5);

      // Glowing Cyan Visor Slit
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(-4, -7.5, 8, 2);

      // Gold Crest Plume
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(-1.5, -15, 3, 4);

      // Heraldic Kite Shield (Left Arm)
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.moveTo(-11, -4);
      ctx.lineTo(-5, -4);
      ctx.lineTo(-5, 5);
      ctx.lineTo(-8, 9);
      ctx.lineTo(-11, 5);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Steel Broadsword (Right Arm)
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(8, -12, 2.5, 15);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(6, -2, 7, 2.5); // Crossguard
      ctx.fillStyle = '#78350f';
      ctx.fillRect(8, 0.5, 2.5, 3.5); // Grip
    } else if (classType === PlayerClassType.MAGE) {
      // Arcane Pyromancer
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.ellipse(0, 8, 8, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Flowing Crimson Robes
      ctx.fillStyle = '#9a3412';
      ctx.fillRect(-7, -2, 14, 11 + breathe);
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(-5, -1, 10, 9);

      // Gold Embroidered Collar & Sash
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(-6, -2, 12, 2);
      ctx.fillRect(-1.5, -1, 3, 9);

      // Face
      ctx.fillStyle = '#fde047';
      ctx.fillRect(-4, -8, 8, 6);

      // Pointed Wizard Hat
      ctx.fillStyle = '#7c2d12';
      ctx.beginPath();
      ctx.moveTo(0, -18);
      ctx.lineTo(9, -8);
      ctx.lineTo(-9, -8);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(-8, -8.5, 16, 2);

      // Arcane Staff & Floating Fire Orb
      ctx.fillStyle = '#78350f';
      ctx.fillRect(8, -9, 2.5, 18);
      const orbPulse = Math.sin(time * 8) * 1.0;
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(9, -11 + orbPulse, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(9, -11 + orbPulse, 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (classType === PlayerClassType.ASSASSIN) {
      // Shadow Assassin
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.ellipse(0, 8, 7, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Midnight Purple Leather Tunics
      ctx.fillStyle = '#3b0764';
      ctx.fillRect(-6, -2, 12, 11 + breathe);
      ctx.fillStyle = '#581c87';
      ctx.fillRect(-4, -1, 8, 9);

      // Shadow Cowl
      ctx.fillStyle = '#2e1065';
      ctx.beginPath();
      ctx.arc(0, -7, 6.5, 0, Math.PI * 2);
      ctx.fill();

      // Glowing Amethyst Eyes
      ctx.fillStyle = '#c084fc';
      ctx.fillRect(-3.5, -7, 2, 2);
      ctx.fillRect(1.5, -7, 2, 2);

      // Dual Curved Assassin Daggers
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(-9, -7, 2.5, 10);
      ctx.fillRect(7, -7, 2.5, 10);
      ctx.fillStyle = '#a855f7';
      ctx.fillRect(-10.5, -2, 5, 2);
      ctx.fillRect(6, -2, 5, 2);
    } else {
      // Blood Cleric
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.ellipse(0, 8, 8, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Holy Tabard & Armored Vestments
      ctx.fillStyle = '#065f46';
      ctx.fillRect(-6, -2, 12, 11 + breathe);
      ctx.fillStyle = '#047857';
      ctx.fillRect(-4, -1, 8, 9);

      // Golden Sacred Cross
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(-1.5, 0, 3, 6);
      ctx.fillRect(-3.5, 1.5, 7, 2);

      // Golden Sunburst Halo
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, -13, 6, 0, Math.PI * 2);
      ctx.stroke();

      // Spiked Morningstar / Mace
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(7, -9, 2.5, 16);
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(8.5, -9, 4.5, 0, Math.PI * 2);
      ctx.fill();
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
    const bob = Math.sin(time * 5 + x * 0.5) * 1.2;

    ctx.save();
    ctx.translate(cx, cy + bob);

    if (type === MonsterType.CRYPT_RAT) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(0, 6, 6, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#52525b';
      ctx.beginPath();
      ctx.ellipse(0, 1, 8, 5.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Glowing Red Eyes
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-5, -1.5, 2, 2);
      ctx.fillRect(-5, 1.5, 2, 2);

      const tailWhip = Math.sin(time * 10) * 2;
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(7, 2);
      ctx.quadraticCurveTo(10, 5 + tailWhip, 13, 1);
      ctx.stroke();
    } else if (type === MonsterType.SKELETON_WARRIOR || type === MonsterType.FRIENDLY_SKELETON) {
      const isAlly = type === MonsterType.FRIENDLY_SKELETON;
      const boneColor = isAlly ? '#38bdf8' : '#e2e8f0';
      const shadowColor = isAlly ? '#0284c7' : '#090d16';

      // Skull
      ctx.fillStyle = boneColor;
      ctx.fillRect(-5, -11, 10, 8);
      ctx.fillStyle = shadowColor;
      ctx.fillRect(-4, -9, 2.5, 3);
      ctx.fillRect(1.5, -9, 2.5, 3);
      ctx.fillRect(-2.5, -4.5, 5, 1.5);

      // Spine & Ribs
      ctx.fillStyle = boneColor;
      ctx.fillRect(-1.5, -3, 3, 10);
      ctx.fillRect(-6, -2, 12, 2);
      ctx.fillRect(-5, 1, 10, 2);
      ctx.fillRect(-4, 4, 8, 2);

      // Sword
      ctx.fillStyle = isAlly ? '#7dd3fc' : '#94a3b8';
      ctx.fillRect(7, -9, 2.5, 14);
      ctx.fillStyle = '#b45309';
      ctx.fillRect(5, -1, 7, 2.5);

      if (isAlly) {
        // Ally Blue Crest
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(0, -15, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (type === MonsterType.SKELETON_ARCHER) {
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(-5, -11, 10, 8);
      ctx.fillStyle = '#090d16';
      ctx.fillRect(-4, -9, 2.5, 3);
      ctx.fillRect(1.5, -9, 2.5, 3);

      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(-1.5, -3, 3, 9);
      ctx.fillRect(-5, -2, 10, 2);
      ctx.fillRect(-4, 1.5, 8, 2);

      // Wooden Bow
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(7, 0, 8, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(4, -0.5, 7, 1.5);
    } else if (type === MonsterType.ZOMBIE_BRUTE) {
      ctx.fillStyle = '#3f6212';
      ctx.fillRect(-9, -7, 18, 16);
      ctx.fillStyle = '#65a30d';
      ctx.fillRect(-7, -13, 14, 7);

      ctx.fillStyle = '#facc15';
      ctx.fillRect(-5, -10, 2.5, 2.5);
      ctx.fillRect(2.5, -10, 2.5, 2.5);

      ctx.fillStyle = '#1c1917';
      ctx.fillRect(-5, -2, 10, 2);
      ctx.fillRect(-1.5, -5, 3, 7);
    } else if (type === MonsterType.SHADOW_WRAITH) {
      const swirl = Math.sin(time * 6) * 2;
      ctx.fillStyle = 'rgba(168, 85, 247, 0.88)';
      ctx.beginPath();
      ctx.arc(0, -5, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(-7 + swirl, -5, 14, 13);

      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(-4, -6, 2.5, 2.5);
      ctx.fillRect(1.5, -6, 2.5, 2.5);
    } else if (type === MonsterType.CULTIST_ACOLYTE) {
      ctx.fillStyle = '#9f1239';
      ctx.fillRect(-7, -5, 14, 14);
      ctx.fillStyle = '#e11d48';
      ctx.fillRect(-5, -2, 10, 9);

      ctx.fillStyle = '#881337';
      ctx.beginPath();
      ctx.arc(0, -7, 6.5, 0, Math.PI * 2);
      ctx.fill();

      // Summoner Staff
      ctx.fillStyle = '#78350f';
      ctx.fillRect(7, -11, 2.5, 18);
      ctx.fillStyle = '#a855f7';
      ctx.beginPath();
      ctx.arc(8.5, -12, 3.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === MonsterType.CRYPT_KNIGHT) {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-8, -5, 16, 14);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-6, -2, 12, 9);

      ctx.fillStyle = '#020617';
      ctx.fillRect(-6, -12, 12, 9);
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(-4, -9, 8, 2.5);

      // Greatsword
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(9, -15, 3, 20);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(7, -3, 7, 2.5);
    } else if (type === MonsterType.BLOOD_BAT) {
      const flap = Math.sin(time * 18) * 6;
      ctx.fillStyle = '#991b1b';
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-2, -1.5, 1.5, 1.5);
      ctx.fillRect(0.5, -1.5, 1.5, 1.5);

      ctx.fillStyle = '#7f1d1d';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-9, -6 + flap);
      ctx.lineTo(-4, 5);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(9, -6 + flap);
      ctx.lineTo(4, 5);
      ctx.closePath();
      ctx.fill();
    } else if (type === MonsterType.MERCHANT_GRIMM) {
      // Merchant Grimm with Gold Canopy & Lantern
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-7, -4, 14, 13);
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.arc(0, -7, 6.5, 0, Math.PI * 2);
      ctx.fill();

      // Gold Lantern
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(7, -9, 2.5, 13);
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(8.5, -4, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // "SHOP" Golden Text
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 9px Cinzel, serif';
      ctx.textAlign = 'center';
      ctx.fillText('BAZAAR', 0, 14);
    } else if (type === MonsterType.BOSS_MALAKOR) {
      // Necromancer Overlord Malakor
      ctx.fillStyle = '#4c0519';
      ctx.fillRect(-13, -6, 26, 20);
      ctx.fillStyle = '#881337';
      ctx.fillRect(-9, -3, 18, 14);

      // Skull Head
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(-9, -17, 18, 13);
      ctx.fillStyle = '#e11d48';
      ctx.fillRect(-7, -14, 4, 4);
      ctx.fillRect(3, -14, 4, 4);

      // Gold Bone Crown
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.moveTo(-10, -17);
      ctx.lineTo(-7, -24);
      ctx.lineTo(-3, -17);
      ctx.lineTo(0, -25);
      ctx.lineTo(3, -17);
      ctx.lineTo(7, -24);
      ctx.lineTo(10, -17);
      ctx.closePath();
      ctx.fill();

      // Soul Orbs
      for (let i = 0; i < 3; i++) {
        const orbAngle = time * 3 + (i * Math.PI * 2) / 3;
        const ox = Math.cos(orbAngle) * 19;
        const oy = Math.sin(orbAngle) * 10 - 4;
        ctx.fillStyle = '#a855f7';
        ctx.beginPath();
        ctx.arc(ox, oy, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  public static drawGroundItem(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    item: any,
    time: number = 0
  ): void {
    const cx = x + size / 2;
    const cy = y + size / 2;
    const bob = Math.sin(time * 4 + x * 0.7) * 2.5;

    ctx.save();
    ctx.translate(cx, cy + bob);

    // Glowing Pedestal Halo
    const haloRadius = size * 0.35;
    ctx.fillStyle = item.color + '44';
    ctx.beginPath();
    ctx.arc(0, 6, haloRadius, 0, Math.PI * 2);
    ctx.fill();

    // Sparkle Particle
    const spark = Math.sin(time * 8) * 3;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(spark - 1, -8 + spark * 0.5, 2, 2);

    if (item.type === 'POTION') {
      // Glass Flask with Glowing Liquid
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(-3, -7, 6, 3); // Neck
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-2, -9, 4, 2); // Cork

      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();
    } else if (item.type === 'SCROLL') {
      // Parchment Scroll with Golden Ribbon
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(-6, -6, 12, 12);
      ctx.fillStyle = '#ca8a04';
      ctx.fillRect(-7, -7, 14, 2);
      ctx.fillRect(-7, 5, 14, 2);
      // Red Ribbon
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(-1.5, -6, 3, 12);
    } else if (item.equipSlot === 'MAIN_HAND') {
      // Shining Broadsword
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(-1.5, -10, 3, 14);
      ctx.fillStyle = item.color;
      ctx.fillRect(-4, 0, 8, 2.5); // Hilt
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-1, 2.5, 2, 3);
    } else if (item.equipSlot === 'OFF_HAND') {
      // Shield
      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.moveTo(-6, -6);
      ctx.lineTo(6, -6);
      ctx.lineTo(6, 3);
      ctx.lineTo(0, 8);
      ctx.lineTo(-6, 3);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    } else {
      // Magical Relic / Ring / Armor
      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.arc(0, 0, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
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
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.roundRect(x + 4, y + 4, size - 8, size - 8, 3);
      ctx.fill();

      // Red TNT Hazard Band
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(x + 4, cy - 3.5, size - 8, 7);

      // Warning text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 8px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('TNT', cx, cy + 2.5);

      // Fuse Spark
      const spark = Math.sin(time * 15) * 2;
      ctx.fillStyle = '#facc15';
      ctx.fillRect(cx - 1 + spark, y + 2, 2.5, 2.5);
      return true;
    }

    if (tileType === TileType.BARREL) {
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.roundRect(x + 4, y + 4, size - 8, size - 8, 3);
      ctx.fill();
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(x + 4, y + 7, size - 8, 2);
      ctx.fillRect(x + 4, y + size - 9, size - 8, 2);
      ctx.fillRect(x + 4, cy - 1, size - 8, 2);
      return true;
    }

    if (tileType === TileType.CRACKED_WALL) {
      ctx.fillStyle = '#334155';
      ctx.fillRect(x, y, size, size);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(x + 4, y + 4);
      ctx.lineTo(cx - 3, cy);
      ctx.lineTo(cx + 5, cy - 4);
      ctx.lineTo(x + size - 4, y + size - 4);
      ctx.stroke();
      return true;
    }

    if (tileType === TileType.WATER) {
      const wave = Math.sin(time * 4 + x * 0.1) * 0.15;
      ctx.fillStyle = `rgba(14, 116, 144, ${0.75 + wave})`;
      ctx.fillRect(x, y, size, size);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(cx - 5, cy - 1, 10, 2);
      return true;
    }

    if (tileType === TileType.OIL) {
      ctx.fillStyle = '#18181b';
      ctx.fillRect(x, y, size, size);
      ctx.fillStyle = 'rgba(168, 85, 247, 0.4)';
      ctx.beginPath();
      ctx.arc(cx, cy, 7, 0, Math.PI * 2);
      ctx.fill();
      return true;
    }

    return false;
  }
}
