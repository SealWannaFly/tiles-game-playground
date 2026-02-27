import { Coordinate } from '../../../interfaces/coordinate.interface';

export interface SpriteRegion extends Coordinate {
  width: number;
  height: number;
}

export interface SpriteConfig {
  key: string;
  region: SpriteRegion;
}
