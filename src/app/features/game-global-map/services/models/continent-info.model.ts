import { BoundingBox } from '../../../../common/models/bounding-box.class';
import { Point } from '../../../../common/models/point.class';

export class ContinentInfo {
  public readonly root: Point;
  public readonly boundingBox: BoundingBox;

  constructor(root: Point) {
    this.root = root;
    this.boundingBox = new BoundingBox(root);
  }

  public updateBoundingBox(point: Point): void {
    this.boundingBox.update(point);
  }
}
