export class TileTextureRenderer {
  public static drawWall(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    depth: number = 1,
    visible: boolean = true,
    _light: number = 1.0,
    seed: number = 0
  ): void {
    const wallPalette = [
      { base: '#1e293b', brick: '#334155', highlight: '#475569', shadow: '#0f172a' },
      { base: '#27272a', brick: '#3f3f46', highlight: '#52525b', shadow: '#18181b' },
      { base: '#1e1b4b', brick: '#312e81', highlight: '#4338ca', shadow: '#0f172a' },
      { base: '#450a0a', brick: '#7f1d1d', highlight: '#991b1b', shadow: '#260404' },
      { base: '#2e1065', brick: '#581c87', highlight: '#6b21a8', shadow: '#170536' }
    ];
    const theme = wallPalette[Math.min(depth - 1, wallPalette.length - 1)];

    if (!visible) {
      ctx.fillStyle = '#090d16';
      ctx.fillRect(x, y, size, size);
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 0.5, y + 0.5, size - 1, size - 1);
      return;
    }

    // 1. Base Wall Block with 3D Bevel
    ctx.fillStyle = theme.base;
    ctx.fillRect(x, y, size, size);

    // 2. Brick Course Layering
    const brickH = size / 3;
    const isShifted = Math.floor(y / size) % 2 === 0;

    ctx.fillStyle = theme.brick;
    ctx.strokeStyle = theme.shadow;
    ctx.lineWidth = 1;

    // Course 1
    ctx.fillRect(x + 1, y + 1, size - 2, brickH - 1);
    ctx.strokeRect(x + 1, y + 1, size - 2, brickH - 1);

    // Course 2 (2 split bricks)
    const splitX = isShifted ? size * 0.45 : size * 0.55;
    ctx.fillRect(x + 1, y + brickH + 1, splitX - 2, brickH - 1);
    ctx.strokeRect(x + 1, y + brickH + 1, splitX - 2, brickH - 1);
    ctx.fillRect(x + splitX + 1, y + brickH + 1, size - splitX - 2, brickH - 1);
    ctx.strokeRect(x + splitX + 1, y + brickH + 1, size - splitX - 2, brickH - 1);

    // Course 3
    ctx.fillRect(x + 1, y + brickH * 2 + 1, size - 2, brickH - 2);
    ctx.strokeRect(x + 1, y + brickH * 2 + 1, size - 2, brickH - 2);

    // 3. Top Wall Ridge / 3D Cap Highlight
    ctx.fillStyle = theme.highlight;
    ctx.fillRect(x, y, size, 2.5);

    // 4. Subtle Wall Cracks / Weathering
    if ((seed % 5) === 0) {
      ctx.strokeStyle = theme.shadow;
      ctx.beginPath();
      ctx.moveTo(x + 5, y + 4);
      ctx.lineTo(x + 12, y + brickH + 2);
      ctx.stroke();
    }
  }

  public static drawFloor(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    depth: number = 1,
    visible: boolean = true,
    _light: number = 1.0,
    _seed: number = 0
  ): void {
    if (!visible) {
      ctx.fillStyle = '#05070c';
      ctx.fillRect(x, y, size, size);
      return;
    }

    const floorPalette = [
      { base: '#0f172a', stone: '#1e293b', grout: '#090d16' },
      { base: '#18181b', stone: '#27272a', grout: '#09090b' },
      { base: '#17142a', stone: '#242038', grout: '#0d0b18' },
      { base: '#2b0c0c', stone: '#421313', grout: '#170505' },
      { base: '#1a0b2e', stone: '#2e1252', grout: '#0d0417' }
    ];
    const theme = floorPalette[Math.min(depth - 1, floorPalette.length - 1)];

    // Base Flagstone
    ctx.fillStyle = theme.base;
    ctx.fillRect(x, y, size, size);

    // Subtle 4-flagstone grid with soft mortar grooves
    const half = size / 2;
    ctx.fillStyle = theme.stone;
    ctx.fillRect(x + 1, y + 1, half - 1.5, half - 1.5);
    ctx.fillRect(x + half + 0.5, y + 1, half - 1.5, half - 1.5);
    ctx.fillRect(x + 1, y + half + 0.5, half - 1.5, half - 1.5);
    ctx.fillRect(x + half + 0.5, y + half + 0.5, half - 1.5, half - 1.5);

    // Flagstone edge bevels
    ctx.strokeStyle = theme.grout;
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, size - 1, size - 1);
  }

  public static drawDoor(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    isOpen: boolean
  ): void {
    const cx = x + size / 2;
    const cy = y + size / 2;

    if (isOpen) {
      // Open Door Frame with door swung inward
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x, y, size, size);
      // Stone frame
      ctx.fillStyle = '#475569';
      ctx.fillRect(x, y, 3, size);
      ctx.fillRect(x + size - 3, y, 3, size);
      // Swung open door leaf
      ctx.fillStyle = '#78350f';
      ctx.fillRect(x + 3, y + 2, 4, size - 4);
      ctx.fillStyle = '#92400e';
      ctx.fillRect(x + 4, y + 3, 2, size - 6);
    } else {
      // Closed Heavy Reinforced Wooden Door
      ctx.fillStyle = '#475569';
      ctx.fillRect(x, y, size, size);

      // Wood Panels
      ctx.fillStyle = '#78350f';
      ctx.fillRect(x + 2, y + 2, size - 4, size - 4);

      // Vertical Planks
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + size * 0.33, y + 2);
      ctx.lineTo(x + size * 0.33, y + size - 2);
      ctx.moveTo(x + size * 0.66, y + 2);
      ctx.lineTo(x + size * 0.66, y + size - 2);
      ctx.stroke();

      // Horizontal Iron Reinforcement Bands
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(x + 2, cy - 6, size - 4, 3);
      ctx.fillRect(x + 2, cy + 4, size - 4, 3);

      // Brass Ring Handle
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(cx + 3, cy, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  public static drawStairs(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number
  ): void {
    // Descending Stone Staircase into Dark Abyss
    ctx.fillStyle = '#090d16';
    ctx.fillRect(x, y, size, size);

    // Stone Steps
    const steps = 4;
    for (let i = 0; i < steps; i++) {
      const stepY = y + (i * size) / steps;
      const stepH = size / steps;
      const alpha = 0.9 - i * 0.2;

      ctx.fillStyle = `rgba(56, 189, 248, ${alpha * 0.3})`;
      ctx.fillRect(x + 2 + i * 1.5, stepY, size - 4 - i * 3, stepH);

      ctx.fillStyle = '#334155';
      ctx.fillRect(x + 2 + i * 1.5, stepY, size - 4 - i * 3, 2);
    }

    // Glowing cyan runes at staircase portal
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x + 2, y + 2, size - 4, size - 4);
  }

  public static drawChest(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    isOpen: boolean
  ): void {
    const cx = x + size / 2;
    const cy = y + size / 2;

    if (isOpen) {
      // Open Chest with treasure glow
      ctx.fillStyle = '#78350f';
      ctx.fillRect(cx - 8, cy - 2, 16, 10);
      ctx.fillStyle = '#451a03';
      ctx.fillRect(cx - 7, cy - 1, 14, 8);
      // Gold trim
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1;
      ctx.strokeRect(cx - 8, cy - 2, 16, 10);
      // Open lid tilted up
      ctx.fillStyle = '#92400e';
      ctx.fillRect(cx - 9, cy - 8, 18, 5);
      ctx.strokeStyle = '#f59e0b';
      ctx.strokeRect(cx - 9, cy - 8, 18, 5);
    } else {
      // Closed Ironbound Golden Chest
      // Wood Box
      ctx.fillStyle = '#78350f';
      ctx.fillRect(cx - 8, cy - 5, 16, 12);

      // Gold Corners & Rim
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(cx - 9, cy - 6, 18, 3);
      ctx.fillRect(cx - 8, cy - 5, 2.5, 12);
      ctx.fillRect(cx + 5.5, cy - 5, 2.5, 12);

      // Keyhole Lockplate
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(cx - 2, cy - 1, 4, 5);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(cx - 0.75, cy, 1.5, 2.5);
    }
  }

  public static drawShrine(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    time: number = 0
  ): void {
    const cx = x + size / 2;
    const cy = y + size / 2;
    const floatBob = Math.sin(time * 3) * 2;

    // Carved Stone Pedestal
    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(cx - 8, cy + 2, 16, 8);
    ctx.fillStyle = '#312e81';
    ctx.fillRect(cx - 6, cy + 4, 12, 4);

    // Floating Rotating Crystal Obelisk
    ctx.save();
    ctx.translate(cx, cy - 4 + floatBob);
    ctx.rotate(time * 0.8);

    ctx.fillStyle = 'rgba(192, 132, 252, 0.85)';
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, -7);
    ctx.lineTo(5, 0);
    ctx.lineTo(0, 7);
    ctx.lineTo(-5, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  public static drawTorch(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    time: number = 0
  ): void {
    const cx = x + size / 2;
    const cy = y + size / 2;
    const flicker = Math.sin(time * 12 + x) * 1.5;

    // Iron Wall Sconce
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(cx - 2, cy + 1, 4, 6);
    ctx.fillRect(cx - 4, cy, 8, 2);

    // Multi-layered Dancing Flame
    // Outer Orange Body
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.moveTo(cx, cy - 7 + flicker);
    ctx.quadraticCurveTo(cx + 4, cy - 2, cx, cy);
    ctx.quadraticCurveTo(cx - 4, cy - 2, cx, cy - 7 + flicker);
    ctx.fill();

    // Inner Yellow Core
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.moveTo(cx, cy - 5 + flicker);
    ctx.quadraticCurveTo(cx + 2, cy - 2, cx, cy);
    ctx.quadraticCurveTo(cx - 2, cy - 2, cx, cy - 5 + flicker);
    ctx.fill();
  }
}
