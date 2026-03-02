import { Point } from '../models/point.class';

export class Utils {
  public static distance(a: Point, b: Point): number {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
  }

  public static blobToImageElement(blob: Blob): HTMLImageElement {
    const blobUrl = URL.createObjectURL(blob);

    const img = new Image();
    img.src = blobUrl;

    return img;
  }
}
