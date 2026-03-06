import { GlobalMapTile } from '../interfaces/global-map-tile.interface';
import { ContinentInfo } from './continent-info.model';
import { Point } from '../../../../common/models/point.class';
import { GlobalMapTerrains } from '../enums/global-map-terrains.enum';
import { CanvasCamera } from '../../../../common/models/canvas-camera.class';

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
    console.log('canvasPoint = ', canvasPoint);
    console.log('scale = ', this.camera.scale);
    console.log('translation = ', this.camera.translation);

    const mapPoint = new Point(
      Math.trunc(canvasPoint!.x / this.textureSize),
      Math.trunc(canvasPoint!.y / this.textureSize),
    );

    console.log('mapPoint = ', mapPoint);

    this._selectedPoint = this.isCorrectPoint(mapPoint) ? mapPoint : null;
    this._selectedTile = this.isCorrectPoint(mapPoint) ? this.getTile(mapPoint) || null : null;

    console.log('selectedTile = ', this._selectedTile);
    console.log('');
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
}
