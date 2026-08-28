import { createNoise2D } from 'simplex-noise';

export class CameraShake {
  private trauma: number = 0; // 0.0 to 1.0
  private time: number = 0;
  private noise2D = createNoise2D();

  // Configurable thresholds
  public maxOffsetPixels: number = 18;
  public maxAngleRadians: number = 0.04; // ~2.3 degrees
  public traumaDecay: number = 1.8; // Trauma units per second
  public noiseFrequency: number = 24.0;

  public addTrauma(amount: number): void {
    this.trauma = Math.min(1.0, this.trauma + amount);
  }

  public getTrauma(): number {
    return this.trauma;
  }

  public setTrauma(amount: number): void {
    this.trauma = Math.max(0, Math.min(1.0, amount));
  }

  public update(dt: number): { offsetX: number; offsetY: number; angle: number } {
    if (this.trauma <= 0.001) {
      this.trauma = 0;
      return { offsetX: 0, offsetY: 0, angle: 0 };
    }

    this.time += dt * this.noiseFrequency;
    // Shake scales non-linearly with trauma squared
    const shake = this.trauma * this.trauma;

    const offsetX = this.maxOffsetPixels * shake * this.noise2D(this.time, 100);
    const offsetY = this.maxOffsetPixels * shake * this.noise2D(this.time, 200);
    const angle = this.maxAngleRadians * shake * this.noise2D(this.time, 300);

    // Decay trauma linearly over time
    this.trauma = Math.max(0, this.trauma - this.traumaDecay * dt);

    return { offsetX, offsetY, angle };
  }
}
