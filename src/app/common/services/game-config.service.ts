import { computed, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap, tap } from 'rxjs';
import { SpriteSheetLoaderService } from './game-sprite-sheet-loader/sprite-sheet-loader.service';
import { TerrainsConfig } from '../interfaces/terrains-config.interface';
import { SpriteSheet } from './game-sprite-sheet-loader/classes/sprite-sheet.class';
import { SpriteSheetConfigBase } from '../interfaces/base/sprite-sheet-config-base.interface';

@Injectable({
  providedIn: 'root',
})
export class GameConfigService {
  readonly terrains = signal<string[]>([]);

  readonly seed = signal('Hello, Milo! World is here!');
  readonly numericSeed = computed(() => this.seedToNumbers(this.seed()));

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
    return this.http.get<TerrainsConfig>('/assets/configs/terrain.config.json').pipe(
      tap((terrainConfig) => this.terrains.set(terrainConfig.terrains.map((t) => t.key))),
      switchMap((terrainConfig) =>
        this.spriteSheetLoaderService.loadSpriteSheet(terrainConfig.spriteSheetConfig),
      ),
    );
  }

  public seedToNumbers(seed: string): string {
    return Array.from(seed)
      .map((char) => {
        // Проверяем, является ли символ цифрой (0–9)
        if (/\d/.test(char)) {
          return char; // оставляем цифру как есть
        } else {
          return char.charCodeAt(0); // заменяем на код
        }
      })
      .join('');
  }
}
