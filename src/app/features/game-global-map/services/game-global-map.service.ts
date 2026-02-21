import { computed, Injectable, signal } from '@angular/core';
import { GlobalMapTile } from './interfaces/global-map-tile.interface';
import { GameConfigService } from '../../../common/services/game-config.service';

@Injectable({
  providedIn: 'root',
})
export class GameGlobalMapService {
  private readonly _size = signal(5);
  readonly size = this._size.asReadonly();
  private readonly _globalMap = signal<Map<string, GlobalMapTile>>(
    this.generateGlobalMap(this._size()),
  );
  readonly globalMap = this._globalMap.asReadonly();
  readonly globalMapTilesArray = computed(() => Array.from(this._globalMap().values()));

  constructor(private readonly gameConfigService: GameConfigService) {}

  setSize(size: number): void {
    this._size.set(size);
    this._globalMap.set(this.generateGlobalMap(this._size()));
  }

  private generateGlobalMap(size: number): Map<string, GlobalMapTile> {
    const map = new Map<string, GlobalMapTile>();

    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        map.set(`${x}:${y}`, {
          x,
          y,
          terrain:
            this.gameConfigService.terrains()[
              Math.floor(Math.random() * 10) % this.gameConfigService.terrains().length
            ],
        } as GlobalMapTile);
      }
    }

    return map;
  }
}
