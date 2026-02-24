import { Component, ElementRef, ViewChild } from '@angular/core';
import { GameConfigService } from '../../common/services/game-config.service';
import { CommonBase } from '../../common/base/common.base';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-game-local-hexagon-map',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './game-local-hexagon-map.html',
  styleUrl: './game-local-hexagon-map.scss',
})
export class GameLocalHexagonMap extends CommonBase {
  @ViewChild('gameLocalMap') canvasRef!: ElementRef<HTMLCanvasElement>;

  readonly form: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly gameConfigService: GameConfigService,
  ) {
    super();

    this.form = this.fb.group({
      seed: ['Hello, Milo! World is here!', [Validators.required]],
      size: [250, [Validators.required]],
    });
  }

  generateMap(): void {
    console.log('params = ', this.form.value);

    if (this.form.valid) {
      console.log('seed = ', this.form.value.seed);
      console.log('size = ', this.form.value.size);
    }
  }
}
