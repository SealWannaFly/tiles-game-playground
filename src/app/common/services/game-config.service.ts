import { computed, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SpriteSheetConfig } from './game-sprite-sheet-loader/interfaces/sprite-sheet-config.interface';
import { Observable, switchMap, tap } from 'rxjs';
import { SpriteSheetLoaderService } from './game-sprite-sheet-loader/sprite-sheet-loader.service';
import { SpriteSheet } from './game-sprite-sheet-loader/interfaces/sprite-sheet.interface';
import { TerrainsConfig } from '../interfaces/terrains-config.interface';

@Injectable({
  providedIn: 'root',
})
export class GameConfigService {
  readonly _terrains = signal<SpriteSheet | null>(null);

  readonly seed = signal('Hello, Milo! World is here!');
  readonly numericSeed = computed(() => this.seedToNumbers(this.seed()));

  constructor(
    private readonly http: HttpClient,
    private readonly spriteSheetLoaderService: SpriteSheetLoaderService,
  ) {}

  public loadTerrains(): Observable<SpriteSheet> {
    return this.http.get<TerrainsConfig>('/assets/configs/terrain.config.json').pipe(
      switchMap((terrainConfig) =>
        this.spriteSheetLoaderService.loadSpriteSheet(terrainConfig.spriteSheetConfig),
      ),
      tap((terrains) => this._terrains.set(terrains)),
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
