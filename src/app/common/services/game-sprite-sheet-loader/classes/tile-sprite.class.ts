import { SpriteRegion } from '../interfaces/tile-sprite-sheet-config.interface';
import { TileSpriteKey } from './tile-sprite-key.class';

export class TileSprite {
  public readonly key: TileSpriteKey;
  public readonly image: HTMLImageElement;
  public readonly region: SpriteRegion;

  constructor(key: TileSpriteKey, image: HTMLImageElement, region: SpriteRegion) {
    this.key = key;
    this.image = image;
    this.region = region;
  }
}
