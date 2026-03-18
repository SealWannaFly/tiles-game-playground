import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';
import { SpriteSheetLoaderService } from './game-sprite-sheet-loader/sprite-sheet-loader.service';
import { TileSpriteSheetConfig } from './game-sprite-sheet-loader/interfaces/tile-sprite-sheet-config.interface';

@Injectable({
  providedIn: 'root',
})
export class GameConfigsLoaderService {
  constructor(
    private readonly http: HttpClient,
    private readonly spriteSheetLoaderService: SpriteSheetLoaderService,
  ) {}

  public loadTerrains(): Observable<HTMLImageElement> {
    return this.http
      .get<TileSpriteSheetConfig>('/assets/configs/terrain.config.json')
      .pipe(
        switchMap((terrainSpriteSheetConfig) =>
          this.spriteSheetLoaderService.loadSpriteSheet(terrainSpriteSheetConfig),
        ),
      );
  }
}
