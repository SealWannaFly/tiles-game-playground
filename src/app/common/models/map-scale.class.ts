import { Point } from './point.class';

export class MapScale {
  private _scale: number;
  private _prevScale: number;

  public readonly minScale: number;
  public readonly maxScale: number;

  private readonly _translationStart: Point;
  private readonly _translationEnd: Point;

  private readonly _translation: Point;

  constructor(minScale: number, maxScale: number) {
    this._scale = 1;
    this._prevScale = 1;

    this._translationStart = new Point(0, 0);
    this._translationEnd = new Point(0, 0);
    this._translation = new Point(0, 0);

    this.minScale = minScale;
    this.maxScale = maxScale;
  }

  public set scale(deltaY: number) {
    this._prevScale = this._scale;
    this._scale += deltaY < 0 ? 1 : -1;

    if (this._scale > this.maxScale) {
      this._scale = this.maxScale;
    }

    if (this._scale < this.minScale) {
      this._scale = this.minScale;
    }
  }

  public get scale() {
    return this._scale;
  }

  public get scaleChanged() {
    return this._scale !== this._prevScale;
  }

  public get prevScale() {
    return this._prevScale;
  }

  public get translation() {
    if (this.scaleChanged && this._scale === this.minScale) {
      this._translationStart.reset();
      this._translationEnd.reset();
      this._translation.reset();
    }

    return this._translation;
  }

  public set translationStart(position: Point) {
    this._translationStart.update(position);
  }

  public set translationEnd(position: Point) {
    this._translationEnd.update(position);

    this._translation.x += Math.trunc(
      (this._translationEnd.x - this._translationStart.x) / this._scale,
    );
    this._translation.y += Math.trunc(
      (this._translationEnd.y - this._translationStart.y) / this._scale,
    );
  }
}
