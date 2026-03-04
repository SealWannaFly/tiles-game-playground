import { Point } from './point.class';

export class MapScale {
  private _scale: number;
  private _prevScale: number;

  public readonly minScale: number;
  public readonly maxScale: number;

  private _translationStart: Point;
  private _translationEnd: Point;

  constructor(minScale: number, maxScale: number) {
    this._scale = 1;
    this._prevScale = 1;
    this._translationStart = new Point(0, 0);
    this._translationEnd = new Point(0, 0);

    this.minScale = minScale;
    this.maxScale = maxScale;
  }

  public set scale(deltaY: number) {
    this._prevScale = this._scale;
    this._scale += deltaY < 0 ? 0.5 : -0.5;

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

  public get prevScale() {
    return this._prevScale;
  }

  public set translationStart(position: Point) {
    this._translationStart = position;
  }

  public get translationStart() {
    return this._translationStart;
  }

  public set translationEnd(position: Point) {
    this._translationEnd = position;
  }

  public get translationEnd() {
    return this._translationEnd;
  }
}
