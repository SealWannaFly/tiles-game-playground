import { computed, Injectable, signal } from '@angular/core';
import { GlobalMapTile } from './interfaces/global-map-tile.interface';
import { GlobalMapTerrains } from './enums/global-map-terrains.enum';
import { GlobalMapGenerationStages } from './enums/global-map-generation-stages.enum';
import { SeedService } from '../../../common/services/seed.service';
import { ContinentInfo } from './models/continent-info.model';
import { Coordinate } from '../../../common/interfaces/coordinate.interface';
import { Utils } from '../../../common/utils/utils';

@Injectable({
  providedIn: 'root',
})
export class GameGlobalMapGeneratorService {
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

  constructor(private readonly seedService: SeedService) {}

  public setSize(size: number): void {
    this._size.set(size);
    this._globalMap.set(this.generateGlobalMap(this._size()));
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
        map.set(Utils.getKeyFromCoordinates({ x, y }), {
          x,
          y,
          terrain: GlobalMapTerrains.DEEP_WATER,
        } as GlobalMapTile);
      }
    }

    this._mapGenStage.set(GlobalMapGenerationStages.OCEAN_GENERATED);
  }

  /**
   * Функция генерации континентов
   *
   * @private
   * @returns void
   */
  private generateContinentCenters(map: Map<string, GlobalMapTile>, globalMapSize: number): void {
    const continentsInfo: ContinentInfo[] = [];

    const count = this.seedService.randomIntInRange(3, 6);

    for (let continent = 0; continent < count; continent++) {
      const minDistance = Math.floor(globalMapSize / 2.5);
      const maxAttempts = 1000;

      let attempts = 0;
      let centerCreated = false;

      let createdTilesQueue = [];

      while (!centerCreated && attempts < maxAttempts) {
        const potentialRoot: Coordinate = {
          x: Math.floor(this.seedService.random() * globalMapSize),
          y: Math.floor(this.seedService.random() * globalMapSize),
        };

        attempts++;

        // Проверка расстояния до существующих центров
        let tooClose = false;

        for (const existingContinent of continentsInfo) {
          if (
            !existingContinent.boundingBox.isPointFarFromBoundingBox(potentialRoot, minDistance)
          ) {
            tooClose = true;
            break;
          }
        }

        if (!tooClose) {
          const newContinent = new ContinentInfo(
            new GlobalMapTile(potentialRoot, GlobalMapTerrains.FLAT_LAND),
          );

          map.get(Utils.getKeyFromCoordinates(potentialRoot))!.terrain =
            GlobalMapTerrains.FLAT_LAND;

          console.log('Generated Center = ', Utils.getKeyFromCoordinates(potentialRoot));

          createdTilesQueue.push(map.get(Utils.getKeyFromCoordinates(potentialRoot)));

          centerCreated = true;
        }
      }
    }
  }

  private getContinentsInfo() {
    const continentsInfo = {
      continentsCount: this.seedService.randomIntInRange(2, 5),
      proportions: new Array<number>(),
    };

    for (let i = 0; i < continentsInfo.continentsCount; i++) {
      continentsInfo.proportions.push(this.seedService.randomIntInRange(1, 10));
    }

    const sum = continentsInfo.proportions.reduce((sum: number, current: number) => {
      sum += current;

      return sum;
    }, 0);

    continentsInfo.proportions = continentsInfo.proportions.map((p) => p / sum);

    return continentsInfo;
  }

  private setShallowWater = (coordinate: Coordinate, map: Map<string, GlobalMapTile>) => {
    let neighborTile = map.get(Utils.getKeyFromCoordinates(coordinate));

    if (neighborTile!.terrain !== GlobalMapTerrains.FLAT_LAND) {
      neighborTile!.terrain = GlobalMapTerrains.SHALLOW_WATER;
    }
  };

  private setIntermediateWater = (coordinate: Coordinate, map: Map<string, GlobalMapTile>) => {
    let neighborTile = map.get(Utils.getKeyFromCoordinates(coordinate));

    if (
      neighborTile!.terrain !== GlobalMapTerrains.FLAT_LAND &&
      neighborTile!.terrain !== GlobalMapTerrains.SHALLOW_WATER
    ) {
      neighborTile!.terrain = GlobalMapTerrains.INTERMEDIATE_WATER;
    }
  };

  private processNeighborTile(coordinate: Coordinate, map: Map<string, GlobalMapTile>): void {
    let neighborTile = map.get(Utils.getKeyFromCoordinates(coordinate));

    if (neighborTile && this.seedService.random() < 0.75) {
      if (neighborTile!.terrain !== GlobalMapTerrains.FLAT_LAND) {
        neighborTile!.terrain = GlobalMapTerrains.FLAT_LAND;

        Utils.processTilesAround(neighborTile, 2, mapSize, this.setIntermediateWater);
        Utils.processTilesAround(neighborTile, 1, mapSize, this.setShallowWater);

        continentsSize -= 1;

        const randomIndex = Math.floor(this.seedService.random() * (createdTilesQueue.length + 1));

        createdTilesQueue.splice(randomIndex, 0, neighborTile);

        return true;
      }
    }

    return false;
  }

  private generateContinents(map: Map<string, GlobalMapTile>, size: number): void {
    this._mapGenStage.set(GlobalMapGenerationStages.CONTINENTS_GENERATION);

    const { continentsCount, proportions } = this.getContinentsInfo();

    const minDistance = Math.floor(size / 2.5);
    const centers: { x: number; y: number }[] = [];

    const maxAttempts = 1000;

    for (let continent = 0; continent < continentsCount; continent++) {
      let x = -1;
      let y = -1;

      let centerCreated = false;
      let createdTilesQueue = [];

      let attempts = 0;

      while (!centerCreated && attempts < maxAttempts) {
        x = Math.floor(this.seedService.random() * size);
        y = Math.floor(this.seedService.random() * size);

        attempts++;

        // Проверка расстояния до существующих центров
        let tooClose = false;

        for (const existingCenter of centers) {
          const distance = Math.sqrt(
            Math.pow(x - existingCenter.x, 2) + Math.pow(y - existingCenter.y, 2),
          );

          if (distance < minDistance) {
            tooClose = true;
            break;
          }
        }

        if (
          !tooClose &&
          map.get(Utils.getKeyFromCoordinates({ x, y }))?.terrain !== GlobalMapTerrains.FLAT_LAND
        ) {
          map.get(Utils.getKeyFromCoordinates({ x, y }))!.terrain = GlobalMapTerrains.FLAT_LAND;

          console.log('Generated Center = ', Utils.getKeyFromCoordinates({ x, y }));

          createdTilesQueue.push(map.get(Utils.getKeyFromCoordinates({ x, y })));

          centers.push({ x, y });
          centerCreated = true;
        }
      }

      // 25% Суши на Земле
      let continentsSize = Math.floor(proportions[continent] * size * size * 0.25);

      console.log('continent №', continent + 1);
      console.log('proportion = ', proportions[continent]);
      console.log('continentsSize = ', continentsSize);

      while (continentsSize > 0 && createdTilesQueue.length > 0) {
        const randomIndex = Math.floor(this.seedService.random() * createdTilesQueue.length);

        const currentTile = createdTilesQueue.splice(randomIndex, 1).at(0);

        if (currentTile) {
          Utils.processTilesAround(currentTile, 1, size, processNeighborTile);
        }
      }

      console.log('unused continentsSize = ', continentsSize);
      console.log('');
    }

    this._mapGenStage.set(GlobalMapGenerationStages.CONTINENTS_GENERATED);
  }
}
