import { Component, computed, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
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
  readonly globalMapDrawable = this.gameGlobalMapService.globalMapTilesArray;

  readonly hexR: number = 32;

  readonly canvasWidth = computed(() => this.gameGlobalMapService.size() * this.hexR * 2);
  readonly canvasHeight = computed(() => this.gameGlobalMapService.size() * this.hexR * 2);

  private readonly HEX_WIDTH = 64;
  private readonly HEX_HEIGHT = 64;

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
    this.gameConfigService.loadTerrains().pipe(takeUntil(this.destroyed$)).subscribe();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.drawHexMap();
  }

  generateMap(): void {
    if (this.form.valid) {
      this.gameGlobalMapService.setSize(this.form.value.size);
    }
  }

  drawHexMap(): void {
    if (!this.gameImagesLoaderService.getImage(GlobalMapTerrain.GRASS)) return;

    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    ctx.clearRect(0, 0, this.canvasWidth(), this.canvasHeight());

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
    canvasRef = this.canvasRef,
  ): void {
    ctx.save();

    ctx.scale(5, 5);

    var img = new Image();

    img.onload = function () {
      ctx.drawImage(img, x, y);
    };

    img.src = `/assets/terrain/grass-terrain.svg?t=${Date.now()}`;

    // ctx.drawImage(image, x, y, this.HEX_WIDTH, this.HEX_HEIGHT);

    ctx.fillText(`${x}:${y}`, x, y + 16);

    ctx.restore();
  }
}
