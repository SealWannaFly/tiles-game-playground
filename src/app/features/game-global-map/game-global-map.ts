import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { GameConfigsLoaderService } from '../../common/services/game-configs-loader.service';
import { CommonBase } from '../../common/base/common.base';
import { GameGlobalMapGeneratorService } from './services/game-global-map-generator.service';
import { takeUntil } from 'rxjs';
import { GlobalMapTile } from './services/models/global-map-tile.class';
import { SpriteSheetLoaderService } from '../../common/services/game-sprite-sheet-loader/sprite-sheet-loader.service';
import { SeedService } from '../../common/services/seed.service';
import { GlobalMap } from './services/models/global-map.model';
import { Point } from '../../common/models/point.class';
import { JsonPipe } from '@angular/common';
import {
  AdjacentTileSprite,
  TileSpriteKey,
} from '../../common/services/game-sprite-sheet-loader/classes/tile-sprite-key.class';
import { MapDirection } from '../../common/enums/map-direction.enum';

@Component({
  selector: 'app-game-global-map',
  standalone: true,
  imports: [ReactiveFormsModule, JsonPipe],
  templateUrl: './game-global-map.html',
  styleUrl: './game-global-map.scss',
})
export class GameGlobalMap extends CommonBase implements OnInit {
  @ViewChild('gameGlobalMap') canvasRef!: ElementRef<HTMLCanvasElement>;
  private _globalMap: GlobalMap;

  public canvasSize: number;

  selectedTile: GlobalMapTile | null;

  readonly numericSeed = this.seedService.numericSeed;

  readonly form: FormGroup;

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
      this._globalMap = this.gameGlobalMapService.generateGlobalMap(this.form.value.size, 64);
      this.canvasSize = this._globalMap.canvasSize;

      this.drawMap();
    }
  }

  drawMap(): void {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    ctx.clearRect(0, 0, this._globalMap.canvasSize, this._globalMap.canvasSize);

    ctx.save();

    // Убирает белые полосы на стыке пикселей при scale
    ctx.imageSmoothingEnabled = false;

    ctx.scale(this._globalMap.camera.scale, this._globalMap.camera.scale);
    ctx.translate(this._globalMap.camera.translation.x, this._globalMap.camera.translation.y);

    this._globalMap.tiles.forEach((tile) => {
      this.drawTile(ctx, tile, this._globalMap.textureSize);
    });

    ctx.restore();
  }

  private drawTile(ctx: CanvasRenderingContext2D, tile: GlobalMapTile, tileSize: number): void {
    const adjacentTiles: AdjacentTileSprite[] = [];

    this._globalMap.processTilesByDirection(tile.point, 1, (point, direction) => {
      const tileTerrain = this._globalMap.getTile(point)?.terrain;

      if (tileTerrain && tileTerrain !== tile.terrain) {
        let adjacent = adjacentTiles.find((v) => v.key === tileTerrain);

        if (!adjacent) {
          adjacent = {
            key: tileTerrain,
            connections: new Map<MapDirection, boolean>(),
          };

          adjacentTiles.push(adjacent);
        }

        adjacent.connections.set(direction, true);
      }
    });

    const tileSpriteKey = new TileSpriteKey(tile.terrain, adjacentTiles);

    const sprite = this.spriteSheetLoaderService.getSprite(tileSpriteKey);

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

      if (tile === this._globalMap.selectedTile) {
        ctx.save();

        const lineWidth = Math.trunc(this._globalMap.textureSize / 10);

        ctx.strokeStyle = 'black';
        ctx.lineWidth = lineWidth;

        ctx.strokeRect(
          tile.point.x * tileSize + lineWidth / 2,
          tile.point.y * tileSize + lineWidth / 2,
          tileSize - lineWidth,
          tileSize - lineWidth,
        );

        ctx.restore();
      }
    }
  }

  onCanvasWheel(wheelEvent: WheelEvent): void {
    wheelEvent.preventDefault();

    this._globalMap.camera.scale = wheelEvent.deltaY;

    if (!this._globalMap.camera.scaleChanged) {
      return;
    }

    const canvasPoint = this.clientToCanvasPoint(new Point(wheelEvent.clientX, wheelEvent.clientY));

    this._globalMap.camera.translationStart = new Point(
      canvasPoint.x * (this._globalMap.camera.scale / this._globalMap.camera.prevScale),
      canvasPoint.y * (this._globalMap.camera.scale / this._globalMap.camera.prevScale),
    );
    this._globalMap.camera.translationEnd = new Point(canvasPoint.x, canvasPoint.y);

    this.drawMap();
  }

  onCanvasDragStart(dragEvent: DragEvent): void {
    this._globalMap.camera.translationStart = this.clientToCanvasPoint(
      new Point(dragEvent.clientX, dragEvent.clientY),
    );
  }

  onCanvasDragEnd(dragEvent: DragEvent): void {
    this._globalMap.camera.translationEnd = this.clientToCanvasPoint(
      new Point(dragEvent.clientX, dragEvent.clientY),
    );

    this.drawMap();
  }

  onClick(pointerEvent: PointerEvent): void {
    this._globalMap.selectedPoint = this.clientToCanvasPoint(
      new Point(pointerEvent.clientX, pointerEvent.clientY),
    );

    this.selectedTile = this._globalMap.selectedTile;

    this.drawMap();
  }

  clientToCanvasPoint(point: Point): Point {
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();

    return new Point(
      Math.trunc(((point.x - rect.left) / rect.width) * this._globalMap.canvasSize),
      Math.trunc(((point.y - rect.top) / rect.height) * this._globalMap.canvasSize),
    );
  }

  logUnknownSprites() {
    console.log(
      'unknownSprites = ',
      Array.from(this.spriteSheetLoaderService.unknownSprites).filter((us: string) =>
        us.includes('Flat Land|Shallow Water|'),
      ),
    );
  }
}
