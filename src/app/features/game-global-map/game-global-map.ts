import { Component, computed, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { GameConfigService } from '../../common/services/game-config.service';
import { CommonBase } from '../../common/base/common.base';
import { GameGlobalMapService } from './services/game-global-map.service';
import { GlobalMapTerrain } from './services/enums/global-map-terrain.enum';
import { GameImagesLoaderService } from '../../common/services/game-images-loader.service';
import { takeUntil } from 'rxjs';
import { isOdd } from '../../common/utils/is-odd.util';

@Component({
  selector: 'app-game-global-map',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './game-global-map.html',
  styleUrl: './game-global-map.scss',
})
export class GameGlobalMap extends CommonBase implements OnInit {
  @ViewChild('gameGlobalMap') canvasRef!: ElementRef<HTMLCanvasElement>;

  readonly seed = this.gameConfigService.seed;
  readonly globalMapDrawable = this.gameGlobalMapService.globalMapDrawable;

  readonly canvasWidth = computed(() => this.gameGlobalMapService.size() * 64);
  readonly canvasHeight = computed(() => this.gameGlobalMapService.size() * 64);
  readonly hexR: number = 32;

  // Параметры для шестигранников (для axial coordinates)
  private readonly HEX_WIDTH = 64;
  private readonly HEX_HEIGHT = 64;
  private readonly HEX_HORIZONTAL_SPACING = this.HEX_WIDTH * 0.75; // 48px
  private readonly HEX_VERTICAL_SPACING = this.HEX_HEIGHT; // 64px

  readonly form: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly gameConfigService: GameConfigService,
    private readonly gameGlobalMapService: GameGlobalMapService,
    private readonly gameImagesLoaderService: GameImagesLoaderService,
  ) {
    super();

    this.form = this.fb.group({
      size: [5, [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.gameImagesLoaderService
      .loadImage(GlobalMapTerrain.GRASS, '/assets/terrain/grass-terrain.svg')
      .pipe(takeUntil(this.destroyed$))
      .subscribe();
  }

  generateMap(): void {
    console.log('params = ', this.form.value);

    if (this.form.valid) {
      console.log('seed = ', this.form.value.seed);
      console.log('seed in numbers = ', this.gameConfigService.numericSeed());
      console.log('size = ', this.form.value.size);

      this.gameGlobalMapService.setSize(this.form.value.size);
    }
  }

  drawHexMap(): void {
    if (!this.gameImagesLoaderService.getImage(GlobalMapTerrain.GRASS)) return;

    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    ctx.clearRect(0, 0, this.canvasWidth(), this.canvasHeight());

    console.log('');

    this.globalMapDrawable().forEach((el) => {
      ctx.fillText(
        `${el.x}:${el.y}`,
        el.x * this.hexR * 2 + (isOdd(el.y) ? this.hexR : 0) - el.x * 6,
        el.y * this.hexR * 1.5 + 8,
      );

      this.drawHexagon(
        ctx,
        el.x * this.hexR * 2 + (isOdd(el.y) ? this.hexR : 0) - el.x * 6,
        el.y * this.hexR * 1.5,
        this.gameImagesLoaderService.getImage(GlobalMapTerrain.GRASS)!,
      );
    });
  }

  private drawHexagon(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    image: HTMLImageElement,
  ): void {
    ctx.save();

    ctx.drawImage(image, x, y, this.HEX_WIDTH, this.HEX_HEIGHT);

    ctx.fillText(`${x}:${y}`, x, y + 16);

    ctx.restore();
  }
}
