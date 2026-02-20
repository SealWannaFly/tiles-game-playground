import { SpriteSheetConfig } from './sprite-sheet-config.interface';

export interface SpriteRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SpriteConfig {
  key: string;
  spriteSheet: SpriteSheetConfig;
  region: SpriteRegion;
}
