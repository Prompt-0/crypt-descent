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

    if (classType === PlayerClassType.WARRIOR) {
      // Ironclad Warrior
      // Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.ellipse(0, 8, 7, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Steel Plate Body & Legs
      ctx.fillStyle = '#334155';
      ctx.fillRect(-5, -2, 10, 9 + breathe);
      ctx.fillStyle = '#475569';
      ctx.fillRect(-4, -1, 8, 7);

      // Gold Belt Buckle
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(-2, 3, 4, 2);

      // Bascinet Helmet
      ctx.fillStyle = '#64748b';
      ctx.fillRect(-5, -11, 10, 8);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(-4, -10, 8, 4);

      // Glowing Cyan Visor Slit
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(-3, -7, 6, 1.5);

      // Gold Plume
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(-1, -14, 2, 4);

      // Heraldic Kite Shield (Left Arm)
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.moveTo(-9, -4);
      ctx.lineTo(-4, -4);
      ctx.lineTo(-4, 4);
      ctx.lineTo(-6.5, 7);
      ctx.lineTo(-9, 4);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Steel Broadsword (Right Arm)
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(7, -10, 2, 13);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(5, -2, 6, 2); // Crossguard
      ctx.fillStyle = '#78350f';
      ctx.fillRect(7, 0, 2, 3); // Grip
    } else if (classType === PlayerClassType.MAGE) {
      // Arcane Pyromancer
      // Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.ellipse(0, 8, 7, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Flowing Crimson/Orange Robes
      ctx.fillStyle = '#9a3412';
      ctx.fillRect(-6, -2, 12, 10 + breathe);
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(-4, -1, 8, 8);

      // Gold Embroidered Collar & Sash
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(-5, -2, 10, 1.5);
      ctx.fillRect(-1, -1, 2, 8);

      // Head & Wizard Hat
      ctx.fillStyle = '#fde047';
      ctx.fillRect(-3, -7, 6, 5); // Face

      // Pointed Wizard Hat
      ctx.fillStyle = '#7c2d12';
      ctx.beginPath();
      ctx.moveTo(0, -16);
      ctx.lineTo(8, -7);
      ctx.lineTo(-8, -7);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(-7, -7.5, 14, 1.5); // Hat brim

      // Arcane Staff & Floating Fire Orb
      ctx.fillStyle = '#78350f';
      ctx.fillRect(7, -8, 2, 16);
      // Floating Pulsing Fire Orb
      const orbPulse = Math.sin(time * 8) * 0.8;
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(8, -10 + orbPulse, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(8, -10 + orbPulse, 1.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (classType === PlayerClassType.ASSASSIN) {
      // Shadow Assassin
      // Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.ellipse(0, 8, 6, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Midnight Purple Leather Tunics
      ctx.fillStyle = '#3b0764';
      ctx.fillRect(-5, -2, 10, 10 + breathe);
      ctx.fillStyle = '#581c87';
      ctx.fillRect(-3, -1, 6, 8);

      // Shadow Cowl & Mask
      ctx.fillStyle = '#2e1065';
      ctx.beginPath();
      ctx.arc(0, -6, 5.5, 0, Math.PI * 2);
      ctx.fill();

      // Glowing Amethyst Eyes
      ctx.fillStyle = '#c084fc';
      ctx.fillRect(-3, -6, 1.5, 1.5);
      ctx.fillRect(1.5, -6, 1.5, 1.5);

      // Dual Curved Assassin Daggers
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(-8, -6, 2, 8);
      ctx.fillRect(6.5, -6, 2, 8);
      ctx.fillStyle = '#a855f7';
      ctx.fillRect(-9, -2, 4, 1.5);
      ctx.fillRect(5.5, -2, 4, 1.5);
    } else {
      // Blood Cleric
      // Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.ellipse(0, 8, 7, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Holy Tabard & Armored Vestments
      ctx.fillStyle = '#065f46';
      ctx.fillRect(-5, -2, 10, 10 + breathe);
      ctx.fillStyle = '#047857';
      ctx.fillRect(-3, -1, 6, 8);

      // Golden Sacred Cross on chest
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(-1, 0, 2, 5);
      ctx.fillRect(-2.5, 1.5, 5, 1.5);

      // Face & Golden Sunburst Halo
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(-3, -7, 6, 5);

      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, -12, 5, 0, Math.PI * 2);
      ctx.stroke();

      // Spiked Morningstar / Mace
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(6, -8, 2, 14);
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(7, -8, 3.5, 0, Math.PI * 2);
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
    const bob = Math.sin(time * 5 + x * 0.5) * 1.0;

    ctx.save();
    ctx.translate(cx, cy + bob);

    if (type === MonsterType.CRYPT_RAT) {
      // Shaggy textured rat
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.ellipse(0, 5, 5, 2, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#52525b';
      ctx.beginPath();
      ctx.ellipse(0, 1, 7, 4.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Glowing Red Predatory Eyes
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-4, -1, 1.5, 1.5);
      ctx.fillRect(-4, 1.5, 1.5, 1.5);

      // Whipping Tail
      const tailWhip = Math.sin(time * 10) * 2;
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(6, 2);
      ctx.quadraticCurveTo(9, 4 + tailWhip, 11, 1);
      ctx.stroke();
    } else if (type === MonsterType.SKELETON_WARRIOR || type === MonsterType.FRIENDLY_SKELETON) {
      const isAlly = type === MonsterType.FRIENDLY_SKELETON;
      const boneColor = isAlly ? '#38bdf8' : '#e2e8f0';
      const shadowColor = isAlly ? '#0284c7' : '#090d16';

      // Skull
      ctx.fillStyle = boneColor;
      ctx.fillRect(-4, -10, 8, 7);
      // Dark Eye Sockets
      ctx.fillStyle = shadowColor;
      ctx.fillRect(-3, -8, 2, 2.5);
      ctx.fillRect(1, -8, 2, 2.5);
      // Teeth
      ctx.fillStyle = shadowColor;
      ctx.fillRect(-2, -4, 4, 1);

      // Spine & Anatomic Ribs
      ctx.fillStyle = boneColor;
      ctx.fillRect(-1, -3, 2, 9);
      ctx.fillRect(-5, -2, 10, 1.5);
      ctx.fillRect(-4, 0.5, 8, 1.5);
      ctx.fillRect(-3, 3, 6, 1.5);

      // Rusted Falchion
      ctx.fillStyle = isAlly ? '#7dd3fc' : '#94a3b8';
      ctx.fillRect(6, -8, 2, 12);
      ctx.fillStyle = '#b45309';
      ctx.fillRect(4, -1, 6, 2);
    } else if (type === MonsterType.SKELETON_ARCHER) {
      // Skull
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(-4, -10, 8, 7);
      ctx.fillStyle = '#090d16';
      ctx.fillRect(-3, -8, 2, 2.5);
      ctx.fillRect(1, -8, 2, 2.5);
      // Ribs
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(-1, -3, 2, 8);
      ctx.fillRect(-4, -2, 8, 1.5);
      ctx.fillRect(-3, 1, 6, 1.5);
      // Wooden Recurve Bow & Arrow
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(6, 0, 7, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(3, -0.5, 6, 1);
    } else if (type === MonsterType.ZOMBIE_BRUTE) {
      // Hulking decaying zombie
      ctx.fillStyle = '#3f6212';
      ctx.fillRect(-8, -6, 16, 14);
      ctx.fillStyle = '#65a30d';
      ctx.fillRect(-6, -11, 12, 6);
      // Diseased Glowing Eyes
      ctx.fillStyle = '#facc15';
      ctx.fillRect(-4, -9, 2, 2);
      ctx.fillRect(2, -9, 2, 2);
      // Rotten Stitches
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(-4, -2, 8, 1.5);
      ctx.fillRect(-1, -4, 2, 6);
    } else if (type === MonsterType.SHADOW_WRAITH) {
      // Spectral Swirling Phantom
      const swirl = Math.sin(time * 6) * 1.5;
      ctx.fillStyle = 'rgba(168, 85, 247, 0.85)';
      ctx.beginPath();
      ctx.arc(0, -4, 7.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(-6 + swirl, -4, 12, 11);

      // Hollow Glowing Cyan Eyes
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(-3, -5, 2, 2);
      ctx.fillRect(1.5, -5, 2, 2);
    } else if (type === MonsterType.CULTIST_ACOLYTE) {
      // Crimson Robes
      ctx.fillStyle = '#9f1239';
      ctx.fillRect(-6, -4, 12, 12);
      ctx.fillStyle = '#e11d48';
      ctx.fillRect(-4, -2, 8, 8);
      // Hood
      ctx.fillStyle = '#881337';
      ctx.beginPath();
      ctx.arc(0, -6, 5.5, 0, Math.PI * 2);
      ctx.fill();
      // Horned Summoner Staff
      ctx.fillStyle = '#78350f';
      ctx.fillRect(6, -10, 2, 16);
      ctx.fillStyle = '#a855f7';
      ctx.beginPath();
      ctx.arc(7, -11, 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === MonsterType.CRYPT_KNIGHT) {
      // Obsidian Horned Knight
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-7, -4, 14, 12);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-5, -2, 10, 8);
      // Horned Greathelm
      ctx.fillStyle = '#020617';
      ctx.fillRect(-5, -11, 10, 8);
      // Glowing Cyan Visor
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(-3, -8, 6, 2);
      // Massive Zweihander Greatsword
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(8, -13, 2.5, 18);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(6, -3, 6, 2);
    } else if (type === MonsterType.BLOOD_BAT) {
      // Flapping Leathery Bat
      const flap = Math.sin(time * 18) * 5;
      ctx.fillStyle = '#991b1b';
      ctx.beginPath();
      ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
      ctx.fill();
      // Glowing Eyes
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-1.5, -1, 1, 1);
      ctx.fillRect(0.5, -1, 1, 1);
      // Wings
      ctx.fillStyle = '#7f1d1d';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-8, -5 + flap);
      ctx.lineTo(-4, 4);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(8, -5 + flap);
      ctx.lineTo(4, 4);
      ctx.closePath();
      ctx.fill();
    } else if (type === MonsterType.MERCHANT_GRIMM) {
      // Merchant Grimm
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-6, -3, 12, 12);
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.arc(0, -6, 5.5, 0, Math.PI * 2);
      ctx.fill();
      // Brass Balance Scale
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(6, -8, 2, 12);
      ctx.fillRect(3, -8, 8, 2);
    } else if (type === MonsterType.BOSS_MALAKOR) {
      // Necromancer Overlord Malakor
      // Dark Void Shroud
      ctx.fillStyle = '#4c0519';
      ctx.fillRect(-11, -5, 22, 18);
      ctx.fillStyle = '#881337';
      ctx.fillRect(-8, -2, 16, 12);

      // Giant Skull Head
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(-8, -15, 16, 11);
      // Crimson Glowing Sockets
      ctx.fillStyle = '#e11d48';
      ctx.fillRect(-6, -12, 3.5, 3.5);
      ctx.fillRect(2.5, -12, 3.5, 3.5);

      // Golden Bone Crown
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.moveTo(-9, -15);
      ctx.lineTo(-6, -21);
      ctx.lineTo(-3, -15);
      ctx.lineTo(0, -22);
      ctx.lineTo(3, -15);
      ctx.lineTo(6, -21);
      ctx.lineTo(9, -15);
      ctx.closePath();
      ctx.fill();

      // Orbiting Soul Orbs
      for (let i = 0; i < 3; i++) {
        const orbAngle = time * 3 + (i * Math.PI * 2) / 3;
        const ox = Math.cos(orbAngle) * 16;
        const oy = Math.sin(orbAngle) * 9 - 4;
        ctx.fillStyle = '#a855f7';
        ctx.beginPath();
        ctx.arc(ox, oy, 3, 0, Math.PI * 2);
        ctx.fill();
      }
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
      // 3D Banded Oak Barrel with Red Band
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.roundRect(x + 3, y + 3, size - 6, size - 6, 3);
      ctx.fill();
      // Red Hazard Band
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(x + 3, cy - 3, size - 6, 6);
      // Metal Hoops
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(x + 3, y + 5, size - 6, 2);
      ctx.fillRect(x + 3, y + size - 7, size - 6, 2);
      // Fuse Spark
      const spark = Math.sin(time * 15) * 1.5;
      ctx.fillStyle = '#facc15';
      ctx.fillRect(cx - 1 + spark, y + 1, 2, 2);
      return true;
    }

    if (tileType === TileType.BARREL) {
      // Normal Wooden Barrel
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.roundRect(x + 3, y + 3, size - 6, size - 6, 3);
      ctx.fill();
      // Iron Hoops
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(x + 3, y + 6, size - 6, 2);
      ctx.fillRect(x + 3, y + size - 8, size - 6, 2);
      ctx.fillRect(x + 3, cy - 1, size - 6, 2);
      return true;
    }

    if (tileType === TileType.CRACKED_WALL) {
      // Cracked Wall with Glowing Gold Light
      ctx.fillStyle = '#334155';
      ctx.fillRect(x, y, size, size);
      // Fissures
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + 3, y + 3);
      ctx.lineTo(cx - 2, cy);
      ctx.lineTo(cx + 4, cy - 3);
      ctx.lineTo(x + size - 3, y + size - 3);
      ctx.stroke();
      return true;
    }

    if (tileType === TileType.WATER) {
      const wave = Math.sin(time * 4 + x * 0.1) * 0.15;
      ctx.fillStyle = `rgba(14, 116, 144, ${0.75 + wave})`;
      ctx.fillRect(x, y, size, size);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(cx - 4, cy - 1, 8, 1.5);
      return true;
    }

    if (tileType === TileType.OIL) {
      ctx.fillStyle = '#18181b';
      ctx.fillRect(x, y, size, size);
      // Iridescent rainbow sheen
      ctx.fillStyle = 'rgba(168, 85, 247, 0.35)';
      ctx.beginPath();
      ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.fill();
      return true;
    }

    return false;
  }
}
