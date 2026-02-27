import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SpriteSheetConfig } from './interfaces/sprite-sheet-config.interface';
import { map, Observable, tap } from 'rxjs';
import { SpriteSheet } from './classes/sprite-sheet.class';
import { Utils } from '../../utils/utils';

@Injectable({
  providedIn: 'root',
})
export class SpriteSheetLoaderService {
  private _spriteSheets = new Map<string, SpriteSheet>();

  constructor(private readonly http: HttpClient) {}

  public getSpriteSheet(key: string): SpriteSheet | undefined {
    const spriteSheet = this._spriteSheets.get(key);

    if (!spriteSheet) {
      console.error(`SpriteSheet ${key} not loaded`);
    }

    return spriteSheet;
  }

  loadSpriteSheet(config: SpriteSheetConfig): Observable<SpriteSheet> {
    return this.http
      .get(config.url, {
        responseType: 'blob',
      })
      .pipe(
        map((spriteSheet) => {
          return new SpriteSheet(
            config.key,
            Utils.blobToImageElement(spriteSheet),
            new Map(config.sprites.map((item) => [item.key, item.region])),
          );
        }),
        tap((spriteSheet) => {
          this._spriteSheets.set(config.key, spriteSheet);
        }),
      );
  }
}
