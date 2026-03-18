import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  MainTileSpriteConfig,
  TileSpriteSheetConfig,
} from './interfaces/tile-sprite-sheet-config.interface';
import { map, Observable, tap } from 'rxjs';
import { Utils } from '../../utils/utils';
import { TileSprite } from './classes/tile-sprite.class';
import { TileSpriteKey } from './classes/tile-sprite-key.class';

@Injectable({
  providedIn: 'root',
})
export class SpriteSheetLoaderService {
  private _sprites = new Map<string, TileSprite>();
  private _unknownSprites = new Set<string>();

  constructor(private readonly http: HttpClient) {}

  public get unknownSprites() {
    return this._unknownSprites;
  }

  getSprite(key: TileSpriteKey): TileSprite | undefined {
    if (!this._sprites.get(key.generateKey())) {
      this._unknownSprites.add(key.generateKey());
    }

    return this._sprites.get(key.generateKey()) || this._sprites.get(key.mainTileKey);
  }

  loadSpriteSheet(config: TileSpriteSheetConfig): Observable<HTMLImageElement> {
    return this.http
      .get(config.url, {
        responseType: 'blob',
      })
      .pipe(
        map((spriteSheet) => Utils.blobToImageElement(spriteSheet)),
        tap((spriteSheet) => {
          console.log('config = ', config);

          config.sprites.forEach((main) => {
            const mainKey = new TileSpriteKey(main.key);

            if (main.adjacent) {
              const adjacentKey = TileSpriteKey.createKey(main.key, main.adjacent);

              this._sprites.set(
                adjacentKey.generateKey(),
                new TileSprite(adjacentKey, spriteSheet, main.region),
              );
            } else {
              this._sprites.set(
                mainKey.generateKey(),
                new TileSprite(mainKey, spriteSheet, (main as MainTileSpriteConfig).region),
              );
            }
          });

          console.log('sprites = ', this._sprites);
        }),
      );
  }
}
