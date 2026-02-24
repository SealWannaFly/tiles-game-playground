import { computed, Injectable, signal } from '@angular/core';
import { GlobalMapTile } from './interfaces/global-map-tile.interface';
import { GameConfigService } from '../../../common/services/game-config.service';
import { GlobalMapTerrains } from './enums/global-map-terrains.enum';
import { GlobalMapGenerationStages } from './enums/global-map-generation-stages.enum';

@Injectable({
  providedIn: 'root',
})
export class GameGlobalMapService {
  private readonly _size = signal(100);
  readonly size = this._size.asReadonly();

  private readonly _mapGenStage = signal<GlobalMapGenerationStages>(
    GlobalMapGenerationStages.EMPTY,
  );
  readonly mapGenStages = this._mapGenStage.asReadonly();

  private readonly _globalMap = signal<Map<string, GlobalMapTile>>(
    this.generateGlobalMap(this._size()),
  );
  readonly globalMap = this._globalMap.asReadonly();
  readonly globalMapTilesArray = computed(() => Array.from(this._globalMap().values()));

  constructor(private readonly gameConfigService: GameConfigService) {}

  public setSize(size: number): void {
    this._size.set(size);
    this._globalMap.set(this.generateGlobalMap(this._size()));
  }

  public getGlobalMapKey(x: number, y: number): string {
    return `${x}:${y}`;
  }

  public isCorrectCoordinate(coordinate: number): boolean {
    return coordinate > -1 && coordinate < this.size();
  }

  public isCorrectCoordinates(x: number, y: number): boolean {
    return this.isCorrectCoordinate(x) && this.isCorrectCoordinate(y);
  }

  private generateGlobalMap(size: number): Map<string, GlobalMapTile> {
    const map = new Map<string, GlobalMapTile>();

    this.generateOcean(map, size);

    this.generateContinents(map, size);

    return map;
  }

  private generateOcean(map: Map<string, GlobalMapTile>, size: number): void {
    this._mapGenStage.set(GlobalMapGenerationStages.OCEAN_GENERATION);

    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        map.set(this.getGlobalMapKey(x, y), {
          x,
          y,
          terrain: GlobalMapTerrains.DEEP_WATER,
        } as GlobalMapTile);
      }
    }

    this._mapGenStage.set(GlobalMapGenerationStages.OCEAN_GENERATED);
  }

  private generateContinents(map: Map<string, GlobalMapTile>, size: number): void {
    this._mapGenStage.set(GlobalMapGenerationStages.CONTINENTS_GENERATION);

    const continentsCount = this.gameConfigService.getFromSeedInRange(2, 5);
    console.log('continentsCount = ', continentsCount);
    console.log('');

    for (let continent = 0; continent < continentsCount; continent++) {
      let x = -1;
      let y = -1;

      let centerCreated = false;
      let createdTilesQueue = [];

      while (!centerCreated) {
        x = Math.floor(Math.random() * size);
        y = Math.floor(Math.random() * size);

        if (map.get(this.getGlobalMapKey(x, y))?.terrain !== GlobalMapTerrains.FLAT_LAND) {
          map.get(this.getGlobalMapKey(x, y))!.terrain = GlobalMapTerrains.FLAT_LAND;

          createdTilesQueue.push(map.get(this.getGlobalMapKey(x, y)));

          centerCreated = true;
        }
      }

      const processNeighborTile = (x: number, y: number) => {
        if (!this.isCorrectCoordinates(x, y)) return false;

        if (growthProbability > Math.random()) {
          let newTile = map.get(this.getGlobalMapKey(x, y));

          newTile!.terrain = GlobalMapTerrains.FLAT_LAND;
          growthProbability *= 0.99;

          createdTilesQueue.push(newTile);

          return true;
        }
        return false;
      };

      let growthProbability = 1;

      while (growthProbability > 0.25 && createdTilesQueue.length > 0) {
        const currentTile = createdTilesQueue.pop();

        if (currentTile) {
          processNeighborTile(currentTile.x - 1, currentTile.y); // запад
          processNeighborTile(currentTile.x + 1, currentTile.y); // восток
          processNeighborTile(currentTile.x, currentTile.y - 1); // север
          processNeighborTile(currentTile.x, currentTile.y + 1); // юг
        }
      }
    }

    this._mapGenStage.set(GlobalMapGenerationStages.CONTINENTS_GENERATED);
  }
}
