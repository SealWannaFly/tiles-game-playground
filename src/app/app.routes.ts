import {Routes} from '@angular/router';

export const routes: Routes = [
  {
    path: 'local',
    loadChildren: () => import('./features/game-local-hexagon-map/game-local-routes')
  }
];
