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
export class GameConfigService {
  readonly seed = signal('Hello, Milo! World is here!');
  readonly numericSeed = computed(() => this.seedToNumbers());

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

  public seedToNumbers(): number {
    const numericString = Array.from(this.seed())
      .map((char) => {
        // Проверяем, является ли символ цифрой (0–9)
        if (/\d/.test(char)) {
          return char; // оставляем цифру как есть
        } else {
          return char.charCodeAt(0); // заменяем на код
        }
      })
      .join('');

    console.log('numericString = ', numericString);
    console.log('numeric = ', +numericString.slice(0, 15));
    console.log('');

    return +numericString.slice(0, 15);
  }

  public getFromSeedInRange(a: number, b: number): number {
    return Math.floor(a + (this.numericSeed() % (b - a + 1)));
  }
}
