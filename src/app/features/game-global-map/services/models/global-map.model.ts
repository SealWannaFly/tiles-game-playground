import { GlobalMapTile } from '../interfaces/global-map-tile.interface';
import { ContinentInfo } from './continent-info.model';
import { Point } from '../../../../common/models/point.class';
import { GlobalMapTerrains } from '../enums/global-map-terrains.enum';
import { MapScale } from '../../../../common/models/map-scale.class';

export class GlobalMap {
  private readonly _size: number;

  private _tiles: Map<string, GlobalMapTile>;
  private _continents: Map<string, ContinentInfo>;

  public readonly _mapScale: MapScale;

  constructor(size: number) {
    this._size = size;
    this._tiles = new Map<string, GlobalMapTile>();
    this._continents = new Map<string, ContinentInfo>();
    this._mapScale = new MapScale(1, 5);
  }

  public get size() {
    return this._size;
  }

  public get continents() {
    return Array.from(this._continents.values());
  }

  public get tiles() {
    return Array.from(this._tiles.values());
  }

  public get mapScale() {
    return this._mapScale;
  }

  public isCorrectCoordinate(coordinate: number): boolean {
    return coordinate > -1 && coordinate < this._size;
  }

  public isCorrectPoint(point: Point): boolean {
    return this.isCorrectCoordinate(point.x) && this.isCorrectCoordinate(point.y);
  }

  public setTile(tile: GlobalMapTile): void {
    if (this.isCorrectPoint(tile.point)) {
      this._tiles.set(tile.point.toStringKey(), tile);
    }
  }

  public getTile(point: Point): GlobalMapTile | undefined {
    if (this.isCorrectPoint(point)) {
      return this._tiles.get(point.toStringKey());
    } else {
      return undefined;
    }
  }

  public addContinent(point: Point, continent: ContinentInfo): void {
    this._continents.set(point.toStringKey(), continent);
    this._tiles.set(point.toStringKey(), new GlobalMapTile(point, GlobalMapTerrains.FLAT_LAND));
  }

  public setShallowWater = (point: Point) => {
    let neighborTile = this.getTile(point);

    if (neighborTile!.terrain !== GlobalMapTerrains.FLAT_LAND) {
      neighborTile!.terrain = GlobalMapTerrains.SHALLOW_WATER;
    }
  };

  public setIntermediateWater = (point: Point) => {
    let neighborTile = this.getTile(point);

    if (
      neighborTile!.terrain !== GlobalMapTerrains.FLAT_LAND &&
      neighborTile!.terrain !== GlobalMapTerrains.SHALLOW_WATER
    ) {
      neighborTile!.terrain = GlobalMapTerrains.INTERMEDIATE_WATER;
    }
  };

  public processTilesAround = (point: Point, radius: number, callback: (point: Point) => any) => {
    for (let x = point.x - radius; x <= point.x + radius; x++) {
      for (let y = point.y - radius; y <= point.y + radius; y++) {
        const neighborPoint = new Point(x, y);

        if (this.isCorrectPoint(neighborPoint)) {
          callback(neighborPoint);
        }
      }
    }
  };
}
