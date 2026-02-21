export interface SpriteRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SpriteConfig {
  key: string;
  region: SpriteRegion;
}
