import { SpriteRegion } from './sprite-config.interface';

export interface SpriteSheet {
  image: HTMLImageElement;
  sprites: Map<string, SpriteRegion>;
}
