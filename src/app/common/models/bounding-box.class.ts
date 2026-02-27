import { Coordinate, defaultCoordinate } from '../interfaces/coordinate.interface';
import { Utils } from '../utils/utils';

export class BoundingBox {
  private readonly _minCoordinate: Coordinate = defaultCoordinate;
  private readonly _maxCoordinate: Coordinate = defaultCoordinate;

  constructor(coordinate: Coordinate) {
    this._minCoordinate = coordinate;
    this._maxCoordinate = coordinate;
  }

  public update(coordinate: Coordinate): void {
    // Обновляем максимальные значения
    if (coordinate.x > this._maxCoordinate.x) {
      this._maxCoordinate.x = coordinate.x;
    }

    if (coordinate.y > this._maxCoordinate.y) {
      this._maxCoordinate.y = coordinate.y;
    }

    // Обновляем минимальные значения
    if (coordinate.x < this._minCoordinate.x) {
      this._minCoordinate.x = coordinate.x;
    }

    if (coordinate.y < this._minCoordinate.y) {
      this._minCoordinate.y = coordinate.y;
    }
  }

  public isPointFarFromBoundingBox(coordinate: Coordinate, minDistance: number): boolean {
    const closest: Coordinate = {
      x: Math.max(this._minCoordinate.x, Math.min(coordinate.x, this._maxCoordinate.x)),
      y: Math.max(this._minCoordinate.y, Math.min(coordinate.y, this._maxCoordinate.y)),
    };

    return Utils.distance(coordinate, closest) > minDistance;
  }
}
