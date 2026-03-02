import { Point } from '../../../models/point.class';

export interface SpriteRegion extends Point {
  width: number;
  height: number;
}

export interface SpriteConfig {
  key: string;
  region: SpriteRegion;
}
