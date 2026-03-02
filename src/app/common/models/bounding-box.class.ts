import { Point } from './point.class';
import { Utils } from '../utils/utils';

export class BoundingBox {
  private readonly _minPoint: Point = new Point(-1, -1);
  private readonly _maxPoint: Point = new Point(-1, -1);

  constructor(point: Point) {
    this._minPoint = point;
    this._maxPoint = point;
  }

  public update(point: Point): void {
    // Обновляем максимальные значения
    if (point.x > this._maxPoint.x) {
      this._maxPoint.x = point.x;
    }

    if (point.y > this._maxPoint.y) {
      this._maxPoint.y = point.y;
    }

    // Обновляем минимальные значения
    if (point.x < this._minPoint.x) {
      this._minPoint.x = point.x;
    }

    if (point.y < this._minPoint.y) {
      this._minPoint.y = point.y;
    }
  }

  public isPointFarFromBoundingBox(point: Point, minDistance: number): boolean {
    const closest: Point = new Point(
      Math.max(this._minPoint.x, Math.min(point.x, this._maxPoint.x)),
      Math.max(this._minPoint.y, Math.min(point.y, this._maxPoint.y)),
    );

    return Utils.distance(point, closest) > minDistance;
  }
}
