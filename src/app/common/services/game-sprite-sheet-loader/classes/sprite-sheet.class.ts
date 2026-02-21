import { SpriteConfig, SpriteRegion } from '../interfaces/sprite-config.interface';

export interface DrawableSprite {
  image: HTMLImageElement;
  region: SpriteRegion;
}

export class SpriteSheet {
  private readonly key: string;
  private readonly image: HTMLImageElement;
  private readonly sprites: Map<string, SpriteRegion>;

  constructor(key: string, image: HTMLImageElement, sprites: Map<string, SpriteRegion>) {
    this.key = key;
    this.image = image;
    this.sprites = sprites;
  }

  public getSpritesKeys(): string[] {
    return Array.from(this.sprites.keys());
  }

  public setSprite(config: SpriteConfig): void {
    this.sprites.set(config.key, config.region);
  }

  public getSprite(key: string): DrawableSprite {
    const region = this.sprites.get(key);

    if (!region) {
      console.error(`Sprite ${key} not found in ${this.key}`);
    }

    return {
      image: this.image,
      region,
    } as DrawableSprite;
  }
}
