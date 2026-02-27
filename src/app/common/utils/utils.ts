import { Coordinate } from '../interfaces/coordinate.interface';

export class Utils {
  public static isCorrectCoordinate(coordinate: number, size: number): boolean {
    return coordinate > -1 && coordinate < size;
  }

  public static isCorrectCoordinates(coordinate: Coordinate, size: number): boolean {
    return (
      this.isCorrectCoordinate(coordinate.x, size) && this.isCorrectCoordinate(coordinate.y, size)
    );
  }

  public static processTilesAround = (
    coordinate: Coordinate,
    radius: number,
    mapSize: number,
    callback: (x: number, y: number) => any,
  ) => {
    for (let x = coordinate.x - radius; x <= coordinate.x + radius; x++) {
      for (let y = coordinate.y - radius; y <= coordinate.y + radius; y++) {
        if (this.isCorrectCoordinates({ x, y }, mapSize)) {
          callback(x, y);
        }
      }
    }
  };

  public static getKeyFromCoordinates(coordinates: Coordinate): string {
    return `${coordinates.x}:${coordinates.y}`;
  }

  public static distance(a: Coordinate, b: Coordinate): number {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
  }

  public static blobToImageElement(blob: Blob): HTMLImageElement {
    const blobUrl = URL.createObjectURL(blob);

    const img = new Image();
    img.src = blobUrl;

    return img;
  }
}
