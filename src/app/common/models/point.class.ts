export class Point {
  public x: number;
  public y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  public update(point: Point): void {
    this.x = point.x;
    this.y = point.y;
  }

  public reset(): void {
    this.x = 0;
    this.y = 0;
  }

  public toStringKey(): string {
    return `${this.x}:${this.y}`;
  }
}
