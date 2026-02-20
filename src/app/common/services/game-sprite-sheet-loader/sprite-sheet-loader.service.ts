import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SpriteSheetConfig } from './interfaces/sprite-sheet-config.interface';
import { map, Observable } from 'rxjs';
import { SpriteSheet } from './interfaces/sprite-sheet.interface';
import { blobToImageElement } from '../../utils/blob-to-image-element.util';

@Injectable({
  providedIn: 'root',
})
export class SpriteSheetLoaderService {
  constructor(private readonly http: HttpClient) {}

  loadSpriteSheet(config: SpriteSheetConfig): Observable<SpriteSheet> {
    return this.http
      .get(config.url, {
        responseType: 'blob',
      })
      .pipe(
        map((spriteSheet) => {
          return {
            image: blobToImageElement(spriteSheet),
            sprites: new Map(config.sprites.map((item) => [item.key, item.region])),
          } as SpriteSheet;
        }),
      );
  }
}
