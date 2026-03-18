import { Point } from '../../../models/point.class';
import { MapDirection } from '../../../enums/map-direction.enum';

export interface SpriteRegion extends Point {
  width: number;
  height: number;
}

export interface TileSpriteConfig {
  key: string;
  region: SpriteRegion;
}

export interface AdjacentTileSpriteConfig extends Pick<TileSpriteConfig, 'key'> {
  connections: Partial<Record<MapDirection, boolean>>;
}

export interface MainTileSpriteConfig extends TileSpriteConfig {
  adjacent?: AdjacentTileSpriteConfig[];
}

export interface TileSpriteSheetConfig {
  url: string;
  sprites: MainTileSpriteConfig[];
}
