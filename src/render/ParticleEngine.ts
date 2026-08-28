import { Position } from '../types';

export interface FloatingText {
  id: string;
  x: number; // Grid world x (float)
  y: number; // Grid world y (float)
  text: string;
  color: string;
  fontSize: number;
  life: number; // 0.0 to 1.0
  maxLife: number;
  vx: number;
  vy: number;
  scale: number;
}

export interface Particle {
  x: number; // Grid world x
  y: number; // Grid world y
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  gravity?: number;
  drag?: number;
  isBlood?: boolean;
}

export interface Projectile {
  id: string;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  currentX: number;
  currentY: number;
  color: string;
  size: number;
  speed: number;
  progress: number; // 0.0 to 1.0
  char: string;
  trailColor: string;
  onComplete?: () => void;
}

export class ParticleEngine {
  private floatingTexts: FloatingText[] = [];
  private particles: Particle[] = [];
  private projectiles: Projectile[] = [];

  public spawnFloatingText(
    x: number,
    y: number,
    text: string,
    color: string = '#f59e0b',
    fontSize: number = 14,
    isCrit: boolean = false
  ): void {
    this.floatingTexts.push({
      id: Math.random().toString(36).substring(2, 9),
      x: x + (Math.random() * 0.4 - 0.2),
      y: y - 0.2,
      text,
      color,
      fontSize: isCrit ? fontSize * 1.4 : fontSize,
      life: isCrit ? 1.4 : 1.0,
      maxLife: isCrit ? 1.4 : 1.0,
      vx: (Math.random() - 0.5) * 0.4,
      vy: isCrit ? -1.8 : -1.2,
      scale: isCrit ? 1.5 : 1.0
    });
  }

  public spawnBurst(
    x: number,
    y: number,
    color: string,
    count: number = 12,
    speed: number = 2.5,
    isBlood: boolean = false
  ): void {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const velocity = (Math.random() * 0.8 + 0.2) * speed;
      this.particles.push({
        x: x + 0.5,
        y: y + 0.5,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        color,
        size: Math.random() * 3 + 1.5,
        life: 0.8 + Math.random() * 0.5,
        maxLife: 0.8 + Math.random() * 0.5,
        gravity: isBlood ? 1.8 : 0.4,
        drag: 0.92,
        isBlood
      });
    }
  }

  public spawnProjectile(
    start: Position,
    target: Position,
    color: string,
    char: string = '•',
    trailColor: string = '#f59e0b',
    speed: number = 8.0,
    onComplete?: () => void
  ): void {
    this.projectiles.push({
      id: Math.random().toString(36).substring(2, 9),
      startX: start.x + 0.5,
      startY: start.y + 0.5,
      targetX: target.x + 0.5,
      targetY: target.y + 0.5,
      currentX: start.x + 0.5,
      currentY: start.y + 0.5,
      color,
      size: 4,
      speed,
      progress: 0,
      char,
      trailColor,
      onComplete
    });
  }

  public update(dt: number, onBloodSplatter?: (x: number, y: number, color: string) => void): void {
    // Update floating texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.life -= dt;
      ft.x += ft.vx * dt;
      ft.y += ft.vy * dt;
      ft.vy += 0.4 * dt; // slight downward deceleration
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.gravity) p.vy += p.gravity * dt;
      if (p.drag) {
        p.vx *= Math.pow(p.drag, dt * 60);
        p.vy *= Math.pow(p.drag, dt * 60);
      }

      if (p.life <= 0) {
        if (p.isBlood && onBloodSplatter && Math.random() < 0.4) {
          onBloodSplatter(Math.floor(p.x), Math.floor(p.y), p.color);
        }
        this.particles.splice(i, 1);
      }
    }

    // Update projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      const dx = proj.targetX - proj.startX;
      const dy = proj.targetY - proj.startY;
      const totalDist = Math.sqrt(dx * dx + dy * dy);

      proj.progress += (proj.speed * dt) / Math.max(0.01, totalDist);
      if (proj.progress >= 1.0) {
        proj.progress = 1.0;
        if (proj.onComplete) proj.onComplete();
        this.projectiles.splice(i, 1);
      } else {
        proj.currentX = proj.startX + dx * proj.progress;
        proj.currentY = proj.startY + dy * proj.progress;
        // Spawn particle trail
        if (Math.random() < 0.6) {
          this.particles.push({
            x: proj.currentX,
            y: proj.currentY,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            color: proj.trailColor,
            size: 2,
            life: 0.25,
            maxLife: 0.25,
            drag: 0.9
          });
        }
      }
    }
  }

  public getFloatingTexts(): FloatingText[] {
    return this.floatingTexts;
  }

  public getParticles(): Particle[] {
    return this.particles;
  }

  public getProjectiles(): Projectile[] {
    return this.projectiles;
  }

  public clear(): void {
    this.floatingTexts = [];
    this.particles = [];
    this.projectiles = [];
  }
}
