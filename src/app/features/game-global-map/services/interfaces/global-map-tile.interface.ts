import { GlobalMapTerrains } from '../enums/global-map-terrains.enum';
import { Point } from '../../../../common/models/point.class';

export class GlobalMapTile {
  public point: Point;
  public terrain: GlobalMapTerrains;

  constructor(point: Point, terrain: GlobalMapTerrains) {
    this.point = point;
    this.terrain = terrain;
  }
}
