import { GlobalMapTerrains } from '../enums/global-map-terrains.enum';
import { Point } from '../../../../common/models/point.class';

export class GlobalMapTile {
  private readonly _point: Point;
  private _terrain: GlobalMapTerrains;

  constructor(point: Point, terrain: GlobalMapTerrains) {
    this._point = point;
    this._terrain = terrain;
  }

  public get point() {
    return this._point;
  }

  public set terrain(terrain: GlobalMapTerrains) {
    this._terrain = terrain;
  }

  public get terrain() {
    return this._terrain;
  }
}
