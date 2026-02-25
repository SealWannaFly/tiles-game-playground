import { computed, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';
import { SpriteSheetLoaderService } from './game-sprite-sheet-loader/sprite-sheet-loader.service';
import { TerrainsConfig } from '../interfaces/terrains-config.interface';
import { SpriteSheet } from './game-sprite-sheet-loader/classes/sprite-sheet.class';
import { SpriteSheetConfigBase } from '../interfaces/base/sprite-sheet-config-base.interface';

@Injectable({
  providedIn: 'root',
})
export class GameConfigsLoaderService {
  constructor(
    private readonly http: HttpClient,
    private readonly spriteSheetLoaderService: SpriteSheetLoaderService,
  ) {}

  public loadDefaults(): Observable<SpriteSheet> {
    return this.http
      .get<SpriteSheetConfigBase>('/assets/configs/default-sprite-sheet.config.json')
      .pipe(
        switchMap((defaultsSpriteSheetConfig) =>
          this.spriteSheetLoaderService.loadSpriteSheet(
            defaultsSpriteSheetConfig.spriteSheetConfig,
          ),
        ),
      );
  }

  public loadTerrains(): Observable<SpriteSheet> {
    return this.http
      .get<TerrainsConfig>('/assets/configs/terrain.config.json')
      .pipe(
        switchMap((terrainConfig) =>
          this.spriteSheetLoaderService.loadSpriteSheet(terrainConfig.spriteSheetConfig),
        ),
      );
  }
}
