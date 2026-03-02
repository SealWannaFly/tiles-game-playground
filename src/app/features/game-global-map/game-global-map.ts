import { Component, ElementRef, HostListener, OnInit, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { GameConfigsLoaderService } from '../../common/services/game-configs-loader.service';
import { CommonBase } from '../../common/base/common.base';
import { GameGlobalMapGeneratorService } from './services/game-global-map-generator.service';
import { takeUntil } from 'rxjs';
import { GlobalMapTile } from './services/interfaces/global-map-tile.interface';
import { SpriteSheetLoaderService } from '../../common/services/game-sprite-sheet-loader/sprite-sheet-loader.service';
import { SeedService } from '../../common/services/seed.service';

@Component({
  selector: 'app-game-global-map',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './game-global-map.html',
  styleUrl: './game-global-map.scss',
})
export class GameGlobalMap extends CommonBase implements OnInit {
  @ViewChild('gameGlobalMap') canvasRef!: ElementRef<HTMLCanvasElement>;

  readonly numericSeed = this.seedService.numericSeed;

  readonly tileSize: number = 64;

  readonly canvasWidth = signal(0);
  readonly canvasHeight = signal(0);

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
    this.drawHexMap();
  }

  generateMap(): void {
    if (this.form.valid) {
      this.seedService.setSeed(this.form.value.seed);
      this.gameGlobalMapService.generateGlobalMap(this.form.value.size);
    }
  }

  drawHexMap(): void {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    this.canvasWidth.set(this.gameGlobalMapService.globalMap.size * this.tileSize);
    this.canvasHeight.set(this.gameGlobalMapService.globalMap.size * this.tileSize);

    ctx.clearRect(0, 0, this.canvasWidth(), this.canvasHeight());

    this.gameGlobalMapService.globalMap.tiles.forEach((tile) => {
      this.drawTile(ctx, tile, this.tileSize);
    });
  }

  private drawTile(ctx: CanvasRenderingContext2D, tile: GlobalMapTile, tileSize: number): void {
    const spriteSheet = this.spriteSheetLoaderService.getSpriteSheet('Terrain');

    if (spriteSheet) {
      const sprite = spriteSheet.getSprite(tile.terrain);

      if (sprite) {
        ctx.save();

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

        ctx.restore();
      }
    }
  }
}
