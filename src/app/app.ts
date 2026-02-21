import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonBase } from './common/base/common.base';
import { GameConfigService } from './common/services/game-config.service';
import { takeUntil } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App extends CommonBase implements OnInit {
  protected readonly title = signal('tiles-game-playground');

  constructor(private readonly gameConfigService: GameConfigService) {
    super();
  }

  ngOnInit(): void {
    this.gameConfigService.loadDefaults().pipe(takeUntil(this.destroyed$)).subscribe();
  }
}
