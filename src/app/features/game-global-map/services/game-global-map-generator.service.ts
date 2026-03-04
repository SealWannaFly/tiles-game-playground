import { Injectable, signal } from '@angular/core';
import { GlobalMapTile } from './interfaces/global-map-tile.interface';
import { GlobalMapTerrains } from './enums/global-map-terrains.enum';
import { GlobalMapGenerationStages } from './enums/global-map-generation-stages.enum';
import { SeedService } from '../../../common/services/seed.service';
import { ContinentInfo } from './models/continent-info.model';
import { Point } from '../../../common/models/point.class';
import { GlobalMap } from './models/global-map.model';

@Injectable({
  providedIn: 'root',
})
export class GameGlobalMapGeneratorService {
  private readonly _mapGenStage = signal<GlobalMapGenerationStages>(
    GlobalMapGenerationStages.EMPTY,
  );
  public readonly mapGenStages = this._mapGenStage.asReadonly();

  constructor(private readonly seedService: SeedService) {}

  public generateGlobalMap(size: number): GlobalMap {
    const globalMap = new GlobalMap(size);

    this.generateOcean(globalMap);
    this.generateContinents(globalMap);

    return globalMap;
  }

  private generateOcean(map: GlobalMap): void {
    this._mapGenStage.set(GlobalMapGenerationStages.OCEAN_GENERATION);

    for (let x = 0; x < map.size; x++) {
      for (let y = 0; y < map.size; y++) {
        const point = new Point(x, y);

        map.setTile(new GlobalMapTile(point, GlobalMapTerrains.DEEP_WATER));
      }
    }

    this._mapGenStage.set(GlobalMapGenerationStages.OCEAN_GENERATED);
  }

  private getContinentsSize(map: GlobalMap) {
    const proportions = [];

    for (let i = 0; i < map.continents.length; i++) {
      proportions.push(this.seedService.randomIntInRange(1, 10));
    }

    const sum = proportions.reduce((sum: number, current: number) => {
      sum += current;

      return sum;
    }, 0);

    // 25% Суши на планете
    return proportions.map((p) => Math.floor((p / sum) * map.size * map.size * 0.25));
  }

  /**
   * Функция генерации континентов
   *
   * @private
   * @returns void
   */
  private generateContinents(map: GlobalMap): void {
    this._mapGenStage.set(GlobalMapGenerationStages.CONTINENTS_GENERATION);

    const count = this.seedService.randomIntInRange(3, 6);

    for (let continent = 0; continent < count; continent++) {
      const minDistance = Math.floor(map.size / 2.5);
      const maxAttempts = 1000;

      let attempts = 0;
      let centerCreated = false;

      while (!centerCreated && attempts < maxAttempts) {
        const potentialRoot = new Point(
          Math.floor(this.seedService.random() * map.size),
          Math.floor(this.seedService.random() * map.size),
        );

        attempts++;

        // Проверка расстояния до существующих центров
        let tooClose = false;

        for (const existingContinent of map.continents) {
          if (
            !existingContinent.boundingBox.isPointFarFromBoundingBox(potentialRoot, minDistance)
          ) {
            tooClose = true;
            break;
          }
        }

        if (!tooClose) {
          map.addContinent(potentialRoot, new ContinentInfo(potentialRoot));
          centerCreated = true;
        }
      }
    }

    const continentSizes = this.getContinentsSize(map);

    for (let continent = 0; continent < count; continent++) {
      let continentsSize = continentSizes[continent];
      const createdTilesQueue: Point[] = [map.continents[continent].root];

      while (continentsSize > 0 && createdTilesQueue.length > 0) {
        const randomIndex = Math.floor(this.seedService.random() * createdTilesQueue.length);

        const currentTilePoint = createdTilesQueue.splice(randomIndex, 1).at(0);

        if (currentTilePoint) {
          map.processTilesAround(currentTilePoint, 1, (tile) => {
            const neighborTile = map.getTile(tile);

            if (neighborTile && this.seedService.random() < 0.75) {
              if (neighborTile!.terrain !== GlobalMapTerrains.FLAT_LAND) {
                neighborTile!.terrain = GlobalMapTerrains.FLAT_LAND;

                map.processTilesAround(neighborTile.point, 2, map.setIntermediateWater);
                map.processTilesAround(neighborTile.point, 1, map.setShallowWater);

                continentsSize -= 1;

                const randomIndex = Math.floor(
                  this.seedService.random() * (createdTilesQueue.length + 1),
                );

                createdTilesQueue.splice(randomIndex, 0, neighborTile.point);
              }
            }
          });
        } else {
          break;
        }
      }
    }

    console.log('Generated continents = ', map.continents.length);

    this._mapGenStage.set(GlobalMapGenerationStages.CONTINENTS_GENERATED);
  }
}
