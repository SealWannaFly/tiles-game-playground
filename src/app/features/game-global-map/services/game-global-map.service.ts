import { computed, Injectable, signal } from '@angular/core';
import { GlobalMapTile } from './interfaces/global-map-tile.interface';
import { GlobalMapTerrains } from './enums/global-map-terrains.enum';
import { GlobalMapGenerationStages } from './enums/global-map-generation-stages.enum';
import { SeedService } from '../../../common/services/seed.service';

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

  constructor(private readonly seedService: SeedService) {}

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

  private generateContinents(map: Map<string, GlobalMapTile>, size: number): void {
    this._mapGenStage.set(GlobalMapGenerationStages.CONTINENTS_GENERATION);

    const { continentsCount, proportions } = this.getContinentsInfo();

    console.log('Размер карты = ', `${size} x ${size}`);
    console.log('');

    console.log('continentsCount = ', continentsCount);
    console.log('');

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
          map.get(this.getGlobalMapKey(x, y))?.terrain !== GlobalMapTerrains.FLAT_LAND
        ) {
          map.get(this.getGlobalMapKey(x, y))!.terrain = GlobalMapTerrains.FLAT_LAND;

          console.log('Generated Center = ', this.getGlobalMapKey(x, y));

          createdTilesQueue.push(map.get(this.getGlobalMapKey(x, y)));

          centers.push({ x, y });
          centerCreated = true;
        }
      }

      const processTilesAround = (
        centerX: number,
        centerY: number,
        radius: number,
        callback: (x: number, y: number) => any,
      ) => {
        for (let x = centerX - radius; x <= centerX + radius; x++) {
          for (let y = centerY - radius; y <= centerY + radius; y++) {
            if (this.isCorrectCoordinates(x, y)) {
              callback(x, y);
            }
          }
        }
      };

      const setShallowWater = (x: number, y: number) => {
        let neighborTile = map.get(this.getGlobalMapKey(x, y));

        if (neighborTile!.terrain !== GlobalMapTerrains.FLAT_LAND) {
          neighborTile!.terrain = GlobalMapTerrains.SHALLOW_WATER;
        }
      };

      const setIntermediateWater = (x: number, y: number) => {
        let neighborTile = map.get(this.getGlobalMapKey(x, y));

        if (
          neighborTile!.terrain !== GlobalMapTerrains.FLAT_LAND &&
          neighborTile!.terrain !== GlobalMapTerrains.SHALLOW_WATER
        ) {
          neighborTile!.terrain = GlobalMapTerrains.INTERMEDIATE_WATER;
        }
      };

      const processNeighborTile = (x: number, y: number) => {
        if (!this.isCorrectCoordinates(x, y)) return false;

        let neighborTile = map.get(this.getGlobalMapKey(x, y));

        if (this.seedService.random() < 0.75) {
          if (neighborTile!.terrain !== GlobalMapTerrains.FLAT_LAND) {
            neighborTile!.terrain = GlobalMapTerrains.FLAT_LAND;

            processTilesAround(x, y, 2, setIntermediateWater);
            processTilesAround(x, y, 1, setShallowWater);

            continentsSize -= 1;

            const randomIndex = Math.floor(
              this.seedService.random() * (createdTilesQueue.length + 1),
            );

            createdTilesQueue.splice(randomIndex, 0, neighborTile);

            return true;
          }
        }

        return false;
      };

      // 65% Суши на Земле
      let continentsSize = Math.floor(proportions[continent] * size * size * 0.25);

      console.log('continent №', continent + 1);
      console.log('proportion = ', proportions[continent]);
      console.log('continentsSize = ', continentsSize);

      while (continentsSize > 0 && createdTilesQueue.length > 0) {
        const randomIndex = Math.floor(this.seedService.random() * createdTilesQueue.length);

        const currentTile = createdTilesQueue.splice(randomIndex, 1).at(0);

        if (currentTile) {
          processTilesAround(currentTile.x, currentTile.y, 1, processNeighborTile);
        }
      }

      console.log('unused continentsSize = ', continentsSize);
      console.log('');
    }

    this._mapGenStage.set(GlobalMapGenerationStages.CONTINENTS_GENERATED);
  }
}
