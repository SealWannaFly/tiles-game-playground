import { SpriteSheetConfigBase } from './base/sprite-sheet-config-base.interface';

export interface TerrainConfig {
  key: string;
}

export interface TerrainsConfig extends SpriteSheetConfigBase {
  terrains: TerrainConfig[];
}
