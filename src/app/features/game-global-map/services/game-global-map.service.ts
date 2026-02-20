import { computed, Injectable, signal } from '@angular/core';
import { GlobalMapHexagon } from './interfaces/global-map-hexagon.interface';
import { GlobalMapTerrain } from './enums/global-map-terrain.enum';

@Injectable({
  providedIn: 'root',
})
export class GameGlobalMapService {
  private readonly _size = signal(5);
  private readonly _globalMap = signal<Map<string, GlobalMapHexagon>>(
    this.generateGlobalMap(this._size()),
  );

  readonly size = this._size.asReadonly();
  readonly globalMap = this._globalMap.asReadonly();
  readonly globalMapTilesArray = computed(() => Array.from(this._globalMap().values()));

  setSize(size: number): void {
    this._size.set(size);
    this._globalMap.set(this.generateGlobalMap(this._size()));
  }

  private generateGlobalMap(size: number): Map<string, GlobalMapHexagon> {
    const map = new Map<string, GlobalMapHexagon>();

    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        map.set(`${x}:${y}`, {
          x,
          y,
          terrain: GlobalMapTerrain.GRASS,
        } as GlobalMapHexagon);
      }
    }

    return map;
  }
}
