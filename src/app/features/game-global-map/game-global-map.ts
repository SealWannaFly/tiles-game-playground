import { Component, ElementRef, HostListener, OnInit, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { GameConfigsLoaderService } from '../../common/services/game-configs-loader.service';
import { CommonBase } from '../../common/base/common.base';
import { GameGlobalMapGeneratorService } from './services/game-global-map-generator.service';
import { takeUntil } from 'rxjs';
import { GlobalMapTile } from './services/interfaces/global-map-tile.interface';
import { SpriteSheetLoaderService } from '../../common/services/game-sprite-sheet-loader/sprite-sheet-loader.service';
import { SeedService } from '../../common/services/seed.service';
import { GlobalMap } from './services/models/global-map.model';
import { Point } from '../../common/models/point.class';

@Component({
  selector: 'app-game-global-map',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './game-global-map.html',
  styleUrl: './game-global-map.scss',
})
export class GameGlobalMap extends CommonBase implements OnInit {
  @ViewChild('gameGlobalMap') canvasRef!: ElementRef<HTMLCanvasElement>;
  private _globalMap: GlobalMap;

  readonly numericSeed = this.seedService.numericSeed;

  readonly tileSize: number = 64;

  readonly canvasWidth = signal(0);
  readonly canvasHeight = signal(0);

  readonly form: FormGroup;

  cx = 0;
  cy = 0;

  constructor(
    private readonly fb: FormBuilder,
    private readonly seedService: SeedService,
    private readonly gameConfigService: GameConfigsLoaderService,
    private readonly gameGlobalMapService: GameGlobalMapGeneratorService,
    private readonly spriteSheetLoaderService: SpriteSheetLoaderService,
  ) {
    super();

    this.form = this.fb.group({
      seed: [this.seedService.seed(), [Validators.required]],
      size: [100, [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.gameConfigService.loadTerrains().pipe(takeUntil(this.destroyed$)).subscribe();
  }

  @HostListener('window:resize')
  onResize() {
    this.drawMap();
  }

  generateMap(): void {
    if (this.form.valid) {
      this.seedService.setSeed(this.form.value.seed);
      this._globalMap = this.gameGlobalMapService.generateGlobalMap(this.form.value.size);
    }
  }

  drawMap(): void {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    this.canvasWidth.set(this._globalMap.size * this.tileSize);
    this.canvasHeight.set(this._globalMap.size * this.tileSize);

    ctx.clearRect(0, 0, this.canvasWidth(), this.canvasHeight());

    ctx.save();

    ctx.scale(this._globalMap.mapScale.scale, this._globalMap.mapScale.scale);
    ctx.translate(this._globalMap.mapScale.translation.x, this._globalMap.mapScale.translation.y);

    this._globalMap.tiles.forEach((tile) => {
      this.drawTile(ctx, tile, this.tileSize);
    });

    ctx.restore();
  }

  private drawTile(ctx: CanvasRenderingContext2D, tile: GlobalMapTile, tileSize: number): void {
    const spriteSheet = this.spriteSheetLoaderService.getSpriteSheet('Terrain');

    if (spriteSheet) {
      const sprite = spriteSheet.getSprite(tile.terrain);

      if (sprite) {
        ctx.drawImage(
          sprite.image,
          sprite.region.x,
          sprite.region.y,
          sprite.region.width,
          sprite.region.height,
          tile.point.x * tileSize,
          tile.point.y * tileSize,
          tileSize,
          tileSize,
        );
      }
    }
  }

  onCanvasWheel(wheelEvent: WheelEvent): void {
    wheelEvent.preventDefault();

    this._globalMap.mapScale.scale = wheelEvent.deltaY;

    if (!this._globalMap.mapScale.scaleChanged) {
      return;
    }

    const canvasPoint = this.clientToCanvasPoint(new Point(wheelEvent.clientX, wheelEvent.clientY));

    this._globalMap.mapScale.translationStart = new Point(
      canvasPoint.x * (this._globalMap.mapScale.scale / this._globalMap.mapScale.prevScale),
      canvasPoint.y * (this._globalMap.mapScale.scale / this._globalMap.mapScale.prevScale),
    );
    this._globalMap.mapScale.translationEnd = new Point(canvasPoint.x, canvasPoint.y);

    this.drawMap();
  }

  onCanvasDragStart(dragEvent: DragEvent): void {
    this._globalMap.mapScale.translationStart = this.clientToCanvasPoint(
      new Point(dragEvent.clientX, dragEvent.clientY),
    );
  }

  onCanvasDragEnd(dragEvent: DragEvent): void {
    this._globalMap.mapScale.translationEnd = this.clientToCanvasPoint(
      new Point(dragEvent.clientX, dragEvent.clientY),
    );

    this.drawMap();
  }

  clientToCanvasPoint(point: Point): Point {
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();

    return new Point(
      ((point.x - rect.left) / rect.width) * this.canvasWidth(),
      ((point.y - rect.top) / rect.height) * this.canvasHeight(),
    );
  }
}
