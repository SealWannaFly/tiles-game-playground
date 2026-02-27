import { GlobalMapTerrains } from '../enums/global-map-terrains.enum';
import { Coordinate } from '../../../../common/interfaces/coordinate.interface';

export class GlobalMapTile {
  public coordinate: Coordinate;
  public terrain: GlobalMapTerrains;

  constructor(coordinate: Coordinate, terrain: GlobalMapTerrains) {
    this.coordinate = coordinate;
    this.terrain = terrain;
  }
}
