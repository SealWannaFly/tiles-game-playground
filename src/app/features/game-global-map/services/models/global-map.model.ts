import { GlobalMapTile } from './global-map-tile.class';
import { ContinentInfo } from './continent-info.model';
import { Point } from '../../../../common/models/point.class';
import { GlobalMapTerrains } from '../enums/global-map-terrains.enum';
import { CanvasCamera } from '../../../../common/models/canvas-camera.class';
import { MAP_DIRECTION_ORDER, MapDirection } from '../../../../common/enums/map-direction.enum';

export class GlobalMap {
  private readonly _size: number;
  private readonly _texturesSize: number;

  private _tiles: Map<string, GlobalMapTile>;
  private _continents: Map<string, ContinentInfo>;

  private _selectedPoint: Point | null = null;
  private _selectedTile: GlobalMapTile | null = null;

  public readonly _camera: CanvasCamera;

  constructor(size: number, texturesSize: number) {
    this._size = size;
    this._texturesSize = texturesSize;

    this._tiles = new Map<string, GlobalMapTile>();
    this._continents = new Map<string, ContinentInfo>();

    this._camera = new CanvasCamera(1, 10);
  }

  public get size() {
    return this._size;
  }

  public get textureSize() {
    return this._texturesSize;
  }

  public get canvasSize() {
    return this._size * this._texturesSize;
  }

  public get continents() {
    return Array.from(this._continents.values());
  }

  public get tiles() {
    return Array.from(this._tiles.values());
  }

  public get camera() {
    return this._camera;
  }

  public set selectedPoint(canvasPoint: Point | null) {
    const mapPoint = new Point(
      Math.trunc(
        (canvasPoint!.x - this.camera.translation.x * this.camera.scale) /
          this.camera.scale /
          this.textureSize,
      ),
      Math.trunc(
        (canvasPoint!.y - this.camera.translation.y * this.camera.scale) /
          this.camera.scale /
          this.textureSize,
      ),
    );

    this._selectedPoint = this.isCorrectPoint(mapPoint) ? mapPoint : null;
    this._selectedTile = this.isCorrectPoint(mapPoint) ? this.getTile(mapPoint) || null : null;
  }

  public get selectedPoint() {
    return this._selectedPoint;
  }

  public get selectedTile() {
    return this._selectedTile;
  }

  public isCorrectCoordinate(coordinate: number): boolean {
    return coordinate > -1 && coordinate < this._size;
  }

  public isCorrectPoint(point: Point | null): boolean {
    if (!point) return false;

    return this.isCorrectCoordinate(point.x) && this.isCorrectCoordinate(point.y);
  }

  public setTile(tile: GlobalMapTile): void {
    if (this.isCorrectPoint(tile.point)) {
      this._tiles.set(tile.point.toStringKey(), tile);
    }
  }

  public getTile(point: Point | null): GlobalMapTile | undefined {
    if (!point) return undefined;

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

  public processTilesByDirection = (
    point: Point,
    radius: number,
    callback: (point: Point, direction: MapDirection) => any,
  ) => {
    // Обходим все направления по порядку
    for (const direction of MAP_DIRECTION_ORDER) {
      for (let step = 1; step <= radius; step++) {
        let neighborPoint: Point;

        switch (direction) {
          case MapDirection.N:
            neighborPoint = new Point(point.x, point.y - step);
            break;
          case MapDirection.NE:
            neighborPoint = new Point(point.x + step, point.y - step);
            break;
          case MapDirection.E:
            neighborPoint = new Point(point.x + step, point.y);
            break;
          case MapDirection.SE:
            neighborPoint = new Point(point.x + step, point.y + step);
            break;
          case MapDirection.S:
            neighborPoint = new Point(point.x, point.y + step);
            break;
          case MapDirection.SW:
            neighborPoint = new Point(point.x - step, point.y + step);
            break;
          case MapDirection.W:
            neighborPoint = new Point(point.x - step, point.y);
            break;
          case MapDirection.NW:
            neighborPoint = new Point(point.x - step, point.y - step);
            break;
        }

        if (this.isCorrectPoint(neighborPoint)) {
          callback(neighborPoint, direction);
        }
      }
    }
  };
}
